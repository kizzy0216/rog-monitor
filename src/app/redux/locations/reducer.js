import initialState from './initialState';
import * as types from './actionTypes';

const locations = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_LOCATIONS_SUCCESS:
      return {
        ...state,
        locations: action.locations,
        selectedLocation: action.locations.find(location => location.id === state.selectedLocation.id) ||
                          state.selectedLocation
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
        selectedLocation: action.selectedLocation
      }

    case types.CLEAR_LOCATION_DATA:
      return {
        ...state,
        locations: action.locations,
        selectedLocation: action.selectedLocation
      }

    case types.ADD_LOCATION_CAMERA_ERROR:
      return {
        ...state,
        addLocationCameraError: action.addLocationCameraError
      }

    case types.ADD_LOCATION_CAMERA_IN_PROCESS:
      return {
        ...state,
        addLocationCameraInProcess: action.addLocationCameraInProcess
      }

    case types.ADD_LOCATION_CAMERA_SUCCESS:
      return {
        ...state,
        addLocationCameraSuccess: action.addLocationCameraSuccess
      }

    case types.ADD_LOCATION_ERROR:
      return {
        ...state,
        addLocationError: action.addLocationError
      }

    case types.ADD_LOCATION_IN_PROCESS:
      return {
        ...state,
        addLocationInProcess: action.addLocationInProcess
      }

    case types.ADD_LOCATION_SUCCESS:
      return {
        ...state,
        addLocationSuccess: action.addLocationSuccess
      }

      case types.REMOVE_LOCATION_ERROR:
        return {
          ...state,
          removeLocationError: action.removeLocationError
        }

      case types.REMOVE_LOCATION_IN_PROCESS:
        return {
          ...state,
          removeLocationInProcess: action.removeLocationInProcess
        }

      case types.REMOVE_LOCATION_SUCCESS:
        return {
          ...state,
          removeLocationSuccess: action.removeLocationSuccess
        }

    case types.SHARE_LOCATION_IN_PROCESS:
      return {
        ...state,
        shareLocationInProcess: action.shareLocationInProcess
      }

    case types.SHARE_LOCATION_ERROR:
      return {
        ...state,
        shareLocationError: action.shareLocationError
      }

    case types.SHARE_LOCATION_SUCCESS:
      return {
        ...state,
        shareLocationSuccess: action.shareLocationSuccess
      }

    case types.EDIT_LOCATION_IN_PROCESS:
      return {
        ...state,
        editLocationInProcess: action.editLocationInProcess
      }

    case types.EDIT_LOCATION_SUCCESS:
      return {
        ...state,
        editLocationSuccess: action.editLocationSuccess
      }

    case types.EDIT_LOCATION_ERROR:
      return {
        ...state,
        editLocationError: action.editLocationError
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

    default:
      return state;
  }
}

export default locations;
