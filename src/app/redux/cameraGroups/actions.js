import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { trackEventAnalytics } from "../auth/actions";
import {updatePreviewImage, fetchCameraGroupCameras} from "../cameras/actions";
import { updateUserData } from "../users/actions";
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

function fetchSuccessAdmin(cameraGroupsAdmin) {
  return {
    type: types.FETCH_CAMERA_GROUPS_ADMIN,
    cameraGroupsAdmin
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
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
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
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

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
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    let data = {
      camera_group_name: cameraGroup.name
    };

    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(addCameraGroupSuccess(true));
        response.data.id = response.data.camera_group_id;
        delete response.data.camera_group_id;
        dispatch(selectCameraGroup(user, response.data));
      })
      .catch((error) => {
        let errMessage = 'Error creating camera. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
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

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.delete(url, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(removeCameraGroupSuccess(true));
        dispatch(removeCameraGroupSuccess(false));
        dispatch(clearCameraGroupData());
      })
      .catch((error) => {
        let errMessage = 'Error removing cameraGroup. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
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
    let cameraGroup = {id: cameraGroupId};
    dispatch(shareCameraGroupError(''));
    dispatch(shareCameraGroupInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/invitations`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    let data = {
      email: inviteeEmail
    };

    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(fetchCameraGroupCameras(user, cameraGroup));
        dispatch(shareCameraGroupSuccess(true));
      })
      .catch((error) => {
        let errMessage = 'Error sharing cameraGroup. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(shareCameraGroupError(errMessage));
      })
      .finally(() => {
        dispatch(shareCameraGroupError(''));
        dispatch(shareCameraGroupInProcess(false));
        dispatch(shareCameraGroupSuccess(false));
      });
  }
}

export function removeUserCameraGroupPrivilege(user, cameraGroupId, cameraGroupPrivilegeId) {
  return (dispatch) => {
    let cameraGroup = {id: cameraGroupId};
    dispatch(removeGuardError(''));
    dispatch(removeGuardInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-group/${cameraGroupId}/privileges/${cameraGroupPrivilegeId}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.delete(url, config)
    .then(response => {
      dispatch(fetchCameraGroups(user));
      dispatch(fetchCameraGroupCameras(user, cameraGroup));
    })
    .catch((error) => {
      let errMessage = 'Error removing user';
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
        }
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

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    let data = {
      name: cameraGroupData.name,
      vacation_mode: 0 //for now hard code this until we build the UI for this edit option
    };

    axios.patch(url, data, config)
      .then((response) => {
        cameraGroup.name = cameraGroupData.name;
        cameraGroup.vacation_mode = cameraGroupData.vacation_mode;
        dispatch(fetchCameraGroups(user));
        dispatch(selectCameraGroup(user, cameraGroup));
        dispatch(editCameraGroupSuccess(true));
        dispatch(editCameraGroupSuccess(false));
      })
      .catch((error) => {
        let errMessage = 'Error editing camera group. Please try again later.';
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
          if ('Error' in error.response.data) {
            errMessage = error.response.data['Error'];
          }
        }
        dispatch(editCameraGroupError(errMessage));
      })
      .finally(() => {
        dispatch(editCameraGroupError(''));
        dispatch(editCameraGroupInProcess(false));
      });
  }
}

export function createCameraGroup(user) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.user_id}/camera-groups`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = {};

    axios.post(url, data, config)
    .then((response) => {
      dispatch(readAllCameraGroupsForUser(user));
    })
    .catch((error) => {
      let errMessage = 'Error creating camera group. Please try again later.';
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
        }
      }
      dispatch(editCameraGroupError(errMessage));
      dispatch(readAllCameraGroupsForUser(user));
    })
  }
}

export function readAllCameraGroupsForUser(user) {
  return (dispatch) => {
    dispatch(fetchSuccessAdmin([]));
    dispatch(editCameraGroupError(""));
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.user_id}/camera-groups`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.get(url, config)
    .then((response) => {
      if (!isEmpty(response.data)) {
        dispatch(fetchSuccessAdmin(response.data));
        dispatch(updateUserData(user));
      } else if (isEmpty(response.data)) {
        dispatch(editCameraGroupError("No camera groups found."));
      }
    })
    .catch((error) => {
      let errMessage = 'Error fetching camera groups. Please try again later.';
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
        }
      }
      dispatch(editCameraGroupError(errMessage));
    })
  }
}

export function updateCameraGroup(user, values) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.user_id}/camera-groups/${values.id}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let vacation_mode = 0;
    if (values.vacation_mode == "true" || values.vacation_mode == true) {
      vacation_mode = 1;
    }
    let data = {
      name: values.name,
      vacation_mode: vacation_mode
    };

    axios.patch(url, data, config)
    .then((response) => {
      dispatch(readAllCameraGroupsForUser(user));
    })
    .catch((error) => {
      let errMessage = 'Error updating camera group. Please try again later.';
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
        }
      }
      dispatch(editCameraGroupError(errMessage));
      dispatch(readAllCameraGroupsForUser(user));
    })
  }
}

export function deleteCameraGroup(user, values) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.user_id}/camera-groups/${values.id}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.delete(url, config)
    .then((response) => {
      dispatch(readAllCameraGroupsForUser(user));
    })
    .catch((error) => {
      let errMessage = 'Error deleting camera group. Please try again later.';
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
        if ('Error' in error.response.data) {
          errMessage = error.response.data['Error'];
        }
      }
      dispatch(editCameraGroupError(errMessage));
      dispatch(readAllCameraGroupsForUser(user));
    })
  }
}
