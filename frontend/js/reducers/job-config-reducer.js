import { Map } from 'immutable';
import {SET_SELECTED_LOW_TAG} from '../constants/action-type-constants';

const INITIAL_STATE = Map({
  lowtag: undefined
});

export default function session(state = INITIAL_STATE, action) {
  switch (action.type) {
  case SET_SELECTED_LOW_TAG:
    return setLowTag(state, action.lowtag);
  }
  return state;
}

function setLowTag(state, lowtag) {
  return state.set('lowtag', lowtag);
}
