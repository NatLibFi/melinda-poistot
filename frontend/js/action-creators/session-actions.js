import * as Cookies from 'js-cookie';
import { exceptCoreErrors, errorIfStatusNot } from '../utils';
import { FetchNotOkError } from '../errors';
import HttpStatus from 'http-status-codes';
import {CREATE_SESSION_START, CREATE_SESSION_ERROR, CREATE_SESSION_SUCCESS, VALIDATE_SESSION_START} from '../constants/action-type-constants';
import { resetState } from './ui-actions';


export function createSessionStart() {
  return { 'type': CREATE_SESSION_START };
}

export function createSessionError(error) {
  return { 'type': CREATE_SESSION_ERROR, error};
}

export function createSessionSuccess(userinfo) {
  return { 'type': CREATE_SESSION_SUCCESS, userinfo };
}

export function validateSession(sessionToken) {
  const sessionBasePath = __DEV__ ? 'http://localhost:3001/session': '/session';

  return function(dispatch) {

    if (sessionToken === undefined) {
      return;
    }

    dispatch(validateSessionStart());

    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ sessionToken }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    };

    return fetch(`${sessionBasePath}/validate`, fetchOptions)
      .then(errorIfStatusNot(HttpStatus.OK))
      .then(response => response.json())
      .then(json => {

        dispatch(createSessionSuccess(json.userinfo));

      }).catch(() => {
        Cookies.remove('sessionToken');
      });
  };
}


export function validateSessionStart() {
  return { 'type': VALIDATE_SESSION_START };
}

export function removeSession() {
  return function(dispatch) {
    Cookies.remove('sessionToken');
    dispatch(resetState());
  };
}

export const startSession = (function() {
  const sessionBasePath = __DEV__ ? 'http://localhost:3001/session': '/session';

  return function(username, password) {

    return function(dispatch) {

      dispatch(createSessionStart());

      const fetchOptions = {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
      };

      return fetch(`${sessionBasePath}/start`, fetchOptions)
        .then(errorIfStatusNot(HttpStatus.OK))
        .then(response => response.json())
        .then(json => {

          const sessionToken = json.sessionToken;
          Cookies.set('sessionToken', sessionToken);
          dispatch(createSessionSuccess(json.userinfo));

        }).catch(exceptCoreErrors((error) => {

          if (error instanceof FetchNotOkError) {
            switch (error.response.status) {
            case HttpStatus.BAD_REQUEST: return dispatch(createSessionError('Syötä käyttäjätunnus ja salasana'));
            case HttpStatus.UNAUTHORIZED: return dispatch(createSessionError('Käyttäjätunnus ja salasana eivät täsmää'));
            case HttpStatus.INTERNAL_SERVER_ERROR: return dispatch(createSessionError('Käyttäjätunnuksen tarkastuksessa tapahtui virhe. Yritä hetken päästä uudestaan.'));
            }
          }

          dispatch(createSessionError('There has been a problem with operation: ' + error.message));
        }));
    };
  };
})();
