import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { fetchCameraGroups, cameraGroupSelected, getUserCameraGroupPrivileges } from '../cameraGroups/actions';
import { fetchUserCameraLicenses } from '../users/actions';
import {isEmpty} from '../helperFunctions';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay, shouldResetTimeout: true });

function fetchInProcess(bool) {
  return {
    type: types.FETCH_CAMERA_AUTH_RTSP_URL_IN_PROCESS,
    fetchInProcess: bool
  }
}

function fetchError(error) {
  return {
    type: types.FETCH_CAMERA_AUTH_RTSP_URL_ERROR,
    fetchError: error
  }
}

function fetchSuccess(authRtspUrl) {
  return {
    type: types.FETCH_CAMERA_AUTH_RTSP_URL_SUCCESS,
    authRtspUrl
  }
}

function addCameraInProcess(bool) {
  return {
    type: types.ADD_CAMERA_IN_PROCESS,
    addCameraInProcess: bool
  }
}

function addCameraError(error) {
  return {
    type: types.ADD_CAMERA_ERROR,
    addCameraError: error
  }
}

function addCameraSuccess(bool) {
  return {
    type: types.ADD_CAMERA_SUCCESS,
    addCameraSuccess: bool
  }
}

function deleteCameraInProcess(bool) {
  return {
    type: types.DELETE_CAMERA_IN_PROCESS,
    deleteCameraInProcess: bool
  }
}

function deleteCameraError(error) {
  return {
    type: types.DELETE_CAMERA_ERROR,
    deleteCameraError: error
  }
}

function deleteCameraSuccess(bool) {
  return {
    type: types.DELETE_CAMERA_SUCCESS,
    deleteCameraSuccess: bool
  }
}

export function clearCameraData() {
  return {
      type: types.CLEAR_CAMERA_DATA,
      authRtspUrl: null
  }
}

function channelConnected(channel) {
  return {
    type: types.CHANNEL_CONNECTED,
    channel: channel
  }
}

export function refreshCameraImage(uuid, image) {
  return {
    type: types.REFRESH_CAMERA_IMAGE,
    refreshCameraUuid: uuid,
    refreshCameraImage: image
  }
}

export function imageUpdateInProgress(bool, uuid) {
  return {
    type: types.IMAGE_UPDATE_IN_PROGRESS,
    imageUpdateInProgress: bool,
    imageUpdateInProgressUuid : uuid
  }
}

function refreshCameraError(error, uuid) {
  return {
    type: types.REFRESH_CAMERA_ERROR,
    refreshCameraError: error,
    refreshCameraErrorUuid: uuid
  }
}

function editCameraInProcess(bool) {
  return {
    type: types.EDIT_CAMERA_IN_PROCESS,
    editCameraInProcess: bool
  }
}

function editCameraSuccess(bool) {
  return {
    type: types.EDIT_CAMERA_SUCCESS,
    editCameraSuccess: bool
  }
}

function editCameraError(message) {
  return {
    type: types.EDIT_CAMERA_ERROR,
    editCameraError: message
  }
}

function imageUpdateSuccess(bool, uuid) {
  return {
    type: types.IMAGE_UPDATE_SUCCESS,
    imageUpdateSuccess: bool,
    imageUpdateSuccessUuid: uuid
  }
}

function updateCamera(cameraData) {
  return {
    type: types.UPDATE_CAMERA,
    name: cameraData.name,
    rtspUrl: cameraData.rtspUrl,
    username: cameraData.username
  }
}

export function cameraArmed(bool, cameraUuid) {
  return {
    type: types.CAMERA_ARMED,
    cameraArmed: bool,
    cameraArmedUuid: cameraUuid
  }
}

export function cameraConnectionEnabled(bool, cameraUuid) {
  return {
    type: types.CAMERA_CONNECTION_ENABLED,
    cameraConnectionEnabled: bool,
    cameraConnectionUuid: cameraUuid
  }
}

function cameraConnectionVerified(bool, cameraUuid) {
  return {
    type: types.CAMERA_CONNECTION_VERIFIED,
    cameraConnectionVerified: bool,
    cameraConnectionVerifiedUuid: cameraUuid
  }
}

function fetchSuccessAdmin(camerasAdmin) {
  return {
    type: types.FETCH_SUCCESS_ADMIN,
    camerasAdmin
  }
}

