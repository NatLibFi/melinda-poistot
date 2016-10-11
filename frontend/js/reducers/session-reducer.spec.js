import {expect} from 'chai';
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
