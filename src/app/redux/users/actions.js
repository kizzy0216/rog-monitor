import ReactGA from 'react-ga';
import axios from 'axios';
require('promise.prototype.finally').shim();

import * as types from './actionTypes';

import { loginMissing } from '../auth/actions'

export function updateUser(user, userData) {
  return (dispatch) => {
    dispatch(updateError(''));
    dispatch(updateInProgress(true));
    let config = {headers: {Authorization: user.jwt}};
    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me`;
    const data = {
      user: userData
    };
    axios.patch(url, data, config)
      .then(resp => {
        const user = {
          ...resp.data
        };
        dispatch(updateSuccess(user));
        dispatch(updateInProgress(false));
      })
      .catch(error => {
        dispatch(userUpdateError(error));
        dispatch(updateInProgress(false));
      });
  }
}
