import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { Socket } from '../../../lib/phoenix/phoenix';
import { listenForNewAlerts } from '../alerts/actions';
import { fetchReceivedInvites } from '../invites/actions';
import {loginInProcess, loginError, loginSuccess, trackEventAnalytics, login} from '../auth/actions';

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

export function readUser(jwt, jwtTokenRefresh, email, password) {
  return(dispatch) => {
    let config = {headers: {Authorization: 'Bearer '+jwt}};
    let url = `${process.env.REACT_APP_ROG_API_URL}/users`;
    axios.get(url, config)
      .then((resp) => {
        const user = {
          ...resp.data,
          jwt: jwt
        }
        sessionStorage.setItem('jwt', jwt);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('password', password);

        // figure out a way to pass this to global if we set it
        if (jwtTokenRefresh === null) {
          jwtTokenRefresh = window.setInterval(
            function(){
              dispatch(login(email, password));
            }, (10 * 60 * 1000), [email, password]
          );
        }
        dispatch(loginSuccess(user));
        dispatch(loginInProcess(false));
        dispatch(fetchReceivedInvites(user));

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
