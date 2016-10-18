import sinon from 'sinon';
import { expect } from 'chai';
import ResultWorker from './result-worker';
import { __RewireAPI__ as ComponentRewriteApi } from './result-worker';

describe.only('result worker', function() {
  let resultWorker;
  beforeEach(() => {
    resultWorker = new ResultWorker();
  });

  let job1 = createMessage({
    jobId: 'job-1-id',
    taskIdList: [11,12]
  });

  let job2 = createMessage({
    jobId: 'job-2-id',
    taskIdList: [21,22]
  });

  let task11 = createMessage({jobId:'job-1-id',taskId:11});
  let task12 = createMessage({jobId:'job-1-id',taskId:12});
  let task21 = createMessage({jobId:'job-2-id',taskId:21});
  let task22 = createMessage({jobId:'job-2-id',taskId:22});


  describe('handleIncomingTaskResult', function() {

  });


  describe('when job is not finished', function() {
    let channel;
    beforeEach(() => {
      channel = {
        ack: sinon.spy()
      };

      resultWorker.handleIncomingJob(channel, job1);
      resultWorker.handleIncomingTaskResult(channel, task11);
    });

    it('does not call ack for any message', function() {
      expect(channel.ack.callCount).to.equal(0);
    });
    it('adds job to currentJobs', () => {
      expect(Array.from(resultWorker.currentJobs.keys())).to.include('job-1-id');
    });
  });

  describe('when job is finished', function() {
    let channel;
    beforeEach(() => {
      channel = {
        ack: sinon.spy()
      };

      resultWorker.handleIncomingJob(channel, job1);
      resultWorker.handleIncomingTaskResult(channel, task11);
      resultWorker.handleIncomingTaskResult(channel, task12);

    });

    it('calls ack for all results and for the whole job', function() {
      expect(channel.ack.callCount).to.equal(3);
    });
    it('removes the job from currentJobs', () => {
      expect(Array.from(resultWorker.currentJobs.keys())).not.to.include('job-1-id');
    });
    it('removes the job from completeJobs', () => {
      expect(Object.keys(resultWorker.completeJobs)).not.to.include('job-1-id');
    });

  });


  describe('when results come before job definition', function() {
    let channel;
    beforeEach(() => {
      channel = {
        ack: sinon.spy()
      };

      resultWorker.handleIncomingTaskResult(channel, task11);
      resultWorker.handleIncomingTaskResult(channel, task12);
      resultWorker.handleIncomingTaskResult(channel, task22);

    });

    it('does not call ack for any message', function() {
      expect(channel.ack.callCount).to.equal(0);
    });

    describe('when job def comes', () => {
      beforeEach(() => {
        resultWorker.handleIncomingJob(channel, job1);
      });
      it('calls ack for all results and for the whole job', function() {
        expect(channel.ack.callCount).to.equal(3);
      });
      it('removes the job from currentJobs', () => {
        expect(Array.from(resultWorker.currentJobs.keys())).not.to.include('job-1-id');
      });
      it('removes the job from completeJobs', () => {
        expect(Object.keys(resultWorker.completeJobs)).not.to.include('job-1-id');
      });
      it('removes the tasks from orphan tasks', () => {
        expect(resultWorker.orphanResults.map(r => r.taskId)).not.to.include(11);
        expect(resultWorker.orphanResults.map(r => r.taskId)).not.to.include(12);
      });
      it('keeps the orphan tasks that are not related to completed job', () => {
        expect(resultWorker.orphanResults.map(r => r.taskId)).to.eql([22]);
      });
    });

  });


});

function createMessage(obj) {
  return {content: JSON.stringify(obj) };
}
