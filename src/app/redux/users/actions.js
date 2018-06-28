import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { Socket } from '../../../lib/phoenix/phoenix';
import { listenForNewAlerts } from '../alerts/actions';

function updateUserData(userData) {
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

export function updateUser(user, values) {
  return (dispatch) => {
    dispatch(updateUserError(''));
    dispatch(updateUserSuccess(false));
    dispatch(updateUserInProgress(true));
    let config = {headers: {Authorization: user.jwt}};
    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me`;
    const data = {
      user: {
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phone
      }
    };

    axios.patch(url, data, config)
      .then((response) => {
        console.log(response);
        dispatch(updateUserData(response));
        dispatch(updateUserSuccess(true));
        dispatch(updateUserInProgress(false));
      })
      .catch(error => {
        dispatch(updateUserError(error));
        dispatch(updateUserInProgress(false));
      });
  }
}

export function muteSound(user, mute) {
  return (dispatch) => {
    user.mute = mute;
    updateUserData(user);
    let channelName = `alerts:user-${user.id}`;
    let params = {token: user.jwt};
    let ws = new Socket(`${process.env.REACT_APP_ROG_WS_URL}/socket`, {params});
    let channel = ws.channel(channelName, {});

    channel.leave()
      .receive('ok', resp => {
        dispatch(listenForNewAlerts(user));
      })
      .receive('error', resp => console.log(`Unable to join channel ${channelName}`));
  }
}
