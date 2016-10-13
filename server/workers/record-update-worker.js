import amqp from 'amqplib';
import { readEnvironmentVariable } from '../utils';
import { logger } from '../logger';
import MelindaClient from 'melinda-api-client';
import { readSessionToken } from '../session-crypt';

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
    logger.log('debug', 'record-update-worker: Received task', msg.content.toString());

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
        logger.log('debug', 'record-update-worker: error ', taskError);
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

export function processTask (task, client) {

  logger.log('debug', 'record-update-worker: Loading record ', task.recordId);
  return client.loadRecord(task.recordId).then(response => {

    logger.log('debug', 'record-update-worker: Transforming record ', task.recordId);
    const transformedRecord = transformRecord(response);
    logger.log('debug', 'record-update-worker: Updating record ', task.recordId);
    return client.updateRecord(transformedRecord).then(response => {
      logger.log('debug', 'record-update-worker: Updated record ', response.recordId);
      task.updateResponse = response;
      return task;
    });

  }).catch(error => {
    logger.log('debug', 'record-update-worker: error ', error);
    task.error = error.message;
    return task;
  });
}

function readTask(msg) {
  return JSON.parse(msg.content.toString());  
}

function transformRecord(record) {
  return record;
}
