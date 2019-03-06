import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { trackEventAnalytics } from "../auth/actions";
import {updatePreviewImage, fetchCameraGroupCameras} from "../cameras/actions";
import { locale } from 'moment';
import {isEmpty} from '../helperFunctions';

function fetchInProcess(bool) {
  return {
    type: types.FETCH_CAMERA_GROUPS_IN_PROCESS,
    fetchInProcess: bool
  }
}

function fetchError(error) {
  return {
    type: types.FETCH_CAMERA_GROUPS_ERROR,
    fetchError: error
  }
}

function fetchSuccess(cameraGroups) {
  return {
    type: types.FETCH_CAMERA_GROUPS_SUCCESS,
    cameraGroups
  }
}

function addCameraGroupInProcess(bool) {
  return {
    type: types.ADD_CAMERA_GROUP_IN_PROCESS,
    addCameraGroupInProcess: bool
  }
}

function addCameraGroupError(error) {
  return {
    type: types.ADD_CAMERA_GROUP_ERROR,
    addCameraGroupError: error
  }
}

function addCameraGroupSuccess(bool) {
  return {
    type: types.ADD_CAMERA_GROUP_SUCCESS,
    addCameraGroupSuccess: bool
  }
}

function removeCameraGroupInProcess(bool) {
  return {
    type: types.REMOVE_CAMERA_GROUP_IN_PROCESS,
    removeCameraGroupInProcess: bool
  }
}

function removeCameraGroupError(error) {
  return {
    type: types.REMOVE_CAMERA_GROUP_ERROR,
    removeCameraGroupError: error
  }
}

function removeCameraGroupSuccess(bool) {
  return {
    type: types.REMOVE_CAMERA_GROUP_SUCCESS,
    removeCameraGroupSuccess: bool
  }
}

function addedCameraData(cameraData) {
  return {
    type: types.ADD_CAMERA_DATA,
    cameraData
  }
}

function shareCameraGroupInProcess(bool) {
  return {
    type: types.SHARE_CAMERA_GROUP_IN_PROCESS,
    shareCameraGroupInProcess: bool
  }
}

function shareCameraGroupError(error) {
  return {
    type: types.SHARE_CAMERA_GROUP_ERROR,
    shareCameraGroupError: error
  }
}

function shareCameraGroupSuccess(bool) {
  return {
    type: types.SHARE_CAMERA_GROUP_SUCCESS,
    shareCameraGroupSuccess: bool
  }
}

function editCameraGroupInProcess(bool) {
  return {
    type: types.EDIT_CAMERA_GROUP_IN_PROCESS,
    editCameraGroupInProcess: bool
  }
}

function editCameraGroupSuccess(bool) {
  return {
    type: types.EDIT_CAMERA_GROUP_SUCCESS,
    editCameraGroupSuccess: bool
  }
}

function editCameraGroupError(error) {
  return {
    type: types.EDIT_CAMERA_GROUP_ERROR,
    editCameraGroupError: error
  }
}

function removeGuardInProcess(bool) {
  return {
    type: types.REMOVE_GUARD_IN_PROCESS,
    removeGuardInProcess: bool
  }
}

function removeGuardError(error) {
  return {
    type: types.REMOVE_GUARD_ERROR,
    removeGuardError: error
  }
}

function cameraGroupSelected(selectedCameraGroup) {
  return {
    type: types.CAMERA_GROUP_SELECTED,
    selectedCameraGroup
  }
}

export function clearCameraGroupData() {
  return {
      type: types.CLEAR_CAMERA_GROUP_DATA,
      cameraGroups: initialState.cameraGroups,
      selectedCameraGroup: initialState.selectedCameraGroup
  }
}

// TODO: change the two functions below to work with the new recos in the API
export function CameraConnection(bool) {
  return {
    type: types.CAMERA_CONNECTION,
    CameraConnection: bool
  }
}

export function CameraConnectionFail(bool, id) {
  return {
    type: types.CAMERA_CONNECTION_FAIL,
    CameraConnectionFail: bool,
    CameraConnectionFailId: id
  }
}

export function selectCameraGroup(user, cameraGroup) {
  return (dispatch) => {
    if (cameraGroup !== undefined){
      dispatch(fetchCameraGroupCameras(user, cameraGroup));
    }
  }
}

