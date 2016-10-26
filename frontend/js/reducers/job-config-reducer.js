import { Map } from 'immutable';
import {SET_SELECTED_LOW_TAG, SET_RECORD_ID_LIST, SUBMIT_JOB_START, SUBMIT_JOB_SUCCESS, SUBMIT_JOB_FAIL} from '../constants/action-type-constants';

const INITIAL_STATE = Map({
  rawRecordIdRows: [],
  lowtag: undefined,
  submitStatus: 'NOT_SUBMITTED'
});

export default function session(state = INITIAL_STATE, action) {
  switch (action.type) {
  case SET_SELECTED_LOW_TAG:
    return setLowTag(state, action.lowtag);
  case SET_RECORD_ID_LIST:
    return setRecordIdList(state, action.list);
  case SUBMIT_JOB_START:
    return setSubmitJobStatus(state, 'ONGOING');
  case SUBMIT_JOB_SUCCESS:
    return setSubmitJobStatus(state, 'SUCCESS');
  case SUBMIT_JOB_FAIL:
    return setSubmitJobStatus(state, 'FAILED');
  }
  return state;
}

function setLowTag(state, lowtag) {
  return state.set('lowtag', lowtag);
}

function setRecordIdList(state, list) {
  return state.set('rawRecordIdRows', list); 
}

function setSubmitJobStatus(state, status) {
  return state.set('submitStatus', status);
}