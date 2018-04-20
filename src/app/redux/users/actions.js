import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { loginMissing } from '../auth/actions'

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

export function updateUser(user, userData) {
  return (dispatch) => {
    dispatch(updateUserError(''));
    dispatch(updateUserSuccess(false));
    dispatch(updateUserInProgress(true));
    let config = {headers: {Authorization: user.jwt}};
    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me`;
    const data = {
      user: userData
    };

    axios.patch(url, data, config)
      .then((response) => {
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
