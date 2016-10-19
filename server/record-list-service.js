import amqp from 'amqplib';
import { readEnvironmentVariable } from './utils';
import { logger } from './logger';
import _ from 'lodash';
import uuid from 'node-uuid';

const AMQP_HOST = readEnvironmentVariable('AMQP_HOST');
const TASK_QUEUE = 'task_queue';
const JOB_QUEUE = 'job_queue';

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

export function startJob(records, lowTag, sessionToken, userinfo) {
  if (channel === undefined) {
    throw new Error('Queue for sending tasks is not available.');
  }

  channel.assertQueue(TASK_QUEUE, {durable: false});
  channel.assertQueue(JOB_QUEUE, {durable: false});
  
  const jobId = uuid.v4();
  const tasks = records.map(_.partial(createTask, jobId, sessionToken, lowTag));

  // Node 6 has Buffer.from(msg) which should be used
  channel.sendToQueue(JOB_QUEUE, new Buffer(JSON.stringify(createJob(jobId, tasks, userinfo))));  

  tasks.forEach(task => {

    // Node 6 has Buffer.from(msg) which should be used
    channel.sendToQueue(TASK_QUEUE, new Buffer(JSON.stringify(task)));  
  });
  
}

function createTask(jobId, sessionToken, lowTag, recordId) {
  return {
    jobId,
    taskId: uuid.v4(),
    recordId,
    lowTag,
    sessionToken 
  };
}

function createJob(jobId, tasks, userinfo) {
  return {
    jobId,
    taskIdList: tasks.map(task => task.taskId),
    userinfo
  };
}
