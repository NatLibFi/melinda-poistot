import amqp from 'amqplib';
import { readEnvironmentVariable, createTimer, exceptCoreErrors } from '../utils';
import { logger } from '../logger';
import MelindaClient from 'melinda-api-client';
import { readSessionToken } from '../session-crypt';
import { resolveMelindaId } from '../record-id-resolution-service';
import _ from 'lodash';
import { transformRecord } from '../record-transform-service';

const alephUrl = readEnvironmentVariable('ALEPH_URL');
const apiVersion = readEnvironmentVariable('MELINDA_API_VERSION', null);
const minTaskIntervalSeconds = readEnvironmentVariable('MIN_TASK_INTERVAL_SECONDS', 10);
const SLOW_PROCESSING_WAIT_TIME_MS = 10000;

const apiPath = apiVersion !== null ? `/${apiVersion}` : '';

const defaultConfig = {
  endpoint: `${alephUrl}/API${apiPath}`,
  user: '',
  password: ''
};

const AMQP_HOST = readEnvironmentVariable('AMQP_HOST');
const INCOMING_TASK_QUEUE = 'task_queue';
const OUTGOING_TASK_QUEUE = 'task_result_queue';

export function connect() {
  return amqp.connect(`amqp://${AMQP_HOST}`)
    .then(conn => conn.createChannel())
    .then(ch => {
      ch.assertQueue(INCOMING_TASK_QUEUE, {durable: false});
      ch.assertQueue(OUTGOING_TASK_QUEUE, {durable: false});
      ch.prefetch(1);
      startTaskExecutor(ch);
    })
    .catch(error => {
      logger.log('error', `Unable to establish connection to AMQP_HOST: ${AMQP_HOST}`, error);
      throw error;
    });
}

function startTaskExecutor(channel) {

  let waitTimeMs = 0;
  channel.consume(INCOMING_TASK_QUEUE, function(msg) {
    
    logger.log('info', 'record-update-worker: Received task', msg.content.toString());

    logger.log('info', `record-update-worker: Waiting ${waitTimeMs}ms before starting the task.`);
    setTimeout(() => {
      const taskProcessingTimer = createTimer();

      try {
        const task = readTask(msg);
        const {username, password} = readSessionToken(task.sessionToken);

        const client = new MelindaClient({
          ...defaultConfig,
          user: username,
          password: password
        });

        processTask(task, client).then(taskResponse => {
          channel.sendToQueue(OUTGOING_TASK_QUEUE, new Buffer(JSON.stringify(taskResponse)));  
        }).catch(error => {
          
          if (error instanceof RecordProcessingError) {
            logger.log('info', 'record-update-worker: Processing failed:', error.message);
            const failedTask = markTaskAsFailed(error.task, error.message);
            channel.sendToQueue(OUTGOING_TASK_QUEUE, new Buffer(JSON.stringify(failedTask)));   
          } else {
            logger.log('error', 'record-update-worker: Processing failed:', error);
            const failedTask = markTaskAsFailed(task, error.message);
            channel.sendToQueue(OUTGOING_TASK_QUEUE, new Buffer(JSON.stringify(failedTask)));   
          }
         
        }).then(() => {
          const taskProcessingTimeMs = taskProcessingTimer.elapsed();

          logger.log('info', `record-update-worker: Task processed in ${taskProcessingTimeMs}ms.`);

          waitTimeMs = Math.max(0, minTaskIntervalSeconds * 1000 - taskProcessingTimeMs);

          if (waitTimeMs === 0) {
            logger.log('info', `record-update-worker: Processing was slower than MIN_TASK_INTERVAL_SECONDS, forcing wait time to ${SLOW_PROCESSING_WAIT_TIME_MS}ms.`);
            waitTimeMs = SLOW_PROCESSING_WAIT_TIME_MS;
          } 
          
          channel.ack(msg);

        }).catch(error => {
          logger.log('error', error);
        });

      } catch(error) {
        //logger.log('error', 'Dropped invalid task', error);
        const {consumerTag, deliveryTag} = msg;
        logger.log('error', 'record-update-worker: Dropped invalid task', {consumerTag, deliveryTag});
        channel.ack(msg);
        return; 
      }

    }, waitTimeMs);

  });
}

function markTaskAsFailed(task, failedMessage) {
  return _.assign({}, task, {taskFailed: true, failureReason: failedMessage});
}

export function processTask(task, client) {
  const MELINDA_API_NO_REROUTE_OPTS = {handle_deleted: 1};
  const transformOptions = {
    deleteUnusedRecords: task.deleteUnusedRecords
  };

  logger.log('info', 'record-update-worker: Querying for melinda id');
  return findMelindaId(task).then(taskWithResolvedId => {
    logger.log('info', 'record-update-worker: Loading record', taskWithResolvedId.recordId);
    return client.loadRecord(taskWithResolvedId.recordId, MELINDA_API_NO_REROUTE_OPTS).then(response => {
      logger.log('info', 'record-update-worker: Transforming record', taskWithResolvedId.recordId);
      return transformRecord(response, task.lowTag, task.recordIdHints.localId, transformOptions);
    }).then(result => {
      const {record, actions} = result;
      taskWithResolvedId.actions = actions;
      logger.log('info', 'record-update-worker: Updating record', taskWithResolvedId.recordId);
      return client.updateRecord(record).catch(convertMelindaApiClientErrorToError);
    }).then(response => {
      logger.log('info', 'record-update-worker: Updated record', response.recordId);
      taskWithResolvedId.updateResponse = response;
      return taskWithResolvedId;
    }).catch(exceptCoreErrors(error => {
      throw new RecordProcessingError(error.message, taskWithResolvedId);
    }));
  }).catch(exceptCoreErrors(error => {
    if (error instanceof RecordProcessingError) {
      throw error;
    } else {
      throw new RecordProcessingError(error.message, task);
    }
  }));
}

function convertMelindaApiClientErrorToError(melindaApiClientError) {
  if (melindaApiClientError instanceof Error) {
    throw melindaApiClientError;
  } else {
    const message = _.get(melindaApiClientError, 'errors[0].message', 'Unknown melinda-api-client error');
    throw new Error(message);
  }
}

function findMelindaId(task) {

  const { recordIdHints } = task;

  const melindaIdLinks = _.get(recordIdHints, 'links', [])
    .map(link => link.toUpperCase())
    .map(link => link.startsWith('FCC') ? link.substr(3) : link);

  return resolveMelindaId(recordIdHints.melindaId, recordIdHints.localId, task.lowTag, melindaIdLinks)
    .then(recordId => {
      return _.assign({}, task, {recordId});
    });
}

function readTask(msg) {
  return JSON.parse(msg.content.toString());  
}

export function RecordProcessingError(message, task) {
  const temp = Error.call(this, message);
  temp.name = this.name = 'RecordProcessingError';
  this.task = task;
  this.message = temp.message;
}

RecordProcessingError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: RecordProcessingError,
    writable: true,
    configurable: true
  }
});