export function fetchCameraGroupCameras(user, cameraGroup) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroup.uuid}/cameras`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.get(url, config)
      .then((response) => {
        if (isEmpty(response.data) === false) {
          cameraGroup.cameras = response.data;
        } else {
          cameraGroup.cameras = [];
        }
      })
      .catch((error) => {
        cameraGroup.cameras = [];
      })
      .finally(() =>{
        dispatch(getUserCameraGroupPrivileges(user, cameraGroup));
      })
  }
}

export function fetchCameraUrl(user, cameraGroupsUuid, cameraUuid) {
  return (dispatch) => {
    dispatch(fetchInProcess(true));
    dispatch(fetchError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroupsUuid}/cameras/${cameraUuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.get(url, config)
      .then((response) => {
        dispatch(fetchSuccess(response.data.reco_camera_url));
      })
      .catch((error) => {
        let errMessage = 'Error fetching Camera Url';
        if (error.response != undefined) {
          errMessage = error.response;
          if (typeof error === 'object') {
            if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
              if (typeof error.response.data === 'object') {
                if ('Error' in error.response.data) {
                  errMessage = error.response.data['Error'];
                }
              } else {
                errMessage = error.response.data;
              }
            }
          }
        }
        dispatch(fetchError(errMessage));
      })
      .finally(() => {
        dispatch(fetchInProcess(false));
      });
  }
}

export function updatePreviewImage(user, cameraGroup, cameraUuid) {
  return (dispatch) => {
    dispatch(imageUpdateInProgress(true, cameraUuid));
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroup.uuid}/cameras/${cameraUuid}/image`;

    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}, timeout: 29000};
    let data = {camera_groups_name: cameraGroup.name}

    axios.put(url, data, config)
      .then((response) => {
        dispatch(refreshCameraImage(cameraUuid, response.data['Success']));
        dispatch(imageUpdateSuccess(true, cameraUuid));
      })
      .catch((error) => {
        let errMessage = 'Error refreshing camera image';
        if (error.response != undefined) {
          errMessage = error.response;
          if (typeof error === 'object') {
            if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
              if (typeof error.response.data === 'object') {
                if ('Error' in error.response.data) {
                  errMessage = error.response.data['Error'];
                }
              } else {
                errMessage = error.response.data;
              }
            }
          }
        }
        refreshCameraError(errMessage, cameraUuid);
        dispatch(imageUpdateSuccess(false, cameraUuid));
      })
      .finally(() => {
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(imageUpdateInProgress(false, cameraUuid));
        dispatch(imageUpdateSuccess(false, cameraUuid));
      })
  }
}

export function addCamera(user, cameraGroup, name, rtspUrl, username, password) {
  return (dispatch) => {
    dispatch(addCameraError(''));
    dispatch(addCameraInProcess(true));

    let index = rtspUrl.indexOf(":");
    let protocol = rtspUrl.substr(0, index + 3).toLowerCase();
    let urlAddress = rtspUrl.substr(index + 3);
    let lowerCaseUrl = (protocol + urlAddress);

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroup.uuid}/cameras`;
    let data = {
      camera_groups_name: cameraGroup.name,
      camera_url: lowerCaseUrl,
      camera_name: name
    };

    if (username !== null && typeof username !== 'undefined' && password !== null && typeof password !== 'undefined') {
      data.username = username;
      data.password = password;
    }

    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchSuccess(user));
        dispatch(fetchCameraGroups(user));
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(fetchUserCameraLicenses(user));
        dispatch(addCameraSuccess(true));
        // dispatch(checkCameraConnection(user, response.data.uuid));
      })
      .catch((error) => {
        let errMessage = 'Error creating camera. Please try again later.';
        if (error.response != undefined) {
          errMessage = error.response;
          if (typeof error === 'object') {
            if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
              if (typeof error.response.data === 'object') {
                if ('Error' in error.response.data) {
                  errMessage = error.response.data['Error'];
                }
              } else {
                errMessage = error.response.data;
              }
            }
          }
        }
        dispatch(addCameraError(errMessage));
      })
      .finally(() => {
        dispatch(addCameraError(''));
        dispatch(addCameraInProcess(false));
        dispatch(addCameraSuccess(false));
      });
  }
}

export function checkCameraConnection(user, cameraUuid) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/cameras/${cameraUuid}/verify`;
    const jwt = sessionStorage.getItem('jwt');
    let config = {headers: {Authorization:'Bearer' + ' ' + jwt}};
    axios.get(url, config)
    .then((response) => {
      if (!isEmpty(response.data)) {
        dispatch(cameraConnectionVerified(response.data.verified, cameraUuid));
      }
    })
  }
}

