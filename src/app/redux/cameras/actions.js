import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { Socket } from '../../../lib/phoenix/phoenix';

import { fetchLocations } from '../locations/actions';
import moment from 'moment';

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

function updateAlertTimeWindowData(values) {
  return {
    type: types.UPDATE_ALERT_TIME_WINDOWS_DATA,
    alertWindow: values
  }
}

export function fetchCameraAuthRtspUrl(user, cameraId) {
  return (dispatch) => {
    dispatch(fetchInProcess(true));
    dispatch(fetchError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/cameras/${cameraId}/auth_rtsp_url`;
    let config = {headers: {Authorization: user.jwt}};
    axios.get(url, config)
      .then((response) => {
        dispatch(fetchSuccess(response.data.data.authRtspUrl));
      })
      .catch((error) => {
        console.log('Error fetching camera: ', error);
        dispatch(fetchError(true));
      })
      .finally(() => {
        dispatch(fetchInProcess(false));
      });
  }
}

export function updatePreviewImage(cameraId) {
  return (dispatch) => {
    let bvc_url = `${process.env.REACT_APP_BVC_SERVER}/api/camera/${cameraId}/update_thumbnail`;
    const bvc_jwt = localStorage.getItem('bvc_jwt');
    let bvc_config = {headers: {Authorization:'JWT' + ' ' + bvc_jwt}};
    let data = {'image': null}

    axios.post(bvc_url, data, bvc_config)
      .then((response) => {
        dispatch(imageUpdateInProgress(true, cameraId));
      })
      .catch((error) => {
        refreshCameraError('Error refreshing camera image.', cameraId);
        dispatch(imageUpdateInProgress(false, cameraId));
      })
  }
}

export function listenForNewImageThumbnails(user) {
  return (dispatch) => {
    let channelName = `images:user`;
    let params = {token: user.jwt};
    let ws = new Socket(`${process.env.REACT_APP_ROG_WS_URL}/socket`, {params});

    ws.connect();

    let channel = ws.channel(channelName, {});
    channel.join()
      .receive('ok', resp => {
        dispatch(channelConnected(channel));
        dispatch(handleNewImage(channel));
      })
      .receive('error', resp => console.log(`Unable to join channel ${channelName}`));
  }
}

export function handleNewImage(channel) {
  return (dispatch) => {
    channel.on('new_image', camera => dispatch(newImage(camera)));
  }
}

export function newImage(camera) {
  console.log("image: "+camera);
  return (dispatch) => {
    dispatch(refreshCameraImage(camera.id, camera.image.original));
    dispatch(imageUpdateInProgress(false, camera.id));
    dispatch(imageUpdateSuccess(true, camera.id));
    dispatch(imageUpdateSuccess(false, camera.id));
  }
}

export function editCamera(user, cameraId, cameraData) {
  return (dispatch) => {
    dispatch(editCameraError(''));
    dispatch(editCameraInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/cameras/${cameraId}`;
    let config = {headers: {Authorization: user.jwt}};
    let data = {
      camera: cameraData
    };

    axios.patch(url, data, config)
      .then((response) => {
        dispatch(updateCamera(response.data.data));
        dispatch(fetchLocations(user));
        dispatch(editCameraSuccess(true));
        dispatch(editCameraSuccess(false));
      })
      .catch((error) => {
        let errMessage = 'Error editing camera. Please try again later.';
        if (typeof error.response.data.error !== 'undefined') {
          if (error.response.data.error === 'has already been used') {
            errMessage = `This location already has a camera with that name.`
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

export function updateTimeWindowData(timeWindowSelect, values, fieldValue, fieldName) {
  return (dispatch) => {
    values[timeWindowSelect][fieldName] = fieldValue;
    dispatch(updateAlertTimeWindowData(values));
  };
}

export function clearTimeWindowData(timeWindowSelect, values) {
  return (dispatch) => {
    values[timeWindowSelect]['daysOfWeek'] = [];
    values[timeWindowSelect]['start'] = null;
    values[timeWindowSelect]['stop'] = null;
    console.log(values);
    dispatch(updateAlertTimeWindowData(values));
  }
}

export function deleteCamera(user, cameraId) {
  return (dispatch) => {
    dispatch(deleteCameraError(''));
    dispatch(deleteCameraInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/cameras/${cameraId}`;
    let config = {headers: {Authorization: user.jwt}};
    axios.delete(url, config)
      .then((response) => {
        dispatch(fetchLocations(user));
        dispatch(deleteCameraSuccess(true));
        dispatch(deleteCameraSuccess(false));
      })
      .catch((error) => {
        dispatch(deleteCameraError('Error deleting camera.'));
      })
      .finally(() => {
        dispatch(deleteCameraError(''));
        dispatch(deleteCameraInProcess(false));
      });
  }
}

export function toggleCameraConnection(cameraId, flag) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_BVC_SERVER}/api/camera/${cameraId}/enabled`;
    const bvc_jwt = localStorage.getItem('bvc_jwt');
    let bvc_config = {headers: {Authorization:'JWT' + ' ' + bvc_jwt}};
    let data = {value: flag}
    axios.put(url, data, bvc_config)
      .then((response) => {
        dispatch(checkCameraConnection(cameraId));
      })
      .catch((error)=>{
        console.log(error);
      })
  }
}

export function checkCameraConnection(cameraId) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_BVC_SERVER}/api/camera/${cameraId}/enabled`;
    const bvc_jwt = localStorage.getItem('bvc_jwt');
    let bvc_config = {headers: {Authorization:'JWT' + ' ' + bvc_jwt}};
    axios.get(url, bvc_config)
      .then((response) => {
        dispatch(cameraConnectionEnabled(response.data.enabled, cameraId));
      })
      .catch((error)=>{
        console.log(error);
      })
  }
}
