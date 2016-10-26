import {expect} from 'chai';
import * as actions from '../action-creators/job-configuration-actions';
import reducer from '../root-reducer';

describe('job configuration reducer', () => {

  describe('on SET_SELECTED_LOW_TAG', () => {
    let state;
    beforeEach(() => {
      state = reducer(undefined, actions.setSelectedLowTag('TEST'));
    });
    it('sets the lowtag', () => {
      expect(state.getIn(['jobconfig', 'lowtag'])).to.eql('TEST');
    });
  });
  
  describe('on SET_DELETE_OPTION', () => {
    let state;
    beforeEach(() => {
      state = reducer(undefined, actions.setDeleteOption(true));
    });
    it('sets the delete unused records option', () => {
      expect(state.getIn(['jobconfig', 'deleteUnusedRecords'])).to.eql(true);
    });
  });
  
  describe('on SET_RECORD_ID_LIST', () => {
    let state;
    beforeEach(() => {
      state = reducer(undefined, actions.setRecordIdList([1,2]));
    });
    it('sets the rawRecordIdRows', () => {
      expect(state.getIn(['jobconfig', 'rawRecordIdRows'])).to.eql([1,2]);
    });
  });
  
  describe('on SUBMIT_JOB_FAIL', () => {
    let state;
    beforeEach(() => {
      state = reducer(undefined, actions.submitJobFailure(new Error('failed to submit job')));
    });
    it('sets the submitStatus', () => {
      expect(state.getIn(['jobconfig', 'submitStatus'])).to.eql('FAILED');
    });
    it('sets the submitJobError', () => {
      expect(state.getIn(['jobconfig', 'submitJobError']).message).to.eql('failed to submit job');
    });
  });

});
