import amqp from 'amqplib';
import { readEnvironmentVariable, createTimer } from '../utils';
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
    const taskProcessingTimer = createTimer();
    logger.log('info', 'record-update-worker: Received task', msg.content.toString());

    setTimeout(() => {

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
        }).catch(taskError => {
          logger.log('info', 'record-update-worker: error ', taskError);

          // To prevent sending error objects into the queue.
          taskError.error = taskError.error.message;
          channel.sendToQueue(OUTGOING_TASK_QUEUE, new Buffer(JSON.stringify(taskError)));  
        }).finally(() => {
          const taskProcessingTimeMs = taskProcessingTimer.elapsed();

          logger.log('info', `record-update-worker: Task processed in ${taskProcessingTimeMs}ms.`);

          waitTimeMs = Math.max(0, minTaskIntervalSeconds * 1000 - taskProcessingTimeMs);

          if (waitTimeMs === 0) {
            logger.log('info', `record-update-worker: Processing was slower than MIN_TASK_INTERVAL_SECONDS, waiting ${SLOW_PROCESSING_WAIT_TIME_MS}ms before starting next task.`);
            waitTimeMs = SLOW_PROCESSING_WAIT_TIME_MS;
          } else {
            logger.log('info', `record-update-worker: Waiting ${waitTimeMs}ms before starting next task.`);  
          }
          
          
          channel.ack(msg);

          
        });

      } catch(error) {
        logger.log('error', 'Dropped invalid task', msg);
        channel.ack(msg);
        return; 
      }

    }, waitTimeMs);

  });
}

export function processTask(task, client) {
  const MELINDA_API_NO_REROUTE_OPTS = {handle_deleted: 1};
  const transformOptions = {};

  return findMelindaId(task).then(taskWithResolvedId => {
    logger.log('info', 'record-update-worker: Loading record', taskWithResolvedId.recordId);
    return client.loadRecord(taskWithResolvedId.recordId, MELINDA_API_NO_REROUTE_OPTS).then(response => {
      logger.log('info', 'record-update-worker: Transforming record', taskWithResolvedId.recordId);
      return transformRecord(response, task.lowTag, task.recordIdHints.localId, transformOptions);
    }).then(result => {
      const {record, actions} = result;
      taskWithResolvedId.actions = actions;
      logger.log('info', 'record-update-worker: Updating record', taskWithResolvedId.recordId);
      return client.updateRecord(record);
    }).then(response => {
      logger.log('info', 'record-update-worker: Updated record', response.recordId);
      taskWithResolvedId.updateResponse = response;
      return taskWithResolvedId;
    }).catch(error => {
      logger.log('error', 'record-update-worker: error', error);
      taskWithResolvedId.error = error;
      return taskWithResolvedId;
    });
  }).catch(error => {
    if (error instanceof InvalidRecordError) {
      logger.log('info', 'record-update-worker: invalid record error', error.message, error.task);
      task.error = error;
      return task;  
    } else {
      logger.log('error', 'record-update-worker: error', error);
      task.error = error;
      return task;
    }
  });
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

export function InvalidRecordError(message, task) {
  const temp = Error.call(this, message);
  temp.name = this.name = 'InvalidRecordError';
  this.task = task;
  this.message = temp.message;
}

InvalidRecordError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: InvalidRecordError,
    writable: true,
    configurable: true
  }
});
