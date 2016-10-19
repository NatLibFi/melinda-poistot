import {expect} from 'chai';
import { connect, startJob } from './record-list-service';
import { __RewireAPI__ as AuthProviderRewireAPI } from './record-list-service';
import sinon from 'sinon';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line

describe('Record list service', () => {
  const TEST_RECORD_LIST = [1,2,3];
  let connectionStub;
  let channelStub;

  beforeEach(() => {
    channelStub = {
      assertQueue: sinon.spy(),
      sendToQueue: sinon.spy()
    };

    connectionStub = {
      createChannel: sinon.stub().resolves(channelStub)
    };
    AuthProviderRewireAPI.__Rewire__('amqp', {connect: sinon.stub().resolves(connectionStub) });
  });
  afterEach(() => {
    AuthProviderRewireAPI.__ResetDependency__('amqp');
  });

  describe('startJob', () => {
    beforeEach(() => {
      return connect().then(() => {
        startJob(TEST_RECORD_LIST);
      });
    });

    it('asserts both queues', () => {
      expect(channelStub.assertQueue.callCount).to.equal(2);
    });

    it('sends the job and tasks to the queues', () => {
      expect(channelStub.sendToQueue.callCount).to.equal(4);
    });

  });
});
