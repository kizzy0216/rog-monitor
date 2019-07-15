import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { fetchCameraGroups, selectCameraGroup, getUserCameraGroupPrivileges } from '../cameraGroups/actions';
import { fetchUserCameraLicenses } from '../users/actions';
import {isEmpty} from '../helperFunctions';

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

export function refreshCameraImage(id, image) {
  return {
    type: types.REFRESH_CAMERA_IMAGE,
    refreshCameraId: id,
    refreshCameraImage: image
  }
}

export function imageUpdateInProgress(bool, id) {
  return {
    type: types.IMAGE_UPDATE_IN_PROGRESS,
    imageUpdateInProgress: bool,
    imageUpdateInProgressId : id
  }
}

function refreshCameraError(error, id) {
  return {
    type: types.REFRESH_CAMERA_ERROR,
    refreshCameraError: error,
    refreshCameraErrorId: id
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

function imageUpdateSuccess(bool, id) {
  return {
    type: types.IMAGE_UPDATE_SUCCESS,
    imageUpdateSuccess: bool,
    imageUpdateSuccessId: id
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

function cameraConnectionEnabled(bool, cameraId) {
  return {
    type: types.CAMERA_CONNECTION_ENABLED,
    cameraConnectionEnabled: bool,
    cameraConnectionId: cameraId
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
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}/cameras`;
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

export function fetchCameraUrl(user, cameraGroupsId, cameraId) {
  return (dispatch) => {
    dispatch(fetchInProcess(true));
    dispatch(fetchError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupsId}/cameras/${cameraId}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.get(url, config)
      .then((response) => {
        dispatch(fetchSuccess(response.data.reco_camera_url));
      })
      .catch((error) => {
        let errMessage = 'Error fetching Camera Url';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(fetchError(errMessage));
      })
      .finally(() => {
        dispatch(fetchInProcess(false));
      });
  }
}

export function updatePreviewImage(user, cameraGroup, cameraId) {
  return (dispatch) => {
    dispatch(imageUpdateInProgress(true, cameraId));
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}/cameras/${cameraId}/image`;

    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = {camera_groups_name: cameraGroup.name}

    axios.post(url, data, config)
      .then((response) => {
        dispatch(refreshCameraImage(cameraId, response.data['Success']));
        dispatch(imageUpdateSuccess(true, cameraId));
      })
      .catch((error) => {
        let errMessage = 'Error refreshing camera image';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        refreshCameraError(errMessage, cameraId);
        dispatch(imageUpdateSuccess(false, cameraId));
      })
      .finally(() => {
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(imageUpdateInProgress(false, cameraId));
        dispatch(imageUpdateSuccess(false, cameraId));
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

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}/cameras`;
    let data = {
      camera_groups_name: cameraGroup.name,
      camera_url: lowerCaseUrl,
      camera_name: name,
      username,
      password
    };

    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchSuccess(user));
        dispatch(fetchCameraGroups(user));
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(fetchUserCameraLicenses(user));
        dispatch(addCameraSuccess(true));
        // dispatch(checkCameraConnection(user, response.data.id));
      })
      .catch((error) => {
        let errMessage = 'Error creating camera. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
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

export function checkCameraConnection(user, cameraId) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/recos/cameras/${cameraId}`;
    const jwt = localStorage.getItem('jwt');
    let config = {headers: {Authorization:'Bearer' + ' ' + jwt}};
    axios.get(url, config)
    .then((response) => {
      console.log(response.data);
      dispatch(cameraConnection(response.data.value));
      if (response.data.value == true) {
        dispatch(cameraConnectionFail(false, cameraId));
      } else {
        dispatch(cameraConnectionFail(true, cameraId));
      }
    })
  }
}

export function editCamera(user, cameraId, cameraData) {
  return (dispatch) => {
    let cameraGroup = {id: cameraData.camera_group_id};
    delete cameraData.camera_group_id;
    if (typeof cameraData.password == 'undefined') {
      delete cameraData.password;
    }
    dispatch(editCameraError(''));
    dispatch(editCameraInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}/cameras/${cameraId}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = cameraData;

    axios.patch(url, data, config)
      .then((response) => {
        dispatch(updateCamera(response.data));
        dispatch(fetchCameraGroups(user));
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(editCameraSuccess(true));
        dispatch(editCameraSuccess(false));
      })
      .catch((error) => {
        let errMessage = 'Error editing camera. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
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

export function deleteCamera(user, cameraGroupsId, cameraId) {
  return (dispatch) => {
    let cameraGroup = {id: cameraGroupsId};
    dispatch(deleteCameraError(''));
    dispatch(deleteCameraInProcess(true));
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupsId}/cameras/${cameraId}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.delete(url, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(fetchUserCameraLicenses(user));
        dispatch(deleteCameraSuccess(true));
        dispatch(deleteCameraSuccess(false));
      })
      .catch((error) => {
        let errMessage = 'Error deleting camera';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
            if (errMessage.includes('Camera Deleted.')){
              dispatch(fetchCameraGroups(user));
              dispatch(fetchCameraGroupCameras(user, cameraGroup));
              dispatch(fetchUserCameraLicenses(user));
            }
          }
        }
        dispatch(deleteCameraError(errMessage));
      })
      .finally(() => {
        dispatch(deleteCameraError(''));
        dispatch(deleteCameraInProcess(false));
      });
  }
}

export function toggleCameraEnabled(user, cameraGroup, cameraId, flag) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}/cameras/${cameraId}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = {enabled: flag}
    axios.patch(url, data, config)
      .then((response) => {
        dispatch(checkCameraEnabled(user, cameraGroup, cameraId));
      })
      .catch((error)=>{
        console.log(error);
        let errMessage = 'Error toggling camera connection';
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
        }
      })
  }
}

