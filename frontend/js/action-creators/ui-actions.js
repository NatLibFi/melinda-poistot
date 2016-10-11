import { RESET_WORKSPACE } from '../constants/action-type-constants';

export const RESET_STATE = 'RESET_STATE';
export function resetState() {
  return {
    type: RESET_STATE,
  };
}

export function resetWorkspace() {
  return {
    type: RESET_WORKSPACE,
  };
}
