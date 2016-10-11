
import { RESET_WORKSPACE, RESET_STATE } from './constants/action-type-constants';

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
