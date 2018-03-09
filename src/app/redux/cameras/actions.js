import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { Socket } from '../../../lib/phoenix/phoenix';

import { fetchLocations } from '../locations/actions';

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

export function imageUpdateInProgress(bool) {
  return {
    type: types.IMAGE_UPDATE_IN_PROGRESS,
    imageUpdateInProgress: bool
  }
}

function refreshCameraError(error) {
  return {
    type: types.REFRESH_CAMERA_ERROR,
    refreshCameraError: error
  }
}

function imageUpdateSuccess(bool) {
  return {
    type: types.IMAGE_UPDATE_SUCCESS,
    imageUpdateSuccess: bool
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
        dispatch(imageUpdateSuccess(false));
        dispatch(imageUpdateInProgress(true));
      })
      .catch((error) => {
        console.log(error);
        refreshCameraError('Error refreshing camera image.');
        dispatch(imageUpdateInProgress(false));
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
  console.log("Hit Image Update!");
  return (dispatch) => {
    dispatch(refreshCameraImage(camera.id, camera.image.original));
    dispatch(imageUpdateInProgress(false));
    dispatch(imageUpdateSuccess(true));
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
        dispatch(fetchLocations(user))
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
