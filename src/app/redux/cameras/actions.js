import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

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

export function bvcCameraConnection(bool) {
  return {
    type: types.BVC_CAMERA_CONNECTION,
    bvcCameraConnection: bool
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

export function checkBvcCameraConnection(user, cameraData) {
  return (dispatch) => {
    cameraId = '';//get camera id here from cameraData
    let bvc_url = `${process.env.REACT_APP_BVC_SERVER}/api/camera/${cameraId}/connectedOnce`;
    const bvc_jwt = localStorage.getItem('bvc_jwt');
    let config = {headers: {Authorization:'JWT' + ' ' + bvc_jwt}};
    axios.get(url, config)
      .then((response) => {
        // success action goes here
        if (response.connectedOnce == true){
          dispatch(bvcCameraConnection(true));
        } else if (response.connectedOnce == false){
          dispatch(bvcCameraConnection(false));
          // check if timeout is up, if yes, delete camera, if no, recursivally call this function again to check bool again.
        }
      })
      .catch((error) => {
        console.log(error);
        // call delete camera function here and display out error
        dispatch(deleteCamera(user, cameraId));
        dispatch(bvcCameraConnection(false));
      })
      .finally(() => {
        // callback to end the check and display message that BVC failed to retrieve the connect after one minute.
      });
  }
}