export function getUserCameraGroupPrivileges(user, cameraGroup) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}/privileges`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    axios.get(url, config)
      .then(response => {
        if (isEmpty(response.data) === false) {
          cameraGroup.userCameraGroupPrivileges = response.data;
        } else {
          cameraGroup.userCameraGroupPrivileges = [];
        }
      })
      .catch(error => {
        console.log(error);
        cameraGroup.userCameraGroupPrivileges = [];
      })
      .finally(() => {
        dispatch(cameraGroupSelected(cameraGroup));
      });
  }
}

export function fetchCameraGroups(user) {
  return (dispatch) => {
    dispatch(fetchInProcess(true));
    dispatch(fetchError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    axios.get(url, config)
      .then(response => {
        if (isEmpty(response.data) === false) {
          dispatch(fetchSuccess(response.data));
        }
      })
      .catch(error => {
        dispatch(fetchError(true));
      })
      .finally(() => {
        dispatch(fetchInProcess(false));
      });
  }
}

export function addNewCameraGroup(user, cameraGroup) {
  return (dispatch) => {
    dispatch(addCameraGroupError(''));
    dispatch(addCameraGroupInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    let data = {
      camera_group_name: cameraGroup.name
    };

    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(addCameraGroupSuccess(true));
        dispatch(selectCameraGroup(user, response.data));
      })
      .catch((error) => {
        let errMessage = 'Error creating camera. Please try again later.';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        dispatch(addCameraGroupError(errMessage));
      })
      .finally(() => {
        dispatch(addCameraGroupError(''));
        dispatch(addCameraGroupInProcess(false));
        dispatch(addCameraGroupSuccess(false));
      });
  }
}

export function removeCameraGroup(user, cameraGroup) {
  return (dispatch) => {
    dispatch(removeCameraGroupError(''));
    dispatch(removeCameraGroupInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/cameraGroups/${cameraGroup.id}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    axios.delete(url, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(removeCameraGroupSuccess(true));
        dispatch(removeCameraGroupSuccess(false));
        dispatch(clearCameraGroupData());
      })
      .catch((error) => {
        let errMessage = 'Error removing cameraGroup. Please try again later.';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        dispatch(removeCameraGroupError(errMessage));
      })
      .finally(() => {
        dispatch(removeCameraGroupError(''));
        dispatch(removeCameraGroupInProcess(false));
      });
  }
}

export function shareCameraGroup(user, cameraGroupId, inviteeEmail) {
  return (dispatch) => {
    dispatch(shareCameraGroupError(''));
    dispatch(shareCameraGroupInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/invitations`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    let data = {
      cameraGroup_guard_invitation: {
        cameraGroup_id: cameraGroupId, invitee_email: inviteeEmail, role: 'viewer'
      }
    };

    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(shareCameraGroupSuccess(true));
        dispatch(shareCameraGroupSuccess(false));
      })
      .catch((error) => {
        let errMessage = 'Error sharing cameraGroup. Please try again later.';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        dispatch(shareCameraGroupError(errMessage));
      })
      .finally(() => {
        dispatch(shareCameraGroupError(''));
        dispatch(shareCameraGroupInProcess(false));
      });
  }
}

export function removeCameraGroupPrivilege(user, cameraGroupId, cameraGroupPrivilegeId) {
  return (dispatch) => {
    dispatch(removeGuardError(''));
    dispatch(removeGuardInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-group/${cameraGroupId}/privileges/${cameraGroupPrivilegeId}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    axios.delete(url, config)
    .then(response => {
      dispatch(fetchCameraGroups(user));
    })
    .catch((error) => {
      let errMessage = 'Error removing user';
      if (error.response.data['Error']) {
        errMessage = error.response.data['Error'];
      }
      dispatch(removeGuardError(errMessage));
    })
    .finally(() => {
      dispatch(removeGuardError(''));
      dispatch(removeGuardInProcess(false));
    });
  }
}

export function editCameraGroup(user, cameraGroup, cameraGroupData) {
  return (dispatch) => {
    dispatch(editCameraGroupError(''));
    dispatch(editCameraGroupInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    let data = {
      cameraGroup: cameraGroupData
    };

    axios.patch(url, data, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(editCameraGroupSuccess(true));
        dispatch(editCameraGroupSuccess(false));
      })
      .catch((error) => {
        let errMessage = 'Error editing camera group. Please try again later.';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        dispatch(editCameraGroupError(errMessage));
      })
      .finally(() => {
        dispatch(editCameraGroupError(''));
        dispatch(editCameraGroupInProcess(false));
      });
  }
}
