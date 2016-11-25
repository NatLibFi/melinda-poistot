import {ReportEmail} from '../email-template';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import amqp from 'amqplib';
import { readEnvironmentVariable } from 'server/utils';
import { logger } from 'server/logger';
import _ from 'lodash';
import { mail } from '../mailer';

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
        ch.assertQueue(INCOMING_TASK_RESULT_QUEUE, {durable: true});
        ch.assertQueue(INCOMING_JOB_QUEUE, {durable: true});
        this.startTaskExecutor(ch);
      })
      .catch(error => {
        logger.log('error', `Unable to establish connection to AMQP_HOST: ${AMQP_HOST}`, error);
        throw error;
      });
  }

  startTaskExecutor(channel) {
    channel.consume(INCOMING_JOB_QUEUE, _.bind(this.handleIncomingJob, this, channel));
    channel.consume(INCOMING_TASK_RESULT_QUEUE, _.bind(this.handleIncomingTaskResult, this, channel));
  }

  handleIncomingTaskResult(channel, msg) {
    logger.log('debug', 'result-worker: Received task', msg.content.toString());

    try {
      const taskResult = readTaskResult(msg);

      const {jobId} = taskResult;
      let jobAggregate = this.currentJobs.get(jobId);
      if (jobAggregate === undefined) {
        this.orphanResults.push(taskResult);
      } else {
        this.markTaskCompleted(channel, jobAggregate, taskResult);
      }

    } catch(error) {
      const {consumerTag, deliveryTag} = msg;
      logger.log('error', 'Error handling task', {consumerTag, deliveryTag}, error);
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
          inCompleteTasks: new Map(),
          email: job.userinfo.email
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
      logger.log('error', 'Error handling job', msg, error);
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


      channel.ack(jobAggregate.msg);
      this.completeJobs[jobId].forEach(taskResult => {
        channel.ack(taskResult.msg);
      });

      logJobResult(jobId, this.completeJobs[jobId]);
      dispatchEmail(jobId, jobAggregate.email, this.completeJobs[jobId]);
   
      delete(this.completeJobs[jobId]);
      this.currentJobs.delete(jobId);
    }
  }
}

function logJobResult(jobId, taskResults) {
  logger.log('info', 'result-worker: Job complete ', jobId);
  taskResults.forEach(taskResult => {
    const formattedResult = formatTaskResult(taskResult);
    logger.log('info', `${jobId} ${formattedResult}`);
  });
}

function dispatchEmail(jobId, emailAddress, taskResults) {
  logger.log('info', `Sending results of job ${jobId} to ${emailAddress}`);

  const htmlEmailContent = ReactDOMServer.renderToStaticMarkup(<ReportEmail taskResults={taskResults} />);

  mail({
    to: emailAddress,
    subject: `Melinda job ${jobId} completed`,
    html: htmlEmailContent
  }).then(info => {
    logger.log('info', 'message sent', info);
  }).catch(error => {
    logger.log('error', 'Failed to send email', error);
  });
}

function formatTaskResult(taskResult) {
  const {lowTag} = taskResult;
  const recordId = _.get(taskResult, 'recordId', 'ID-NOT-FOUND');
  const localId = _.get(taskResult.recordIdHints, 'localId' ,'');

  if (taskResult.taskFailed) {
    return `${recordId} ${localId} ${lowTag} Error: ${taskResult.failureReason}`;
  } else {
    const report = _.get(taskResult, 'report', []).join(', ');
    const {code, message} = _.head(taskResult.updateResponse.messages);
    return `${recordId} ${localId} ${lowTag} ${code} ${message} ${report}`;
  }
}

function readTaskResult(msg) {
  const taskResult = JSON.parse(msg.content.toString());  
  return {
    msg,
    ...taskResult
  };
}

function readJob(msg) {
  return JSON.parse(msg.content.toString());  
}
