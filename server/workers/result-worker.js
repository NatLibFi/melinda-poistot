import amqp from 'amqplib';
import { readEnvironmentVariable } from '../utils';
import { logger } from '../logger';
import _ from 'lodash';

const AMQP_HOST = readEnvironmentVariable('AMQP_HOST');
const INCOMING_TASK_RESULT_QUEUE = 'task_result_queue';
const INCOMING_JOB_QUEUE = 'job_queue';

export default class ResultWorker {
  constructor() {
    this.orphanResults = [];
    this.currentJobs = new Map();
    this.completeJobs = {};
  }

  connect() {
    return amqp.connect(`amqp://${AMQP_HOST}`)
      .then(conn => conn.createChannel())
      .then(ch => {
        ch.assertQueue(INCOMING_TASK_RESULT_QUEUE, {durable: false});
        ch.assertQueue(INCOMING_JOB_QUEUE, {durable: false});
        this.startTaskExecutor(ch);
      })
      .catch(error => {
        logger.log('error', `Unable to establish connection to AMQP_HOST: ${AMQP_HOST}`, error);
        throw error;
      });
  }


  startTaskExecutor(channel) {
    channel.consume(INCOMING_JOB_QUEUE, _.partial(this.handleIncomingJob, channel));
    channel.consume(INCOMING_TASK_RESULT_QUEUE, _.partial(this.handleIncomingTaskResult, channel));
  }

  handleIncomingTaskResult(channel, msg) {
    logger.log('debug', 'result-worker: Received task', msg.content.toString());

    try {
      const taskResult = readTask(msg);

      const {jobId} = taskResult;
      let jobAggregate = this.currentJobs.get(jobId);
      if (jobAggregate === undefined) {
        this.orphanResults.push(taskResult);
      } else {
        this.markTaskCompleted(channel, jobAggregate, taskResult);
      }

    } catch(error) {
      logger.log('error', 'Dropped invalid task result', msg, error);
      channel.ack(msg);
      return; 
    }
  }

  handleIncomingJob(channel, msg) {
    try {
      const job = readJob(msg);

      const {jobId, taskIdList} = job;
      logger.log('debug', 'result-worker: Job started ', jobId);

      let jobAggregate = this.currentJobs.get(jobId);
      if (jobAggregate === undefined) {
        jobAggregate = {
          job: job,
          msg: msg,
          inCompleteTasks: new Map()
        };
        this.currentJobs.set(jobId, jobAggregate);
      }

      taskIdList.forEach(taskId => {
        jobAggregate.inCompleteTasks.set(taskId, true);
      });

      this.orphanResults.filter(taskResult => taskResult.jobId == jobId).forEach(taskResult => {
        this.markTaskCompleted(channel, jobAggregate, taskResult);
      });
      // TODO: Improve with reduce
      this.orphanResults = this.orphanResults.filter(taskResult => taskResult.jobId !== jobId);


    } catch(error) {
      logger.log('error', 'Dropped invalid task', msg, error);
      channel.ack(msg);
      return; 
    }

  }

  markTaskCompleted(channel, jobAggregate, taskResult) {
    const {jobId, taskId} = taskResult;
    logger.log('debug', 'result-worker: Task complete ', jobId, taskId);
    jobAggregate.inCompleteTasks.delete(taskId);
    if (this.completeJobs[jobId] === undefined) {
      this.completeJobs[jobId] = [];
    }
    this.completeJobs[jobId].push(taskResult);
    if (jobAggregate.inCompleteTasks.size === 0) {

      logger.log('debug', 'result-worker: Job complete ', jobId);

      channel.ack(jobAggregate.msg);
      this.completeJobs[jobId].forEach(taskResult => {
        channel.ack(taskResult.msg);
      });

      dispatchEmail(jobId, jobAggregate.email, this.completeJobs[jobId]);
   
      delete(this.completeJobs[jobId]);
      this.currentJobs.delete(jobId);
    }

  }
}

function dispatchEmail(jobId, emailAddress, taskResults) {
  logger.log('info', `Sending results of job ${jobId} to ${emailAddress}`);
  logger.log('info', taskResults);
}

function readTask(msg) {
  return JSON.parse(msg.content.toString());  
}

function readJob(msg) {
  return JSON.parse(msg.content.toString());  
}
