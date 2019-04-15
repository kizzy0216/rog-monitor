import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { fetchReceivedInvites } from '../invites/actions';
import {loginInProcess, loginError, loginSuccess, trackEventAnalytics, login} from '../auth/actions';
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
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    axios.get(url, config)
      .then((resp) => {
        if (isEmpty(resp.data) === false) {
          user.cameraLicenses = resp.data;
        } else {
          user.cameraLicenses = [];
        }
        dispatch(setupFirebaseCloudMessaging(user));
        dispatch(fetchReceivedInvites(user));
      })
      .catch((error) => {
        console.log(error);
        let errMessage = 'Error fetching user data. Please try again later.';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
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
      .then((resp) => {
        const user = {
          ...resp.data,
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
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
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
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}`;
    const data = {
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email
    };

    axios.patch(url, data, config)
      .then((response) => {
        dispatch(updateUserData(response));
        dispatch(updateUserSuccess(true));
        dispatch(updateUserInProgress(false));
      })
      .catch(error => {
        let errMessage = 'Error updating user';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        dispatch(updateUserError(errMessage));
        dispatch(updateUserInProgress(false));
      });
  }
}

// TODO: refactor this functionality
export function muteSound(user, mute) {
  return (dispatch) => {
    // user.mute = mute;
    // updateUserData(user);

    // user.channel.leave()
      // .receive('ok', resp => {
        // dispatch(listenForNewAlerts(user));
      // })
      // .receive('error', resp => console.log(`Unable to leave channel ${channelName}`));
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
        sessionStorage.setItem('FCM_device_token', token);
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
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    axios.get(url, config)
      .then((resp) => {
        user.devices = resp.data;
        let device_token_exists = false;
        for (var i = 0; i < user.devices.length; i++) {
          let stored_device_token = user.devices[i].device_token;
          if (token === stored_device_token) {
            device_token_exists = true;
            sessionStorage.setItem('FCM_device_token_id', user.devices[i].id);
          }
        }
        if (device_token_exists === false) {
          dispatch(storeUserDeviceToken(user, token, messaging));
        } else {
          dispatch(listenForNewAlerts(user, messaging));
          dispatch(loginSuccess(user));
          dispatch(loginInProcess(false));
        }
      })
      .catch(error => {
        let errMessage = 'Error fetching user device data. Please try again later.';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        dispatch(loginError(errMessage));
        dispatch(loginInProcess(false));
      });
  }
}

function listenForNewAlerts(user, messaging) {
  return (dispatch) => {
    messaging.onMessage(payload => {
    console.log("Notification Received", payload);
      //this is the function that gets triggered when you receive a
      //push notification while you’re on the page. So you can
      //create a corresponding UI for you to have the push
      //notification handled.
    });

    // TODO: complete this function to handle token refreshes from FCM

    // messaging.onTokenRefresh(function() {
    //   messaging.getToken().then(function(refreshedToken) {
    //     console.log('Token refreshed.');
    //     // Indicate that the new Instance ID token has not yet been sent to the
    //     // app server.
    //     setTokenSentToServer(false);
    //     // Send Instance ID token to app server.
    //     dispatch(storeUserDeviceToken(user, refreshedToken, messaging));
    //     // ...
    //   }).catch(function(err) {
    //     console.log('Unable to retrieve refreshed token ', err);
    //     showToken('Unable to retrieve refreshed token ', err);
    //   });
    // });
  }
}

export function storeUserDeviceToken(user, token, messaging) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/devices`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    let data ={
      device_token: token,
      device_name: 'Web Browser Device'
    }
    axios.post(url, data, config)
      .then((resp) => {
        user.devices.push(resp.data.user_device);
        sessionStorage.setItem('FCM_device_token_id', resp.data.user_device.id);
        dispatch(listenForNewAlerts(messaging));
        // TODO: check if login is in process. if it is, trigger the below line
        dispatch(loginSuccess(user));
        dispatch(loginInProcess(false));
      })
      .catch(error => {
        let errMessage = 'Error storing user device token.';
        if (typeof error.response !== 'undefined') {
          if (error.response.data['Error']) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(loginError(errMessage));
        dispatch(loginInProcess(false));
      });
  }
}

export function updateUserDeviceToken(user, token) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/devices/${user.user_devices_id}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    let data ={
      device_token: token,
      device_model: null
    }
    axios.patch(url, data, config)
      .then((resp) => {
        console.log(resp);
      })
      .catch(error => {
        let errMessage = 'Error updating user device data. Please try again later.';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        console.log(errMessage);
      });
  }
}

export function deleteUserDeviceToken(user) {
  return (dispatch, getState, {getFirebase}) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/devices/${sessionStorage.getItem('FCM_device_token_id')}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    axios.delete(url, config)
      .then((resp) => {
        const firebase = getFirebase();
        const messaging = firebase.messaging();
        messaging
          .deleteToken(sessionStorage.getItem('FCM_device_token'))
            .then((resp) => {
              // TODO: make sure this works. then move the remove session storage stuff in here.
              console.log(resp);
            });
        sessionStorage.removeItem('FCM_device_token');
        sessionStorage.removeItem('FCM_device_token_id');
      })
      .catch(error => {
        let errMessage = 'Error deleting user device data. Please try again later.';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        console.log(errMessage);
      });
  }
}
