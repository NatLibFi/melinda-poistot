import amqp from 'amqplib';
import { readEnvironmentVariable, getMelindaLoadUserByLowtag } from 'server/utils';
import { logger } from 'server/logger';
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

export function startJob(records, lowTag, deleteUnusedRecords, replicateRecords, sessionToken, userinfo) {
  if (channel === undefined) {
    throw new Error('Queue for sending tasks is not available.');
  }

  if (!replicateRecords) {
    const loadUser = getMelindaLoadUserByLowtag(lowTag);
    if (loadUser === undefined) {
      throw new Error(`ReplicateRecords was set to ${replicateRecords}, but no load user was found for LOW: ${lowTag}`);
    }
    logger.log('info', `replicateRecords=${replicateRecords}, exchanging the sessionToken to ${loadUser.username}`);
    sessionToken = loadUser.sessionToken;
  }

  const bypassSIDdeletion = replicateRecords;
  
  channel.assertQueue(TASK_QUEUE, {durable: true});
  channel.assertQueue(JOB_QUEUE, {durable: true});
  
  const jobId = uuid.v4();
  const tasks = records.map(_.partial(createTask, jobId, sessionToken, lowTag, deleteUnusedRecords, bypassSIDdeletion));
  
  const jobPayload = new Buffer(JSON.stringify(createJob(jobId, tasks, userinfo)));
  // Node 6 has Buffer.from(msg) which should be used
  channel.sendToQueue(JOB_QUEUE, jobPayload, {persistent: true});

  tasks.forEach(task => {

    // Node 6 has Buffer.from(msg) which should be used
    channel.sendToQueue(TASK_QUEUE, new Buffer(JSON.stringify(task)), {persistent: true});
  });
  
}

function createTask(jobId, sessionToken, lowTag, deleteUnusedRecords, bypassSIDdeleteion, recordIdHints) {
  return {
    jobId,
    taskId: uuid.v4(),
    recordIdHints,
    lowTag,
    sessionToken,
    deleteUnusedRecords,
    bypassSIDdeletion
  };
}

function createJob(jobId, tasks, userinfo) {
  return {
    jobId,
    taskIdList: tasks.map(task => task.taskId),
    userinfo
  };
}
