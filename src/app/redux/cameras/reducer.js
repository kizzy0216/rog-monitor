import initialState from './initialState';
import * as types from './actionTypes';

const cameras = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_CAMERA_AUTH_RTSP_URL_SUCCESS:
      return {
        ...state,
        authRtspUrl: action.authRtspUrl
      }

    case types.FETCH_CAMERA_AUTH_RTSP_URL_IN_PROCESS:
      return {
        ...state,
        fetchInProcess: action.fetchInProcess
      }

    case types.FETCH_CAMERA_AUTH_RTSP_URL_ERROR:
      return {
        ...state,
        fetchError: action.fetchError
      }

    case types.CLEAR_CAMERA_DATA:
        return {
          ...state,
          authRtspUrl: action.authRtspUrl,
        }

    case types.DELETE_CAMERA_ERROR:
        return {
          ...state,
          deleteCameraError: action.deleteCameraError
        }

    case types.DELETE_CAMERA_IN_PROCESS:
        return {
          ...state,
          deleteCameraInProcess: action.deleteCameraInProcess
        }

    case types.DELETE_CAMERA_SUCCESS:
        return {
          ...state,
          deleteCameraSuccess: action.deleteCameraSuccess
        }

    case types.REFRESH_CAMERA_IMAGE:
      return {
        ...state,
        refreshCameraId: action.id,
        refreshCameraImage: action.image
      }

    default:
      return state;
  }
}

export default cameras;
