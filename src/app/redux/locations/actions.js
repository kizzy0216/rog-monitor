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

function fetchSuccess(locations) {
  return {
    type: types.FETCH_LOCATIONS_SUCCESS,
    locations
  }
}

function locationSelected(selectedLocation) {
  return {
    type: types.LOCATION_SELECTED,
    selectedLocation
  }
}

function addLocationInProcess(bool) {
  return {
    type: types.ADD_LOCATION_IN_PROCESS,
    addLocationInProcess: bool
  }
}

function addLocationError(error) {
  return {
    type: types.ADD_LOCATION_ERROR,
    addLocationError: error
  }
}

function addLocationSuccess(bool) {
  return {
    type: types.ADD_LOCATION_SUCCESS,
    addLocationSuccess: bool
  }
}

function removeLocationInProcess(bool) {
  return {
    type: types.REMOVE_LOCATION_IN_PROCESS,
    removeLocationInProcess: bool
  }
}

function removeLocationError(error) {
  return {
    type: types.REMOVE_LOCATION_ERROR,
    removeLocationError: error
  }
}

function removeLocationSuccess(bool) {
  return {
    type: types.REMOVE_LOCATION_SUCCESS,
    removeLocationSuccess: bool
  }
}

function addLocationCameraInProcess(bool) {
  return {
    type: types.ADD_LOCATION_CAMERA_IN_PROCESS,
    addLocationCameraInProcess: bool
  }
}

function addLocationCameraError(error) {
  return {
    type: types.ADD_LOCATION_CAMERA_ERROR,
    addLocationCameraError: error
  }
}

function addLocationCameraSuccess(bool) {
  return {
    type: types.ADD_LOCATION_CAMERA_SUCCESS,
    addLocationCameraSuccess: bool
  }
}

function addedCameraData(cameraData) {
  return {
    type: types.ADD_CAMERA_DATA,
    cameraData
  }
}

function shareLocationInProcess(bool) {
  return {
    type: types.SHARE_LOCATION_IN_PROCESS,
    shareLocationInProcess: bool
  }
}

function shareLocationError(error) {
  return {
    type: types.SHARE_LOCATION_ERROR,
    shareLocationError: error
  }
}

function shareLocationSuccess(bool) {
  return {
    type: types.SHARE_LOCATION_SUCCESS,
    shareLocationSuccess: bool
  }
}

function editLocationInProcess(bool) {
  return {
    type: types.EDIT_LOCATION_IN_PROCESS,
    editLocationInProcess: bool
  }
}

function editLocationSuccess(bool) {
  return {
    type: types.EDIT_LOCATION_SUCCESS,
    editLocationSuccess: bool
  }
}