export function editCamera(user, cameraUuid, cameraData) {
  return (dispatch) => {
    let cameraGroup = {uuid: cameraData.camera_groups_uuid};
    delete cameraData.camera_groups_uuid;
    delete cameraData.camera_sku;
    if (typeof cameraData.password == 'undefined') {
      delete cameraData.password;
    }
    dispatch(editCameraError(''));
    dispatch(editCameraInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroup.uuid}/cameras/${cameraUuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.patch(url, cameraData, config)
      .then((response) => {
        dispatch(updateCamera(response.data));
        dispatch(fetchCameraGroups(user));
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(editCameraSuccess(true));
        dispatch(editCameraSuccess(false));
      })
      .catch((error) => {
        let errMessage = 'Error editing camera. Please try again later.';
        if (error.response != undefined) {
          errMessage = error.response;
          if (typeof error === 'object') {
            if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
              if (typeof error.response.data === 'object') {
                if ('Error' in error.response.data) {
                  errMessage = error.response.data['Error'];
                }
              } else {
                errMessage = error.response.data;
              }
            }
          }
        }
        dispatch(editCameraError(errMessage));
        dispatch(editCameraInProcess(false));
      })
      .finally(() => {
        dispatch(editCameraError(''));
        dispatch(editCameraInProcess(false));
      });
  }
}

export function deleteCamera(user, cameraGroupsUuid, cameraUuid) {
  return (dispatch) => {
    let cameraGroup = {uuid: cameraGroupsUuid};
    dispatch(deleteCameraError(''));
    dispatch(deleteCameraInProcess(true));
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroupsUuid}/cameras/${cameraUuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.delete(url, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(fetchUserCameraLicenses(user));
        dispatch(deleteCameraSuccess(true));
      })
      .catch((error) => {
        let errMessage = 'Error deleting camera';
        if (error.response != undefined) {
          errMessage = error.response;
          if (typeof error === 'object') {
            if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
              if ('Error' in error.response.data) {
                errMessage = error.response.data['Error'];
                if (errMessage.includes('Camera Deleted.')){
                  dispatch(fetchCameraGroups(user));
                  dispatch(fetchCameraGroupCameras(user, cameraGroup));
                  dispatch(fetchUserCameraLicenses(user));
                }
              } else {
                errMessage = error.response.data;
              }
            }
          }
        }
        dispatch(deleteCameraError(errMessage));
      })
      .finally(() => {
        dispatch(deleteCameraError(''));
        dispatch(deleteCameraInProcess(false));
        dispatch(deleteCameraSuccess(false));
      });
  }
}

export function toggleCameraArmed(user, cameraGroup, cameraUuid, flag) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroup.uuid}/cameras/${cameraUuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = {armed: flag}
    axios.patch(url, data, config)
      .then((response) => {
        dispatch(checkCameraArmed(user, cameraGroup, cameraUuid));
      })
      .catch((error)=>{
        let errMessage = 'Error arming/disarming camera';
        if (error.response != undefined) {
          errMessage = error.response;
          if (typeof error === 'object') {
            if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
              if (typeof error.response.data === 'object') {
                if ('Error' in error.response.data) {
                  errMessage = error.response.data['Error'];
                }
              } else {
                errMessage = error.response.data;
              }
            }
          }
        }
        throw(errMessage);
      })
  }
}

export function checkCameraArmed(user, cameraGroup, cameraUuid) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroup.uuid}/cameras/${cameraUuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.get(url, config)
      .then((response) => {
        dispatch(cameraArmed(response.data.armed, cameraUuid));
        for (var i = 0; i < cameraGroup.cameras.length; i++) {
          if (cameraUuid == cameraGroup.cameras[i].uuid) {
            cameraGroup.cameras[i] = response.data;
            dispatch(cameraGroupSelected(cameraGroup));
            break;
          }
        }
      })
      .catch((error)=>{
        let errMessage = 'Error checking camera armed status';
        if (error.response != undefined) {
          errMessage = error.response;
          if (typeof error === 'object') {
            if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
              if (typeof error.response.data === 'object') {
                if ('Error' in error.response.data) {
                  errMessage = error.response.data['Error'];
                }
              } else {
                errMessage = error.response.data;
              }
            }
          }
        }
        throw(errMessage);
      })
  }
}

