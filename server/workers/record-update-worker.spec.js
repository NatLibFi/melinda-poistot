import {expect} from 'chai';
import { processTask } from './record-update-worker';
import sinon from 'sinon';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line

describe('Record update worker', () => {

  const TEST_UPDATE_RESPONSE = 'res';
  const fakeTask = {
    recordIdHints: { melindaId: 3}
  };

  describe('processTask', () => {

    let clientStub;
    let result;



    describe('when everything works', () => {

      beforeEach(() => {
        result = undefined;
        clientStub = createClientStub();
        clientStub.loadRecord.resolves({});
        clientStub.updateRecord.resolves(TEST_UPDATE_RESPONSE);

        return processTask(fakeTask, clientStub).then(res => result = res);
      });

      it('sets the update response to result', () => {
        expect(result.updateResponse).to.eql(TEST_UPDATE_RESPONSE);
      });

      it('keeps the recordId in the response', () => {
        expect(result.recordId).to.equal(3);
      });
    });

    describe('when loading a record fails', () => {
      
      const TEST_LOAD_ERROR = new Error('Error loading record');

      beforeEach(() => {
        result = undefined;
        clientStub = createClientStub();
        clientStub.loadRecord.rejects(TEST_LOAD_ERROR);
        clientStub.updateRecord.resolves(TEST_UPDATE_RESPONSE);

        return processTask(fakeTask, clientStub).then(res => result = res);
      });

      it('keeps the recordId in the response', () => {
        expect(result.recordId).to.equal(3);
      });
      it('sets the error to error message', () => {
        expect(result.error).to.equal(TEST_LOAD_ERROR.message);
      });

    });

    describe('when updating a record fails', () => {
      
      const TEST_UPDATE_ERROR = new Error('Error updating record');

      beforeEach(() => {
        result = undefined;
        clientStub = createClientStub();
        clientStub.loadRecord.resolves({});
        clientStub.updateRecord.rejects(TEST_UPDATE_ERROR);

        return processTask(fakeTask, clientStub).then(res => result = res);
      });

      it('keeps the recordId in the response', () => {
        expect(result.recordId).to.equal(3);
      });
      it('sets the error to error message', () => {
        expect(result.error).to.equal(TEST_UPDATE_ERROR.message);
      });

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