function editLocationError(error) {
  return {
    type: types.EDIT_LOCATION_ERROR,
    editLocationError: error
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

export function clearLocationData() {
  return {
      type: types.CLEAR_LOCATION_DATA,
      locations: initialState.locations,
      selectedLocation: initialState.selectedLocation
  }
}

export function selectLocation(location) {
  return (dispatch) => {
    dispatch(locationSelected(location));
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

function parseLocations(locations, user) {
  locations = locations.map(location => {
    let myRole = location.guards.find(guard => guard.user.id == user.id).role;

    return {
      ...location,
      myRole
    }
  });

  return locations;
}

export function fetchLocations(user) {
  return (dispatch) => {
    dispatch(fetchInProcess(true));
    dispatch(fetchError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/locations`;
    let config = {headers: {Authorization: user.jwt}};

    axios.get(url, config)
      .then(response => {
        dispatch(fetchSuccess(parseLocations(response.data.data, user)));
      })
      .catch(error => {
        console.log('Error fetching locations: ', error);
        dispatch(fetchError(true));
      })
      .finally(() => {
        dispatch(fetchInProcess(false));
      });
  }
}

export function addLocationCamera(user, location, name, rtspUrl, username = "admin", password) {
  return (dispatch) => {
    dispatch(addLocationCameraError(''));
    dispatch(addLocationCameraInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/cameras`;
    let data = {
      camera: {
        'location_id': location.id,
        'rtsp_url': rtspUrl,
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
        dispatch(fetchLocations(user));
        dispatch(addLocationCameraSuccess(true));
        dispatch(addLocationCameraSuccess(false));
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
          else if (error.response.data.errors && error.response.data.errors.location_camera_name) {
            errMessage = `This location already has a camera named ${name}`;
          }
        }
        dispatch(addLocationCameraError(errMessage));

        cameraAddEvent.status = 'Add Camera Failed';
        dispatch(trackEventAnalytics('add camera', cameraAddEvent));
      })
      .finally(() => {
        dispatch(addLocationCameraError(''));
        dispatch(addLocationCameraInProcess(false));
      });
  }
}

export function checkBvcCameraConnection(user, cameraId) {
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

export function addNewLocation(user, location) {
  return (dispatch) => {
    dispatch(addLocationError(''));
    dispatch(addLocationInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/locations`;
    let config = {headers: {Authorization: user.jwt}};

    let data = {
      location: {
        name: location.name,
        address1: location.address1,
        city: location.city,
        state: location.state,
        zip: location.zip
      }
    };

    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchLocations(user));
        dispatch(addLocationSuccess(true));
        dispatch(addLocationSuccess(false));
        dispatch(selectLocation(response.data.data));
      })
      .catch((error) => {
        let errMessage = 'Error creating camera. Please try again later.';
        if (error.response && error.response.data && error.response.data.errors) {
          if (error.response.data.errors.location_name) {
            errMessage = `You already have a location named ${location.name}`;
          }
        }
        dispatch(addLocationError(errMessage));
      })
      .finally(() => {
        dispatch(addLocationError(''));
        dispatch(addLocationInProcess(false));
      });
  }
}

export function removeLocation(user, location) {
  return (dispatch) => {
    dispatch(removeLocationError(''));
    dispatch(removeLocationInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/locations/${location.id}`;
    let config = {headers: {Authorization: user.jwt}};

    axios.delete(url, config)
      .then((response) => {
        dispatch(fetchLocations(user));
        dispatch(removeLocationSuccess(true));
        dispatch(removeLocationSuccess(false));
        dispatch(clearLocationData());
      })
      .catch((error) => {
        let errMessage = 'Error removing location. Please try again later.';
        dispatch(removeLocationError(errMessage));
      })
      .finally(() => {
        dispatch(removeLocationError(''));
        dispatch(removeLocationInProcess(false));
      });
  }
}

export function shareLocation(user, locationId, inviteeEmail) {
  return (dispatch) => {
    dispatch(shareLocationError(''));
    dispatch(shareLocationInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/location_guard_invitations`;
    let config = {headers: {Authorization: user.jwt}};

    let data = {
      location_guard_invitation: {
        location_id: locationId, invitee_email: inviteeEmail, role: 'viewer'
      }
    };

    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchLocations(user));
        dispatch(shareLocationSuccess(true));
        dispatch(shareLocationSuccess(false));
      })
      .catch((error) => {
        let errMessage = 'Error sharing location. Please try again later.';
        if (error.response && error.response.data) {
          if (error.response.data.errors) {
            if (error.response.data.errors.location_guard_invitation) {
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
        dispatch(shareLocationError(errMessage));
      })
      .finally(() => {
        dispatch(shareLocationError(''));
        dispatch(shareLocationInProcess(false));
      });
  }
}

export function removeGuard(user, guard) {
  return (dispatch) => {
    dispatch(removeGuardError(''));
    dispatch(removeGuardInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/guards/${guard.id}`;
    let config = {headers: {Authorization: user.jwt}};

    axios.delete(url, config)
    .then(response => {
      dispatch(fetchLocations(user));
      dispatch(removeLocationSuccess(true));
      dispatch(removeLocationSuccess(false));
      dispatch(clearLocationData());
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

export function editLocation(user, location, locationData) {
  return (dispatch) => {
    dispatch(editLocationError(''));
    dispatch(editLocationInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/locations/${location.id}`;
    let config = {headers: {Authorization: user.jwt}};

    let data = {
      location: locationData
    };

    axios.patch(url, data, config)
      .then((response) => {
        dispatch(fetchLocations(user));
        dispatch(editLocationSuccess(true));
        dispatch(editLocationSuccess(false));
      })
      .catch((error) => {
        let errMessage = 'Error editing camera. Please try again later.';
        if (error.response && error.response.data && error.response.data.errors) {
          let errors = error.response.data.errors;
          let key = Object.entries(errors)[0][0];
          let value = Object.entries(errors)[0][1];
          if (key === 'location_name' && value[0] === 'has already been taken') {
            errMessage = `You alread have a location named ${locationData['name']}`
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
        dispatch(editLocationError(errMessage));
      })
      .finally(() => {
        dispatch(editLocationError(''));
        dispatch(editLocationInProcess(false));
      });
  }
}