export function createCameraAdmin(user, values) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${values.camera_groups_uuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.get(url, config)
    .then((response) => {
      if (!isEmpty(response.data)) {
        let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${values.camera_groups_uuid}/cameras`;
        let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
        values.camera_groups_name = response.data.name;
        let data = JSON.parse(JSON.stringify(values));
        delete data.camera_groups_uuid;

        axios.post(url, data, config)
        .then((response) => {
          dispatch(readCamerasInGroupAdmin(user, values));
        })
        .catch((error) => {
          let errMessage = 'Error creating camera. Please try again later.';
          if (error.response != undefined) {
            errMessage = error.response;
            if (typeof error === 'object') {
              if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
                if (typeof error.response.data === 'object') {
                  if ('Error' in error.response.data) {
                    errMessage = error.response.data['Error'];
                  }
                } else {
                  errMessage = error.response.data;
                }
              }
            }
          }
          dispatch(editCameraError(errMessage));
        })
      }
    })
    .catch((error) => {
      let errMessage = 'Error fetching camera groups. Please try again later.';
      if (error.response != undefined) {
        errMessage = error.response;
        if (typeof error === 'object') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if (typeof error.response.data === 'object') {
              if ('Error' in error.response.data) {
                errMessage = error.response.data['Error'];
              }
            } else {
              errMessage = error.response.data;
            }
          }
        }
      }
      dispatch(editCameraError(errMessage));
    })
  }
}

export function readCamerasInGroupAdmin(user, values) {
  return (dispatch) => {
    dispatch(fetchSuccessAdmin([]));
    dispatch(editCameraError(""));
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${values.camera_groups_uuid}/cameras`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.get(url, config)
    .then((response) => {
      if (!isEmpty(response.data)) {
        dispatch(fetchSuccessAdmin(response.data));
      } else if (isEmpty(response.data)) {
        dispatch(editCameraError("No cameras found."));
        dispatch(editCameraError(""));
      }
    })
    .catch((error) => {
      let errMessage = 'Error fetching cameras. Please try again later.';
      if (error.response != undefined) {
        errMessage = error.response;
        if (typeof error === 'object') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if (typeof error.response.data === 'object') {
              if ('Error' in error.response.data) {
                errMessage = error.response.data['Error'];
              }
            } else {
              errMessage = error.response.data;
            }
          }
        }
      }
      dispatch(editCameraError(errMessage));
    })
  }
}

export function updateCameraAdmin(user, values) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${values.camera_groups_uuid}/cameras/${values.uuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = JSON.parse(JSON.stringify(values));
    delete data.key;
    delete data.uuid;
    delete data.camera_groups_uuid;
    delete data.reco_camera_url;
    delete data.camera_url;
    delete data.thumbnail_url;
    delete data.magic_camera_box;
    delete data.tags;
    data.away_mode = values.away_mode == "true" ? 1 : 0;
    data.enabled = values.enabled == "true" ? 1 : 0;

    axios.patch(url, data, config)
    .then((response) => {
      dispatch(readCamerasInGroupAdmin(user, values));
    })
    .catch((error) => {
      let errMessage = 'Error updating camera. Please try again later.';
      if (error.response != undefined) {
        errMessage = error.response;
        if (typeof error === 'object') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if (typeof error.response.data === 'object') {
              if ('Error' in error.response.data) {
                errMessage = error.response.data['Error'];
              }
            } else {
              errMessage = error.response.data;
            }
          }
        }
      }
      dispatch(editCameraError(errMessage));
    })
  }
}

export function deleteCameraAdmin(user, values) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${values.camera_groups_uuid}/cameras/${values.uuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.delete(url, config)
    .then((response) => {
      dispatch(readCamerasInGroupAdmin(user, values));
    })
    .catch((error) => {
      let errMessage = 'Error deleting camera. Please try again later.';
      if (error.response != undefined) {
        errMessage = error.response;
        if (typeof error === 'object') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if (typeof error.response.data === 'object') {
              if ('Error' in error.response.data) {
                errMessage = error.response.data['Error'];
              }
            } else {
              errMessage = error.response.data;
            }
          }
        }
      }
      dispatch(editCameraError(errMessage));
    })
  }
}
