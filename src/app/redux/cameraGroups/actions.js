import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import * as types from './actionTypes';

import { trackEventAnalytics } from "../auth/actions";
import {updatePreviewImage} from "../cameras/actions";
import { locale } from 'moment';

function fetchInProcess(bool) {
  return {
    type: types.FETCH_LOCATIONS_IN_PROCESS,
    fetchInProcess: bool
  }
}

function fetchError(error) {
  return {
    type: types.FETCH_LOCATIONS_ERROR,
    fetchError: error
  }
}

function fetchSuccess(cameraGroups) {
  return {
    type: types.FETCH_LOCATIONS_SUCCESS,
    cameraGroups
  }
}

function cameraGroupSelected(selectedCameraGroup) {
  return {
    type: types.LOCATION_SELECTED,
    selectedCameraGroup
  }
}

function addCameraGroupInProcess(bool) {
  return {
    type: types.ADD_LOCATION_IN_PROCESS,
    addCameraGroupInProcess: bool
  }
}

function addCameraGroupError(error) {
  return {
    type: types.ADD_LOCATION_ERROR,
    addCameraGroupError: error
  }
}

function addCameraGroupSuccess(bool) {
  return {
    type: types.ADD_LOCATION_SUCCESS,
    addCameraGroupSuccess: bool
  }
}

function removeCameraGroupInProcess(bool) {
  return {
    type: types.REMOVE_LOCATION_IN_PROCESS,
    removeCameraGroupInProcess: bool
  }
}

function removeCameraGroupError(error) {
  return {
    type: types.REMOVE_LOCATION_ERROR,
    removeCameraGroupError: error
  }
}

function removeCameraGroupSuccess(bool) {
  return {
    type: types.REMOVE_LOCATION_SUCCESS,
    removeCameraGroupSuccess: bool
  }
}

function addCameraGroupCameraInProcess(bool) {
  return {
    type: types.ADD_LOCATION_CAMERA_IN_PROCESS,
    addCameraGroupCameraInProcess: bool
  }
}

function addCameraGroupCameraError(error) {
  return {
    type: types.ADD_LOCATION_CAMERA_ERROR,
    addCameraGroupCameraError: error
  }
}

function addCameraGroupCameraSuccess(bool) {
  return {
    type: types.ADD_LOCATION_CAMERA_SUCCESS,
    addCameraGroupCameraSuccess: bool
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
    type: types.SHARE_LOCATION_IN_PROCESS,
    shareCameraGroupInProcess: bool
  }
}

function shareCameraGroupError(error) {
  return {
    type: types.SHARE_LOCATION_ERROR,
    shareCameraGroupError: error
  }
}

function shareCameraGroupSuccess(bool) {
  return {
    type: types.SHARE_LOCATION_SUCCESS,
    shareCameraGroupSuccess: bool
  }
}

function editCameraGroupInProcess(bool) {
  return {
    type: types.EDIT_LOCATION_IN_PROCESS,
    editCameraGroupInProcess: bool
  }
}

function editCameraGroupSuccess(bool) {
  return {
    type: types.EDIT_LOCATION_SUCCESS,
    editCameraGroupSuccess: bool
  }
}

