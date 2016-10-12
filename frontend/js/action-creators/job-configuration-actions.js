import {SET_SELECTED_LOW_TAG} from '../constants/action-type-constants';

export function setSelectedLowTag(lowtag) {
  return { 'type': SET_SELECTED_LOW_TAG, lowtag };
}
