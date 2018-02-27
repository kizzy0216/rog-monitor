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

export function checkBvcCameraConnection(user, cameraId) {
  return (dispatch) => {
    let bvc_url = `${process.env.REACT_APP_BVC_SERVER}/api/camera/${cameraId}/connectedOnce`;
    const bvc_jwt = localStorage.getItem('bvc_jwt');
    let config = {headers: {Authorization:'JWT' + ' ' + bvc_jwt}};
    let timeout = 30;
    let checkBvc = setInterval(function(){
      if (timeout <= 0){
        clearInterval(checkBvc);
      } else {
        timeout -= 5;
      }
      axios.get(bvc_url, config)
      .then((response) => {
        console.log(response.data.value);
        // if (response.data.value == true){
        //   dispatch(bvcCameraConnection(true));
        //   return;
        // } else if (response.data.value == false){
        //   dispatch(bvcCameraConnection(false));
        //   if (timeout <= 0){
        //     dispatch(deleteCamera(user, cameraId));
        //   }
        // }
      })
      .catch((error) => {
        console.log(error);
        // dispatch(bvcCameraConnection(false));
        // if (timeout <= 0){
        //   dispatch(deleteCamera(user, cameraId));
        // }
      })
    }, 5000, bvc_url, config);
  }
}
