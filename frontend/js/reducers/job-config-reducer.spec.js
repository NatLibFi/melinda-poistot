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
});
