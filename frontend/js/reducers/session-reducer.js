import { Map } from 'immutable';
import {CREATE_SESSION_START, CREATE_SESSION_ERROR, CREATE_SESSION_SUCCESS, VALIDATE_SESSION_START} from '../constants/action-type-constants';

const INITIAL_STATE = Map({
  state: 'NO_SESSION',
  userinfo: undefined,
  error: undefined
});

export default function session(state = INITIAL_STATE, action) {
  switch (action.type) {
  case CREATE_SESSION_START:
    return createSessionStart(state);
  case CREATE_SESSION_ERROR:
    return createSessionError(state, action.error);
  case CREATE_SESSION_SUCCESS:
    return createSessionSuccess(state, action.userinfo);
  case VALIDATE_SESSION_START:
    return validateSessionStart(state);
  }
  return state;
}

export function createSessionStart(state) {
  return state.set('state', 'SIGNIN_ONGOING');
}

export function createSessionError(state, error) {
  return state
    .set('state', 'SIGNIN_ERROR')
    .set('error', error);
}

export function createSessionSuccess(state, userinfo) {
  return state
    .set('state', 'SIGNIN_OK')
    .set('userinfo', userinfo);
}

export function validateSessionStart(state) {
  return state
    .set('state', 'VALIDATION_ONGOING');
}
