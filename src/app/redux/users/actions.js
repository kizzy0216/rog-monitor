import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { fetchShareGroupInvites } from '../invites/actions';
import {loginInProcess, loginError, loginSuccess, trackEventAnalytics, login, toggleMute} from '../auth/actions';
import {listenForNewAlerts} from '../alerts/actions';
import {isEmpty} from '../helperFunctions';

export function updateUserData(userData) {
  return{
    type: types.UPDATE_USER_DATA,
    userData: userData
  }
}

function updateUserError(error) {
  return {
    type: types.UPDATE_USER_ERROR,
    updateUserError: error
  }
}

function updateUserInProgress(bool) {
  return {
    type: types.UPDATE_USER_IN_PROGRESS,
    updateUserInProgress: bool
  }
}

function updateUserSuccess(bool, user) {
  return {
    type: types.UPDATE_USER_SUCCESS,
    updateUserSuccess: bool
  }
}

export function fetchUserCameraLicenses(user) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/licenses`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.get(url, config)
      .then((response) => {
        if (isEmpty(response.data) === false) {
          user.cameraLicenses = response.data;
        } else {
          user.cameraLicenses = [];
        }
        dispatch(setupFirebaseCloudMessaging(user));
        dispatch(fetchShareGroupInvites(user));
      })
      .catch((error) => {
        let errMessage = 'Error fetching user data. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(loginError(errMessage));
        dispatch(loginInProcess(false));
      })
  }
}

export function readUser(jwt, jwtTokenRefresh, email, password) {
  return(dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users`;
    let config = {headers: {Authorization: 'Bearer '+jwt}};
    axios.get(url, config)
      .then((response) => {
        const user = {
          ...response.data,
          jwt: jwt
        }
        sessionStorage.setItem('jwt', jwt);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('password', password);

        if (window.jwtTokenRefresh === null) {
          window.jwtTokenRefresh = window.setInterval(
            function(){
              dispatch(login(email, password));
            }, (10 * 60 * 1000), [email, password]
          );
        }
        dispatch(fetchUserCameraLicenses(user));
      })
      .catch(error => {
        let errMessage = 'Error fetching user data. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(loginError(errMessage));
        dispatch(loginInProcess(false));
      });
  }
}

export function updateUser(user, values) {
  return (dispatch) => {
    dispatch(updateUserError(''));
    dispatch(updateUserSuccess(false));
    dispatch(updateUserInProgress(true));
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}`;
    const data = {
      first_name: values.firstName,
      last_name: values.lastName
    };

    axios.patch(url, data, config)
      .then((response) => {
        dispatch(updateUserData(response));
        dispatch(updateUserSuccess(true));
        dispatch(updateUserInProgress(false));
      })
      .catch(error => {
        let errMessage = 'Error updating user';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(updateUserError(errMessage));
        dispatch(updateUserInProgress(false));
      });
  }
}

export function muteSound(user, mute) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = {
      mute: mute
    }
    axios.patch(url, data, config)
      .then((response) => {
        dispatch(toggleMute(response.data.user.mute));
      })
      .catch((err) => {
        let errMessage = 'Error fetching user device data. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        console.log(errMessage);
      })
  }
}

function setupFirebaseCloudMessaging(user){
  return (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase();
    const messaging = firebase.messaging();
    messaging
      .requestPermission()
      .then(() => {
        return messaging.getToken();
       })
      .then(token => {
        // console.log("FCM Token:", token);
        dispatch(checkForStoredUserDeviceToken(user, token, messaging));
      })
      .catch(error => {
        if (error.code === "messaging/permission-blocked") {
          alert("It looks like your web browser blocked our notifications. Please Unblock Notifications Manually through your browser's settings.");
        } else {
          dispatch(loginError(errMessage));
          dispatch(loginInProcess(false));
        }
      });
  }
}

function checkForStoredUserDeviceToken(user, token, messaging) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/devices`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.get(url, config)
      .then((response) => {
        user.devices = response.data;
        let device_token_exists = false;
        for (var i = 0; i < user.devices.length; i++) {
          let stored_device_token = user.devices[i].device_token;
          if (token === stored_device_token) {
            device_token_exists = true;
            sessionStorage.setItem('fcm_token_id', user.devices[i].id)
            sessionStorage.setItem('fcm_token', token)
            dispatch(listenForNewAlerts(user, messaging));
            dispatch(loginSuccess(user));
            dispatch(loginInProcess(false));
          }
        }
        if (device_token_exists === false) {
          dispatch(storeUserDevice(user, token, messaging));
        }
      })
      .catch(error => {
        let errMessage = 'Error fetching user device data. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(loginError(errMessage));
        dispatch(loginInProcess(false));
      });
  }
}

export function storeUserDevice(user, token, messaging) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/devices`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data ={
      device_token: token,
      device_name: 'Web Browser Device'
    }
    axios.post(url, data, config)
      .then((response) => {
        user.devices.push(response.data.user_device);
        sessionStorage.setItem('fcm_token_id', response.data.user_device.id)
        sessionStorage.setItem('fcm_token', token)
        dispatch(listenForNewAlerts(user, messaging));
        dispatch(loginSuccess(user));
        dispatch(loginInProcess(false));
      })
      .catch(error => {
        console.log(error);
        let errMessage = 'Error storing user device token.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(loginError(errMessage));
        dispatch(loginInProcess(false));
      });
  }
}

export function updateUserDevice(userId, deviceId, name) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${userId}/devices/${deviceId}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data ={
      device_name: name
    }
    axios.patch(url, data, config)
      .then((response) => {
        // console.log(response);
      })
      .catch(error => {
        let errMessage = 'Error updating user device data. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        console.log(errMessage);
      });
  }
}

export function deleteUserDevice(userId, deviceId, token) {
  return (dispatch, getState, {getFirebase}) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${userId}/devices/${deviceId}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.delete(url, config)
      .then((response) => {
        const firebase = getFirebase();
        const messaging = firebase.messaging();
        messaging
          .deleteToken(token)
            .then((response) => {
              // console.log(response);
            });
      })
      .catch(error => {
        let errMessage = 'Error deleting user device data. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        console.log(errMessage);
      });
  }
}

export function readUserAdmin(values) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${values.user_id}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    axios.get(url, config)
      .then((response) => {
        if (response.hasOwnProperty('data')) {
          dispatch(updateUserData(response.data));
        }
      })
      .catch((error) => {
        let errMessage = 'Error fetching user';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        console.log(errMessage);
      });
  }
}

export function updateUserAdmin(user, values) {
  return (dispatch) => {
    dispatch(updateUserError(''));
    dispatch(updateUserSuccess(false));
    dispatch(updateUserInProgress(true));
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}`;
    const data = JSON.parse(JSON.stringify(values));
    delete data.key;
    delete data.id;

    axios.patch(url, data, config)
      .then((response) => {
        dispatch(updateUserData(response));
        dispatch(updateUserSuccess(true));
        dispatch(updateUserInProgress(false));
      })
      .catch(error => {
        let errMessage = 'Error updating user';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(updateUserError(errMessage));
        dispatch(updateUserInProgress(false));
      });
  }
}

export function deleteUser(user_id) {
  return (dispatch) => {
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user_id}`;

    axios.delete(url, config)
      .then((response) => {
        console.log(response);
      })
      .catch(error => {
        let errMessage = 'Error updating user';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(updateUserError(errMessage));
      });
  }
}
