import initialState from './initialState';
import * as types from './actionTypes';

const users = (state = initialState, action) => {
  if (typeof action !== 'undefined') {
    switch (action.type) {
      case types.UPDATE_USER_IN_PROGRESS:
        return {
          ...state,
          updateUserInProgress: action.updateUserInProgress
        }
      case types.UPDATE_USER_SUCCESS:
        return {
          ...state,
          updateUserSuccess: action.updateUserSuccess
        }
      case types.UPDATE_USER_ERROR:
        return {
          ...state,
          updateUserError: action.updateUserError
        }

      case types.UPDATE_USER_DATA:
        return {
          ...state,
          userData: action.userData
        }

      case types.UPDATE_USER_CAMERA_LICENSE_DATA:
        return{
          ...state,
          cameraLicenseData: action.cameraLicenseData
        }

      default:
        return state;
    }
  } else {
    return state
  }
}

export default users;
