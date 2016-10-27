import {expect} from 'chai';
import { transformRecord } from './record-transform-service';
import { FAKE_RECORD_FCC_SID, FAKE_RECORD, FAKE_DELETED_RECORD, FAKE_RECORD_SID_LOW, FAKE_RECORD_FOR_CLEANUP, FAKE_RECORD_ONLY_LOW_TEST, FAKE_RECORD_2_LOW } from './test_helpers/fake-data';
import { exceptCoreErrors } from 'server/utils';

describe('Record transform service', () => {

  const LIBRARY_TAG = 'test';
  const EXPECTED_LOCAL_ID = 111;

  describe('transformRecord', () => {
    let result;
    let error;
    beforeEach(() => {
      result = undefined;
      error = undefined;
    });

    it('returns a thenable', () => {
      const returnValue = transformRecord(FAKE_RECORD, LIBRARY_TAG, EXPECTED_LOCAL_ID);
      expect(returnValue.then).to.be.a('function');
      expect(returnValue.catch).to.be.a('function');
    });

    describe('when record is already deleted', () => {
      beforeEach(() => {
        return transformRecord(FAKE_DELETED_RECORD, LIBRARY_TAG, EXPECTED_LOCAL_ID)
          .then(res => result = res)
          .catch(err => error = err);
      });

      it('should reject with error', () => {
        expect(error.message).to.equal('The record is deleted.');
      });

    });

    describe('when localId is not provided', () => {
    
      beforeEach(() => {
        return transformRecord(FAKE_RECORD_SID_LOW, LIBRARY_TAG, undefined)
          .then(res => result = res)
          .catch(exceptCoreErrors(err => error = err));
      });

      it('should remove the LOW field', () => {
        expect(result.record.getFields('LOW', 'a', LIBRARY_TAG).map(fieldAsString)).not.to.include('LOW $aTEST');
      });

      it('returned report should contain the information of the LOW removal', () => {
        expect(result.report).to.include('Removed LOW: TEST');
      });
    });


    describe('when record has SID_b with local library tag, but no SID_c with expected local record id', () => {
      const UNEXPECTED_LOCAL_ID = 123;
      beforeEach(() => {
        return transformRecord(FAKE_RECORD_SID_LOW, LIBRARY_TAG, UNEXPECTED_LOCAL_ID)
          .then(res => result = res)
          .catch(err => error = err);
      });

      it('shoud reject with error', () => {
        expect(error.message).to.equal('The record has unexpected SIDc value.');
      });
    });

    describe('when record has SID_b with local library tag, and SID_c contains FCC field', () => {
      beforeEach(() => {
        return transformRecord(FAKE_RECORD_FCC_SID, LIBRARY_TAG, EXPECTED_LOCAL_ID)
          .then(res => result = res)
          .catch(err => error = err);
      });

      it('should not reject with an error', () => {
        expect(error).to.equal(undefined);
      });
      it('shoud not change the record', () => {
        expect(result.record.toString()).to.eql(FAKE_RECORD_FCC_SID.toString());
      });
    });

    describe('when record has local SID with expected local id', () => {
    
      beforeEach(() => {
        return transformRecord(FAKE_RECORD_SID_LOW, LIBRARY_TAG, EXPECTED_LOCAL_ID)
          .then(res => result = res)
          .catch(err => error = err);
      });

      it('should remove the SID field', () => {
        expect(result.record.getFields('SID', 'b', LIBRARY_TAG).map(fieldAsString)).not.to.include('SID $btest$c111');
      });

      it('returned report should contain the information of the SID removal', () => {
        expect(result.report).to.include('Removed SID: test');
      });
    });

    describe('when record has a LOW field with local library tag', () => {
    
      beforeEach(() => {
        return transformRecord(FAKE_RECORD_SID_LOW, LIBRARY_TAG, EXPECTED_LOCAL_ID)
          .then(res => result = res)
          .catch(err => error = err);
      });

      it('should remove the LOW field', () => {
        expect(result.record.getFields('LOW', 'a', LIBRARY_TAG).map(fieldAsString)).not.to.include('LOW $aTEST');
      });

      it('returned report should contain the information of the LOW removal', () => {
        expect(result.report).to.include('Removed LOW: TEST');
      });
    });

    describe('when the record does not have a LOW field with library tag', () => {
      beforeEach(() => {
        return transformRecord(FAKE_RECORD_FCC_SID, LIBRARY_TAG, EXPECTED_LOCAL_ID)
          .then(res => result = res)
          .catch(err => error = err);
      });

      it('should report that the record did not contain low tag', () => {
        expect(result.report).to.include('Record did not have LOW tag.');
      });
    });

    describe('when delete unsued records option is true', () => {
      const opts = { deleteUnusedRecords: true };
      
      describe('when a record has none of the following fields left: LOW/850/852/866', () => {
        
        beforeEach(() => {
          return transformRecord(FAKE_RECORD_ONLY_LOW_TEST, LIBRARY_TAG, EXPECTED_LOCAL_ID, opts)
            .then(res => result = res)
            .catch(err => error = err);
        });

        it('should be deleted', () => {
          expect(result.record.isDeleted()).to.equal(true);
        });

        it('should report the taken action', () => {
          expect(result.report).to.include('Record was deleted.');
        });
      });

      describe('when record still has some LOW fields left', () => {
        beforeEach(() => {
          return transformRecord(FAKE_RECORD_2_LOW, LIBRARY_TAG, EXPECTED_LOCAL_ID, opts)
            .then(res => result = res)
            .catch(err => error = err);
        });
        it('should not be deleted', () => {
          expect(result.record.isDeleted()).not.to.equal(true);
        });
      });


    });

    describe('cleanup record after operation', () => {
      beforeEach(() => {    
        return transformRecord(FAKE_RECORD_FOR_CLEANUP, LIBRARY_TAG, EXPECTED_LOCAL_ID)
          .then(res => result = res)
          .catch(exceptCoreErrors(err => error = err));
      });

      it('removes all fields that have single $5 with given library tag', () => {
        expect(result.record.getFields('300').map(fieldAsString)).to.eql([]);
      });

      it('removes all $5 with given library tag from fields that have multiple $5', () => { 
        expect(result.record.getFields('301').map(fieldAsString)).to.eql(['301 $aSub-A$5TEST-2']);
      });

      it('removes $9 from all felds that contain ($9 LOW <KEEP>, $9 LOW <DROP>)', () => { 
        expect(result.record.getFields('100').map(fieldAsString)).to.eql(['100 $aTest Author$9TEST-2 <KEEP>']);
        expect(result.record.getFields('245').map(fieldAsString)).to.eql(['245 $aSome content']);
      });
      
      it('reports the field removals', () => { 
        expect(result.report).to.include('Removed field 300');
      });
      
      it('reports the subfield $5 removals', () => { 
        expect(result.report).to.include('Removed subfield 5 with value TEST from field 301');
      });
      
      it('reports the subfield $9 <KEEP> removals', () => { 
        expect(result.report).to.include('Removed subfield 9 with value TEST <KEEP> from field 100');
      });
      
      it('reports the subfield $9 <DROP> removals', () => { 
        expect(result.report).to.include('Removed subfield 9 with value TEST <DROP> from field 245');
      });
      
    });
    
  });
});

function fieldAsString(field) {
  const {  tag, subfields, value } = field;
  if (subfields) {
    const subfieldStr = subfields.map(sub => `$${sub.code}${sub.value}`).join('');
    return `${tag} ${subfieldStr}`;  
  } else {
    return `${tag} ${value}`;
  }  
}