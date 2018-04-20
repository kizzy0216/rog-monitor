import ReactGA from 'react-ga';
import axios from 'axios';
require('promise.prototype.finally').shim();

import * as types from './actionTypes';

import { loginMissing } from '../auth/actions'

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

function updateUserSuccess(user) {
  return {
    type: types.UPDATE_USER_SUCCESS,
    user
  }
}

export function updateUser(user, userData) {
  return (dispatch) => {
    dispatch(updateUserError(''));
    dispatch(updateUserInProgress(true));
    let config = {headers: {Authorization: user.jwt}};
    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me`;
    const data = {
      user: userData
    };
    console.log(data);
    axios.patch(url, data, config)
      .then(resp => {
        const user = {
          ...resp.data
        };
        dispatch(updateUserSuccess(user));
        dispatch(updateUserInProgress(false));
      })
      .catch(error => {
        dispatch(updateUserError(error));
        dispatch(updateUserInProgress(false));
      });
  }
}
