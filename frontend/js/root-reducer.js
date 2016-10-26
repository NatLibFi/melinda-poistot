import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';

import { RESET_STATE } from './action-creators/ui-actions';

import session from './reducers/session-reducer';
import jobconfig from './reducers/record-list-form-reducer';

export default function reducer(state = Map(), action) {
  if (action.type === RESET_STATE) {
    return combinedRootReducer(Map(), action);
  }
  return combinedRootReducer(state, action);
}

export const combinedRootReducer = combineReducers({
  session,
  jobconfig
});
