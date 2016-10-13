import amqp from 'amqplib';
import { readEnvironmentVariable } from './utils';
import { logger } from './logger';
import _ from 'lodash';

const AMQP_HOST = readEnvironmentVariable('AMQP_HOST');
const TASK_QUEUE = 'task_queue';

let channel;
export function connect() {
  return amqp.connect(`amqp://${AMQP_HOST}`)
    .then(conn => conn.createChannel())
    .then(ch => channel = ch)
    .catch(error => {
      logger.log('error', `Unable to establish connection to AMQP_HOST: ${AMQP_HOST}`, error);
      throw error;
    });
}

export function startJob(records, lowTag, sessionToken) {
  if (channel === undefined) {
    throw new Error('Queue for sending tasks is not available.');
  }

  channel.assertQueue(TASK_QUEUE, {durable: false});
  
  const tasks = records.map(_.partial(createTask, sessionToken, lowTag));
  tasks.forEach(task => {

    // Node 6 has Buffer.from(msg) which should be used
    channel.sendToQueue(TASK_QUEUE, new Buffer(JSON.stringify(task)));  
  });
  
}

function createTask(sessionToken, lowTag, recordId) {
  return {
    recordId,
    lowTag,
    sessionToken 
  };
}
