import axios from 'axios';
import initialState from './initialState';
import * as types from './actionTypes';

function readRecosSuccess(recos) {
  return {
    type: types.READ_RECOS_SUCCESS,
    recos: recos
  }
}

function readRecosError(message) {
  return {
    type: types.READ_RECOS_ERROR,
    message: message
  }
}

export function readAllRecos() {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/recos`;
    let config = {headers: {Authorization: 'Bearer '+localStorage.getItem('jwt')}};
    axios.get(url, config)
    .then(response => {
      dispatch(readRecosSuccess(response.data));
    })
    .catch((error) => {
      let errMessage = 'Error fetching Recos';
      if (typeof error.response != 'undefined') {
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
      }
      dispatch(readRecosError(errMessage));
    })
  }
}
