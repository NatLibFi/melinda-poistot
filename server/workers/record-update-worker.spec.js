import {expect} from 'chai';
import { processTask } from './record-update-worker';
import { __RewireAPI__ as ComponentRewireAPI } from './record-update-worker';
import sinon from 'sinon';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line

describe('Record update worker', () => {

  const TEST_UPDATE_RESPONSE = 'res'

  describe('processTask', () => {

    let clientStub;
    let result;

    beforeEach(() => {
      clientStub = createClientStub();
      clientStub.loadRecord.resolves({})
      clientStub.updateRecord.resolves(TEST_UPDATE_RESPONSE)

      return processTask({recordId: 3}, clientStub).then(res => result = res);
    });

    it('sets the update response to result', () => {
      expect(result.updateResponse).to.eql(TEST_UPDATE_RESPONSE);
    });

    it('keeps the recordId in the response', () => {
      expect(result.recordId).to.equal(3);
    });


  });
});

function createClientStub() {
  return {
    loadRecord: sinon.stub(),
    updateRecord: sinon.stub(),
    createRecord: sinon.stub()
  };
}