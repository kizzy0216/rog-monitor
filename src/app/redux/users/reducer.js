import initialState from './initialState';
import * as types from './actionTypes';

const auth = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_USER_IN_PROGRESS:
      return {
        ...state,
        updateUserInProgress: action.updateUserInProgress
      }
    case types.UPDATE_USER_SUCCESS:
      return {
        ...state,
        user: action.updateUserSuccess
      }
    case types.UPDATE_USER_ERROR:
      return {
        ...state,
        updateUserError: action.updateUserError
      }

    default:
      return state;
  }
}

export default auth;