export function checkCameraEnabled(user, cameraGroup, cameraId) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}/cameras/${cameraId}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.get(url, config)
      .then((response) => {
        dispatch(cameraConnectionEnabled(response.data.enabled, cameraId));
      })
      .catch((error)=>{
        let errMessage = 'Error checking camera connection';
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
          console.log(errMessage);
        } else {
          console.log(errMessage);
        }
      })
  }
}

export function createCameraAdmin(user, values) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${values.camera_groups_id}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.get(url, config)
    .then((response) => {
      if (!isEmpty(response.data)) {
        let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${values.camera_groups_id}/cameras`;
        let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
        values.camera_groups_name = response.data.name;
        let data = JSON.parse(JSON.stringify(values));
        delete data.camera_groups_id;

        axios.post(url, data, config)
        .then((response) => {
          dispatch(readCamerasInGroupAdmin(user, values));
        })
        .catch((error) => {
          let errMessage = 'Error creating camera. Please try again later.';
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
          dispatch(editCameraError(errMessage));
        })
      }
    })
    .catch((error) => {
      let errMessage = 'Error fetching camera groups. Please try again later.';
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
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
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${values.camera_groups_id}/cameras`;
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
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
        }
      }
      dispatch(editCameraError(errMessage));
    })
  }
}

export function updateCameraAdmin(user, values) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${values.camera_groups_id}/cameras/${values.id}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = JSON.parse(JSON.stringify(values));
    delete data.key;
    delete data.id;
    delete data.camera_groups_id;
    delete data.reco_camera_url;
    delete data.camera_url;
    delete data.thumbnail_url;
    delete data.magic_camera_box;
    delete data.tags;
    data.vacation_mode = values.vacation_mode == "true" ? 1 : 0;
    data.enabled = values.enabled == "true" ? 1 : 0;

    axios.patch(url, data, config)
    .then((response) => {
      dispatch(readCamerasInGroupAdmin(user, values));
    })
    .catch((error) => {
      let errMessage = 'Error updating camera. Please try again later.';
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
        }
      }
      dispatch(editCameraError(errMessage));
    })
  }
}

export function deleteCameraAdmin(user, values) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${values.camera_groups_id}/cameras/${values.id}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.delete(url, config)
    .then((response) => {
      dispatch(readCamerasInGroupAdmin(user, values));
    })
    .catch((error) => {
      let errMessage = 'Error deleting camera. Please try again later.';
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
        }
      }
      dispatch(editCameraError(errMessage));
    })
  }
}
