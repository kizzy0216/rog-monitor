import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { Socket } from '../../../lib/phoenix/phoenix';
import { listenForNewAlerts } from '../alerts/actions';
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

function fetchUserCameraLicenses(user) {
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
      })
      .catch((error) => {
        console.log(error);
        user.cameraLicenses = [];
      })
      .finally(() => {
        dispatch(loginSuccess(user));
        dispatch(loginInProcess(false));
        dispatch(fetchReceivedInvites(user));
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

        if (jwtTokenRefresh === null) {
          jwtTokenRefresh = window.setInterval(
            function(){
              dispatch(login(email, password));
            }, (10 * 60 * 1000), [email, password]
          );
        }
        dispatch(fetchUserCameraLicenses(user));

        const loginEvent = {
          email: resp.data.email,
          name: resp.data.firstName + ' ' + resp.data.lastName,
          last_login: new Date().toString().split(' ').splice(1, 4).join(' ')
        };

        dispatch(trackEventAnalytics('login', loginEvent));
      })
      .catch(error => {
        console.log(error);
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

export function muteSound(user, mute) {
  return (dispatch) => {
    user.mute = mute;
    updateUserData(user);

    user.channel.leave()
      .receive('ok', resp => {
        dispatch(listenForNewAlerts(user));
      })
      .receive('error', resp => console.log(`Unable to leave channel ${channelName}`));
  }
}
