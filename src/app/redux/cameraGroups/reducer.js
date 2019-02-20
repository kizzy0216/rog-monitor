import initialState from './initialState';
import * as types from './actionTypes';

const cameraGroups = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_LOCATIONS_SUCCESS:
      return {
        ...state,
        cameraGroups: action.cameraGroups,
        selectedCameraGroup: action.cameraGroups.find(cameraGroup => cameraGroup.id === state.selectedCameraGroup.id) ||
                          state.selectedCameraGroup
      }

    case types.FETCH_LOCATIONS_IN_PROCESS:
      return {
        ...state,
        fetchInProcess: action.bool
      }

    case types.FETCH_LOCATIONS_ERROR:
      return {
        ...state,
        fetchError: action.bool
      }

    case types.LOCATION_SELECTED:
      return {
        ...state,
        selectedCameraGroup: action.selectedCameraGroup
      }

    case types.CLEAR_LOCATION_DATA:
      return {
        ...state,
        cameraGroups: action.cameraGroups,
        selectedCameraGroup: action.selectedCameraGroup
      }

    case types.ADD_LOCATION_CAMERA_ERROR:
      return {
        ...state,
        addCameraGroupCameraError: action.addCameraGroupCameraError
      }

    case types.ADD_LOCATION_CAMERA_IN_PROCESS:
      return {
        ...state,
        addCameraGroupCameraInProcess: action.addCameraGroupCameraInProcess
      }

    case types.ADD_LOCATION_CAMERA_SUCCESS:
      return {
        ...state,
        addCameraGroupCameraSuccess: action.addCameraGroupCameraSuccess
      }

    case types.ADD_LOCATION_ERROR:
      return {
        ...state,
        addCameraGroupError: action.addCameraGroupError
      }

    case types.ADD_LOCATION_IN_PROCESS:
      return {
        ...state,
        addCameraGroupInProcess: action.addCameraGroupInProcess
      }

    case types.ADD_LOCATION_SUCCESS:
      return {
        ...state,
        addCameraGroupSuccess: action.addCameraGroupSuccess
      }

      case types.REMOVE_LOCATION_ERROR:
        return {
          ...state,
          removeCameraGroupError: action.removeCameraGroupError
        }

      case types.REMOVE_LOCATION_IN_PROCESS:
        return {
          ...state,
          removeCameraGroupInProcess: action.removeCameraGroupInProcess
        }

      case types.REMOVE_LOCATION_SUCCESS:
        return {
          ...state,
          removeCameraGroupSuccess: action.removeCameraGroupSuccess
        }

    case types.SHARE_LOCATION_IN_PROCESS:
      return {
        ...state,
        shareCameraGroupInProcess: action.shareCameraGroupInProcess
      }

    case types.SHARE_LOCATION_ERROR:
      return {
        ...state,
        shareCameraGroupError: action.shareCameraGroupError
      }

    case types.SHARE_LOCATION_SUCCESS:
      return {
        ...state,
        shareCameraGroupSuccess: action.shareCameraGroupSuccess
      }

    case types.EDIT_LOCATION_IN_PROCESS:
      return {
        ...state,
        editCameraGroupInProcess: action.editCameraGroupInProcess
      }

    case types.EDIT_LOCATION_SUCCESS:
      return {
        ...state,
        editCameraGroupSuccess: action.editCameraGroupSuccess
      }

    case types.EDIT_LOCATION_ERROR:
      return {
        ...state,
        editCameraGroupError: action.editCameraGroupError
      }

    case types.REMOVE_GUARD_IN_PROCESS:
      return {
        ...state,
        removeGuardInProcess: action.removeGuardInProcess
      }

    case types.REMOVE_GUARD_ERROR:
      return {
        ...state,
        removeGuardError: action.removeGuardError
      }

    case types.ADD_CAMERA_DATA:
      return {
        ...state,
        addedCameraData: action.cameraData
      }

    case types.BVC_CAMERA_CONNECTION:
      return {
        ...state,
        bvcCameraConnection: action.bvcCameraConnection
      }

      case types.BVC_CAMERA_CONNECTION_FAIL:
        return {
          ...state,
          bvcCameraConnectionFail: action.bvcCameraConnectionFail,
          bvcCameraConnectionFailId: action.bvcCameraConnectionFailId
        }

    default:
      return state;
  }
}

export default cameraGroups;
