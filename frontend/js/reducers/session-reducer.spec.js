/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for removing references to local databases from Melinda
*
* Copyright (C) 2016-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-local-ref-removal-ui
*
* melinda-local-ref-removal-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-local-ref-removal-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/import {expect} from 'chai';
import * as sessionActions from '../action-creators/session-actions';
import reducer from '../root-reducer';

describe('session reducer', () => {

  describe('on CREATE_SESSION_START', () => {
    let state;
    beforeEach(() => {
      state = reducer(undefined, sessionActions.createSessionStart());
    });
    it('sets the state to SIGNIN_ONGOING', () => {
      expect(state.getIn(['session', 'state'])).to.eql('SIGNIN_ONGOING');
    });
  });

  describe('on CREATE_SESSION_ERROR', () => {
    let state;
    let error;
    beforeEach(() => {
      error = new Error('test-error');
      state = reducer(undefined, sessionActions.createSessionError(error));
    });
    it('sets the state to SIGNIN_ERROR', () => {
      expect(state.getIn(['session', 'state'])).to.eql('SIGNIN_ERROR');
    });
    it('sets the error object', () => {
      expect(state.getIn(['session', 'error'])).to.be.instanceof(Error);
    });
  });

  describe('on CREATE_SESSION_SUCCESS', () => {
    let state;
    const userinfo = {
      username: 'user',
      email: 'test-user@test-email'
    };

    beforeEach(() => {
      state = reducer(undefined, sessionActions.createSessionSuccess(userinfo));
    });
    it('sets the state to SIGNIN_OK', () => {
      expect(state.getIn(['session', 'state'])).to.eql('SIGNIN_OK');
    });
    it('sets the userinfo', () => {
      expect(state.getIn(['session', 'userinfo'])).to.eql({
        username: 'user',
        email: 'test-user@test-email'
      });
    });
  });

  describe('on VALIDATE_SESSION_START', () => {
    let state;
    beforeEach(() => {
      state = reducer(undefined, sessionActions.validateSessionStart());
    });
    it('sets the state to VALIDATION_ONGOING', () => {
      expect(state.getIn(['session', 'state'])).to.eql('VALIDATION_ONGOING');
    });
  });
});
