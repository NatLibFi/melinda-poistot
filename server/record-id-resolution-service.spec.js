import {expect} from 'chai';
import { resolveMelindaId } from './record-id-resolution-service';
import { __RewireAPI__ as RewireAPI } from './record-id-resolution-service';
import sinon from 'sinon';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line

describe('Record list service', () => {  
  let fetchStub;
  let isRecordValidStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
    isRecordValidStub = sinon.stub();
    RewireAPI.__Rewire__('fetch', fetchStub);
    RewireAPI.__Rewire__('isRecordValid', isRecordValidStub);
  });
  afterEach(() => {
    RewireAPI.__ResetDependency__('fetch');
    RewireAPI.__ResetDependency__('isRecordValid');
  });

  describe('resolveMelindaId', () => {

    describe('when only result is found from sida index', () => {

      let result;

      beforeEach(() => {

        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(createFindResponse());
        textBodyReadStub.onCall(1).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        textBodyReadStub.onCall(2).resolves(createPresentResponse(2));
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(undefined, 123, 'TEST-LOW', [111]).then(res => result = res);
      });

      it('resolves the melinda id correctly', () => {
        expect(result).to.equal('2');
      });

    });
    
    describe('when only result is found from middr index', () => {

      let result;

      beforeEach(() => {

        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        textBodyReadStub.onCall(1).resolves(createFindResponse());
        textBodyReadStub.onCall(2).resolves(createPresentResponse(2));
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(undefined, 123, 'TEST-LOW', [111]).then(res => result = res);
      });

      it('resolves the melinda id correctly', () => {
        expect(result).to.equal('2');
      });

    });

    describe('when multiple results are found from sida index', () => {

      let result;
      let error;

      beforeEach(() => {
        error = undefined;
        result = undefined;
        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(createFindResponse());
        textBodyReadStub.onCall(1).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        textBodyReadStub.onCall(2).resolves(createPresentResponse(2, 3));
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(undefined, 123, 'TEST-LOW', [111]).then(res => result = res).catch(err => error = err);
      });

      it('rejects with an error', () => {
        expect(error).to.be.instanceof(Error);
      });

      it('does not set result', () => {
        expect(result).to.equal(undefined);
      });

      it('has proper error message', () => {
        expect(error.message).to.equal('Resolved into multiple records: 2, 3');
      });

    });


    describe('when multiple results are found from middr index', () => {

      let result;
      let error;

      beforeEach(() => {
        error = undefined;
        result = undefined;
        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        textBodyReadStub.onCall(1).resolves(createFindResponse());
        textBodyReadStub.onCall(2).resolves(createPresentResponse(2, 3));
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(undefined, 123, 'TEST-LOW', [111]).then(res => result = res).catch(err => error = err);
      });

      it('rejects with an error', () => {
        expect(error).to.be.instanceof(Error);
      });
      
      it('does not set result', () => {
        expect(result).to.equal(undefined);
      });

      it('has proper error message', () => {
        expect(error.message).to.equal('Resolved into multiple records: 2, 3');
      });

    });

    describe('when sida and middr index and direct query resolve into multiple different ids', () => {

      let error;

      beforeEach(() => {
        error = undefined;
        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(createFindResponse());
        textBodyReadStub.onCall(1).resolves(createFindResponse());
        textBodyReadStub.onCall(2).resolves(createPresentResponse(2));
        textBodyReadStub.onCall(3).resolves(createPresentResponse(3));
        isRecordValidStub.withArgs(111).resolves(true);
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(undefined, 123, 'TEST-LOW', [111]).catch(err => error = err);
      });

      it('rejects with an error', () => {
        expect(error).to.be.instanceof(Error);
      });

      it('has proper error message', () => {
        expect(error.message).to.equal('Resolved into multiple records: 2, 3, 111');
      });

    });

    describe('when sida and middr index resolve into multiple but same ids', () => {

      let result;
    
      beforeEach(() => {
        result = undefined;
        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(createFindResponse());
        textBodyReadStub.onCall(1).resolves(createFindResponse());
        textBodyReadStub.onCall(2).resolves(createPresentResponse(2));
        textBodyReadStub.onCall(3).resolves(createPresentResponse(2));
        isRecordValidStub.withArgs('2').resolves(true);
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(undefined, 123, 'TEST-LOW', ['2']).then(res => result = res);
      });

      it('resolves the melinda id correctly', () => {
        expect(result).to.equal('2');
      });

    });


    describe('when match is not found from middr index', () => {

      let result;
      const melinda_id_param = 234234;

      beforeEach(() => {
        result = undefined;
        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        textBodyReadStub.onCall(1).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(melinda_id_param, 123, 'TEST-LOW', [111]).then(res => result = res);
      });

      
      it('defaults to melinda id', () => {
        expect(result).to.equal(melinda_id_param);
      });

    });

    describe('when match is only found directly from melinda', () => {

      let result;
      const melinda_id_param = undefined;

      beforeEach(() => {
        result = undefined;
        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        textBodyReadStub.onCall(1).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        isRecordValidStub.withArgs(111).resolves(true);

        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(melinda_id_param, 123, 'TEST-LOW', [111]).then(res => result = res);
      });

      it('resolves the melinda id correctly', () => {
        expect(result).to.equal(111);
      });

    });

    describe('when match is not found from middr or sida index nor directly from melinda and melindaId is undefined', () => {

      let error;
      const melinda_id_param = undefined;

      beforeEach(() => {
        error = undefined;
        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        textBodyReadStub.onCall(1).resolves(FAKE_ALEPH_EMPTYSET_RESPONSE);
        isRecordValidStub.withArgs(111).resolves(false);
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(melinda_id_param, 123, 'TEST-LOW', [111]).catch(err => error = err);
      });

      it('rejects with an error', () => {
        expect(error).to.be.instanceof(Error);
      });

      it('has proper error message', function() {
        expect(error.message).to.equal('Resolved into 0 records.');
      });

    });

    describe('when unexpected error is returned', () => {

      let error;
      const melinda_id_param = undefined;

      beforeEach(() => {
        error = undefined;
        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(FAKE_ALEPH_UNEXPECTED_ERROR);
        textBodyReadStub.onCall(1).resolves(createFindResponse());
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(melinda_id_param, 123, 'TEST-LOW', [111]).catch(err => error = err);
      });

      it('rejects with an error', () => {
        expect(error).to.be.instanceof(Error);
      });

      it('has proper error message', function() {
        expect(error.message).to.equal('TEST-ERROR');
      });

    });


    describe('when melinda id and all links are undefined', () => {

      const melinda_id_param = undefined;
      const links_param = [];
      let result;

      beforeEach(() => {
        const textBodyReadStub = sinon.stub();
        textBodyReadStub.onCall(0).resolves(createFindResponse());
        textBodyReadStub.onCall(1).resolves(createPresentResponse(2));
        
        fetchStub.resolves({
          text: textBodyReadStub
        });

        return resolveMelindaId(melinda_id_param, 123, 'TEST-LOW', links_param).then(res => result = res);
      });

      it('calls fetch only for sida index', () => {
        expect(fetchStub.callCount).to.equal(2);
        expect(isRecordValidStub.callCount).to.equal(0);
      });
      
      it('resolves the melinda id correctly', () => {
        expect(result).to.equal('2');
      });




    });

  });
});



const FAKE_ALEPH_UNEXPECTED_ERROR = `
<?xml version = "1.0" encoding = "UTF-8"?>
<find>
<error>TEST-ERROR</error>
</find>`;

const FAKE_ALEPH_EMPTYSET_RESPONSE = `
<?xml version = "1.0" encoding = "UTF-8"?>
<find>
<error>empty set</error>
</find>`;

function createFindResponse() {
  return `
<?xml version = "1.0" encoding = "UTF-8"?>
<find>
<set_number>000098</set_number>
<no_records>000000015</no_records>
<no_entries>000000015</no_entries>
</find>`;
}

function createPresentResponse(...ids) {
 
  const records = ids.map(id => `<record><doc_number>${id}</doc_number></record>`);
  
  return `
<?xml version = "1.0" encoding = "UTF-8"?>
<present>${records}
</present>`;
}
