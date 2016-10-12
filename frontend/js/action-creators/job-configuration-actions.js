import {SET_SELECTED_LOW_TAG, SET_RECORD_ID_LIST, SUBMIT_JOB_START, SUBMIT_JOB_SUCCESS, SUBMIT_JOB_FAIL} from '../constants/action-type-constants';

export function setSelectedLowTag(lowtag) {
  return { 'type': SET_SELECTED_LOW_TAG, lowtag };
}

export function setRecordIdList(list) {
  return { 'type': SET_RECORD_ID_LIST, list };
}

export function submitJobStarted() {
  return { 'type': SUBMIT_JOB_START };
}
export function submitJobSuccess() {
  return { 'type': SUBMIT_JOB_SUCCESS };
}
export function submitJobFailure() {
  return { 'type': SUBMIT_JOB_FAIL };
}

export function submitJob() {
  return function(dispatch) {
    dispatch(submitJobStarted());
  };
}