function editCameraGroupError(error) {
  return {
    type: types.EDIT_LOCATION_ERROR,
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

export function clearCameraGroupData() {
  return {
      type: types.CLEAR_LOCATION_DATA,
      cameraGroups: initialState.cameraGroups,
      selectedCameraGroup: initialState.selectedCameraGroup
  }
}

export function selectCameraGroup(cameraGroup) {
  return (dispatch) => {
    dispatch(cameraGroupSelected(cameraGroup));
  }
}

export function bvcCameraConnection(bool) {
  return {
    type: types.BVC_CAMERA_CONNECTION,
    bvcCameraConnection: bool
  }
}

export function bvcCameraConnectionFail(bool, id) {
  return {
    type: types.BVC_CAMERA_CONNECTION_FAIL,
    bvcCameraConnectionFail: bool,
    bvcCameraConnectionFailId: id
  }
}

function parseCameraGroups(cameraGroups, user) {
  cameraGroups = cameraGroups.map(cameraGroup => {
    let myRole = cameraGroup.guards.find(guard => guard.user.id == user.id).role;

    return {
      ...cameraGroup,
      myRole
    }
  });

  return cameraGroups;
}

export function fetchCameraGroups(user) {
  return (dispatch) => {
    dispatch(fetchInProcess(true));
    dispatch(fetchError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups`;
    let config = {headers: {Authorization: user.jwt}};

    axios.get(url, config)
      .then(response => {
        dispatch(fetchSuccess(parseCameraGroups(response.data.data, user)));
      })
      .catch(error => {
        console.log('Error fetching cameraGroups: ', error);
        dispatch(fetchError(true));
      })
      .finally(() => {
        dispatch(fetchInProcess(false));
      });
  }
}

export function addCameraGroupCamera(user, cameraGroup, name, rtspUrl, username, password) {
  return (dispatch) => {
    dispatch(addCameraGroupCameraError(''));
    dispatch(addCameraGroupCameraInProcess(true));

    let index = rtspUrl.indexOf(":");
    let protocol = rtspUrl.substr(0, index + 3).toLowerCase();
    let urlAddress = rtspUrl.substr(index + 3);
    let lowerCaseUrl = (protocol + urlAddress);

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/cameras`;
    let data = {
      camera: {
        'cameraGroup_id': cameraGroup.id,
        'rtsp_url': lowerCaseUrl,
        name,
        username,
        password
      }
    };

    const cameraAddEvent = {
      email: user.email,
      name: user.firstName + ' ' + user.lastName,
      status: '',
      camera_added: name
    };

    let config = {headers: {Authorization: user.jwt}};
    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(addCameraGroupCameraSuccess(true));
        dispatch(addCameraGroupCameraSuccess(false));
        dispatch(addedCameraData(response));

        cameraAddEvent.status = 'Add Camera Success';
        dispatch(trackEventAnalytics('add camera', cameraAddEvent));
        dispatch(checkBvcCameraConnection(user, response.data.data.id));
      })
      .catch((error) => {
        let errMessage = 'Error creating camera. Please try again later.';
        if (error.response && error.response.data) {
          if (error.response.data.error) {
            errMessage = error.response.data.error;
          }
          else if (error.response.data.errors && error.response.data.errors.cameraGroup_camera_name) {
            errMessage = `This cameraGroup already has a camera named ${name}`;
          }
        }
        dispatch(addCameraGroupCameraError(errMessage));

        cameraAddEvent.status = 'Add Camera Failed';
        dispatch(trackEventAnalytics('add camera', cameraAddEvent));
      })
      .finally(() => {
        dispatch(addCameraGroupCameraError(''));
        dispatch(addCameraGroupCameraInProcess(false));
      });
  }
}
// TODO: re-work this function to hit the recos in the API and get the status for that camera id
export function checkCameraConnection(user, cameraId) {
  return (dispatch) => {
    let bvc_url = `${process.env.REACT_APP_BVC_SERVER}/api/camera/${cameraId}/connectedOnce`;
    const bvc_jwt = localStorage.getItem('bvc_jwt');
    let config = {headers: {Authorization:'JWT' + ' ' + bvc_jwt}};
    let timeout = 90;
    let checkBvc = setInterval(function(){
      if (timeout <= 0){
        dispatch(bvcCameraConnectionFail(true, cameraId));
        clearInterval(checkBvc);
      } else {
        timeout -= 5;
      }
      axios.get(bvc_url, config)
      .then((response) => {
          dispatch(bvcCameraConnection(response.data.value));
          if (response.data.value == true) {
            clearInterval(checkBvc);
          }
      })
    }, 5000, bvc_url, config);
  }
}

export function addNewCameraGroup(user, cameraGroup) {
  return (dispatch) => {
    dispatch(addCameraGroupError(''));
    dispatch(addCameraGroupInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups`;
    let config = {headers: {Authorization: user.jwt}};

    let data = {
      cameraGroup: {
        name: cameraGroup.name,
        address1: cameraGroup.address1,
        city: cameraGroup.city,
        state: cameraGroup.state,
        zip: cameraGroup.zip
      }
    };

    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(addCameraGroupSuccess(true));
        dispatch(addCameraGroupSuccess(false));
        dispatch(selectCameraGroup(response.data.data));
      })
      .catch((error) => {
        let errMessage = 'Error creating camera. Please try again later.';
        if (error.response && error.response.data && error.response.data.errors) {
          if (error.response.data.errors.cameraGroup_name) {
            errMessage = `You already have a cameraGroup named ${cameraGroup.name}`;
          }
        }
        dispatch(addCameraGroupError(errMessage));
      })
      .finally(() => {
        dispatch(addCameraGroupError(''));
        dispatch(addCameraGroupInProcess(false));
      });
  }
}

export function removeCameraGroup(user, cameraGroup) {
  return (dispatch) => {
    dispatch(removeCameraGroupError(''));
    dispatch(removeCameraGroupInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/cameraGroups/${cameraGroup.id}`;
    let config = {headers: {Authorization: user.jwt}};

    axios.delete(url, config)
      .then((response) => {
        dispatch(fetchCameraGroups(user));
        dispatch(removeCameraGroupSuccess(true));
        dispatch(removeCameraGroupSuccess(false));
        dispatch(clearCameraGroupData());
      })
      .catch((error) => {
        let errMessage = 'Error removing cameraGroup. Please try again later.';
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
    let config = {headers: {Authorization: user.jwt}};

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
        if (error.response && error.response.data) {
          if (error.response.data.errors) {
            if (error.response.data.errors.cameraGroup_guard_invitation) {
              errMessage = 'You have already sent an invitation to this email.';
            }
            else if (error.response.data.errors.invitee) {
              errMessage = `${inviteeEmail} is already a guard.`;
            }
          }
          else if (error.response.data.error) {
            errMessage = error.response.data.error;
          }
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
    let config = {headers: {Authorization: user.jwt}};

    axios.delete(url, config)
    .then(response => {
      dispatch(fetchCameraGroups(user));
    })
    .catch((error) => {
      dispatch(removeGuardError('Error removing guard.'));
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
    let config = {headers: {Authorization: user.jwt}};

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
        if (error.response && error.response.data && error.response.data.errors) {
          let errors = error.response.data.errors;
          let key = Object.entries(errors)[0][0];
          let value = Object.entries(errors)[0][1];
          if (key === 'cameraGroup_name' && value[0] === 'has already been taken') {
            errMessage = `You alread have a cameraGroup named ${cameraGroupData['name']}`
          }
          else {
            let fieldMap = {
              'name': 'Name',
              'address1': 'Address',
              'city': 'City',
              'state': 'State',
              'zip': 'Zip code'
            }
            errMessage = `${fieldMap[key]} ${value}`;
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
