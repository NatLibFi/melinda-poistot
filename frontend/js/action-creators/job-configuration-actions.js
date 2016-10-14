import { exceptCoreErrors, errorIfStatusNot } from '../utils';
import { FetchNotOkError } from '../errors';
import HttpStatus from 'http-status-codes';
import { validRecordList } from '../selectors/record-list-selectors';

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
  const recordListBasePath = __DEV__ ? 'http://localhost:3001/records': '/records';

  return function(dispatch, getState) {

    const records = validRecordList(getState());

    dispatch(submitJobStarted());

    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ records }),
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
    };

    return fetch(`${recordListBasePath}/`, fetchOptions)
      .then(errorIfStatusNot(HttpStatus.OK))
      .then(() => {

        dispatch(submitJobSuccess());

      }).catch(exceptCoreErrors((error) => {

        if (error instanceof FetchNotOkError) {
          switch (error.response.status) {
          case HttpStatus.INTERNAL_SERVER_ERROR: return dispatch(submitJobFailure('Tietuelistauksen lähettämisessä tapahtui virhe. Yritä hetken päästä uudestaan.'));
          }
        }

        dispatch(submitJobFailure('There has been a problem with operation: ' + error.message));
      }));

  };
}

