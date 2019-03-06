import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { fetchCameraGroups } from '../cameraGroups/actions';

function fetchReceivedInProcess(bool) {
  return {
    type: types.FETCH_RECEIVED_IN_PROCESS,
    fetchReceivedInProcess: bool
  }
}

function fetchReceivedError(error) {
  return {
    type: types.FETCH_RECEIVED_ERROR,
    fetchReceivedError: error
  }
}

function fetchReceivedSuccess(receivedInvites) {
  return {
    type: types.FETCH_RECEIVED_SUCCESS,
    receivedInvites
  }
}

function acceptInviteInProcess(bool) {
  return {
    type: types.ACCEPT_INVITE_IN_PROCESS,
    acceptInviteInProcess: bool
  }
}

function acceptInviteSuccess(invite) {
  return {
    type: types.ACCEPT_INVITE_SUCCESS,
    invite
  }
}

function acceptInviteError(error) {
  return {
    type: types.ACCEPT_INVITE_ERROR,
    acceptInviteError: error
  }
}

function rejectInviteInProcess(bool) {
  return {
    type: types.REJECT_INVITE_IN_PROCESS,
    rejectInviteInProcess: bool
  }
}

function rejectInviteSuccess(invite) {
  return {
    type: types.REJECT_INVITE_SUCCESS,
    invite
  }
}

function rejectInviteError(error) {
  return {
    type: types.REJECT_INVITE_ERROR,
    rejectInviteError: error
  }
}

function rescindInviteInProcess(bool) {
  return {
    type: types.RESCIND_INVITE_IN_PROCESS,
    rescindInviteInProcess: bool
  }
}

function rescindInviteError(error) {
  return {
    type: types.RESCIND_INVITE_ERROR,
    rescindInviteError: error
  }
}

export function clearInvitesData() {
  return {
      type: types.CLEAR_INVITES_DATA,
      receivedInvites: [],
      sentInvites: []
  }
}

export function fetchReceivedInvites(user) {
  return (dispatch) => {
    dispatch(fetchReceivedInProcess(true));
    dispatch(fetchReceivedError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/invitations?type=share_group`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    axios.get(url, config)
    .then(response => {
      if (response.data !== ''){
        dispatch(fetchReceivedSuccess(response.data));
      }
    })
    .catch((error) => {
      let errMessage = 'Error fetching recieved invites';
      if (error.response.data['Error']) {
        errMessage = error.response.data['Error'];
      }
      dispatch(fetchReceivedError(errMessage));
    })
    .finally(() => {
      dispatch(fetchReceivedError(''));
      dispatch(fetchReceivedInProcess(false));
    });
  }
}

export function acceptInvite(user, invite) {
  return (dispatch) => {
    dispatch(acceptInviteInProcess(true));
    dispatch(acceptInviteError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${invite.camera_groups_id}/privileges`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    data = ''

    axios.post(url, data, config)
    .then(response => {
      dispatch(acceptInviteSuccess(invite));
      dispatch(fetchCameraGroups(user));
    })
    .catch((error) => {
      let errMessage = 'Error accepting invitation';
      if (error.response.data['Error']) {
        errMessage = error.response.data['Error'];
      }
      dispatch(acceptInviteError(errMessage));
    })
    .finally(() => {
      dispatch(acceptInviteError(''));
      dispatch(acceptInviteInProcess(false));
    });
  }
}

export function rejectInvite(user, invite, InProcess) {
  return (dispatch) => {
    dispatch(rejectInviteError(''));
    dispatch(rejectInviteInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/invitations/${invite.id}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    axios.delete(url, config)
    .then(response => {
      dispatch(rejectInviteSuccess(invite));
    })
    .catch((error) => {
      let errMessage = 'Error rejecting invitation';
      if (error.response.data['Error']) {
        errMessage = error.response.data['Error'];
      }
      dispatch(rejectInviteError(errMessage));
    })
    .finally(() => {
      dispatch(rejectInviteError(''));
      dispatch(rejectInviteInProcess(false));
    });
  }
}

export function rescindInvite(user, invite) {
  return (dispatch) => {
    dispatch(rescindInviteError(''));
    dispatch(rescindInviteInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/invitations/${invite.id}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    axios.delete(url, config)
    .then(response => {
      dispatch(fetchCameraGroups(user));
    })
    .catch((error) => {
      let errMessage = 'Error rescinding invitation';
      if (error.response.data['Error']) {
        errMessage = error.response.data['Error'];
      }
      dispatch(rescindInviteError(errMessage));
    })
    .finally(() => {
      dispatch(rescindInviteError(''));
      dispatch(rescindInviteInProcess(false));
    });
  }
}
