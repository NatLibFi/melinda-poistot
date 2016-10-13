import amqp from 'amqplib';
import { readEnvironmentVariable } from '../utils';
import { logger } from '../logger';
import MelindaClient from 'melinda-api-client';

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
    const task = readTask(msg);
    logger.log('debug', 'record-update-worker: Received task', task);

    const client = new MelindaClient(defaultConfig);

    client.loadRecord(task.recordId).then(response => {
      console.log(response.toString());

      const transformedRecord = transformRecord(response);

      return client.updateRecord(transformedRecord).then(response => {
        console.log(response);
        task.processed = true;

        channel.sendToQueue(OUTGOING_TASK_QUEUE, new Buffer(JSON.stringify(task)));  

      });



    }).catch(error => {
      console.log(error);
      task.errored = true;
      task.error = error.message;
      channel.sendToQueue(OUTGOING_TASK_QUEUE, new Buffer(JSON.stringify(task)));  

    }).finally(() => {
      channel.ack(msg);
    });

  }, {noAck: false});
}

function readTask(msg) {
  return JSON.parse(msg.content.toString());
}

function transformRecord(record) {
  return record;
}
