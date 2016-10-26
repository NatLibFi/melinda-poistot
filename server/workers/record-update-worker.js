import amqp from 'amqplib';
import { readEnvironmentVariable } from '../utils';
import { logger } from '../logger';
import MelindaClient from 'melinda-api-client';
import { readSessionToken } from '../session-crypt';
import _ from 'lodash';

const alephUrl = readEnvironmentVariable('ALEPH_URL');
const apiVersion = readEnvironmentVariable('MELINDA_API_VERSION', null);
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
  channel.consume(INCOMING_TASK_QUEUE, function(msg) {
    logger.log('info', 'record-update-worker: Received task', msg.content.toString());

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
        channel.sendToQueue(OUTGOING_TASK_QUEUE, new Buffer(JSON.stringify(taskError)));  
      }).finally(() => {
        channel.ack(msg);
      });

    } catch(error) {
      logger.log('error', 'Dropped invalid task', msg);
      channel.ack(msg);
      return; 
    }

  });
}

export function processTask(task, client) {
  const MELINDA_API_NO_REROUTE_OPTS = {handle_deleted: 1};

  return findMelindaId(task).then(taskWithResolvedId => {
    logger.log('info', 'record-update-worker: Loading record', taskWithResolvedId.recordId);
    return client.loadRecord(taskWithResolvedId.recordId, MELINDA_API_NO_REROUTE_OPTS).then(response => {
      logger.log('info', 'record-update-worker: Transforming record', taskWithResolvedId.recordId);
      return transformRecord(response);
    }).then(transformedRecord => {
      logger.log('info', 'record-update-worker: Updating record', taskWithResolvedId.recordId);
      return client.updateRecord(transformedRecord);
    }).then(response => {
      logger.log('info', 'record-update-worker: Updated record', response.recordId);
      taskWithResolvedId.updateResponse = response;
      return taskWithResolvedId;
    }).catch(error => {
      logger.log('error', 'record-update-worker: error', error);
      taskWithResolvedId.error = error.message;
      return taskWithResolvedId;
    });
  }).catch(error => {
    if (error instanceof InvalidRecordError) {
      logger.log('info', 'record-update-worker: invalid record error', error.message, error.task);
      task.error = error.message;
      return task;  
    } else {
      logger.log('error', 'record-update-worker: error', error);
      task.error = error.message;
      return task;
    }
  });
}

function findMelindaId(task) {
 
  return new Promise((resolve, reject) => {

    const { recordIdHints } = task;
    if (recordIdHints.melindaId) {
      return resolve(_.assign({}, task, {recordId: recordIdHints.melindaId }));
    }

    reject(new InvalidRecordError('Could not determine melinda id for record', task));
  });
}

function readTask(msg) {
  return JSON.parse(msg.content.toString());  
}

function transformRecord(record) {
  return record;
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