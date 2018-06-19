import moment from 'moment';
export default {
  authRtspUrl: null,
  fetchInProcess: false,
  fetchError: '',
  deleteCameraInProcess: false,
  deleteCameraSucess: false,
  deleteCameraError: '',
  imageUpdateInProgress: false,
  imageUpdateInProgressId: '',
  refreshCameraError: '',
  refreshCameraErrorId: '',
  imageUpdateSuccess: false,
  imageUpdateSuccessId: '',
  image: false,
  disabledFlag: false,
  editCameraInProcess: false,
  editCameraSuccess: false,
  editCameraError: '',
  cameraConnectionEnabled: false,
  cameraConnectionId: '',
  time_zone: null,
  alertWindow: {
    0: {
      start: null,
      stop: null,
      daysOfWeek: []
    },
    1: {
      start: null,
      stop: null,
      daysOfWeek: []
    },
    2: {
      start: null,
      stop: null,
      daysOfWeek: []
    }
  }
}
