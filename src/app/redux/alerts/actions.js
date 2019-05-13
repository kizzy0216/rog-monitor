import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import { Socket } from '../../../lib/phoenix/phoenix';
import newAlertSound from '../../../assets/audio/newAlert.mp3';
import { updateUserData, storeUserDevice } from '../users/actions';
import * as types from './actionTypes';
import {isEmpty} from '../helperFunctions';

function fetchInProcess(bool) {
  return {
    type: types.FETCH_ALERTS_IN_PROCESS,
    fetchInProcess: bool
  }
}

function fetchError(error) {
  return {
    type: types.FETCH_ALERTS_ERROR,
    fetchError: error
  }
}

function fetchSuccess(alerts) {
  return {
    type: types.FETCH_ALERTS_SUCCESS,
    alerts
  }
}

function fetchSuccessWithPagination(alerts, pagination) {
  return {
    type: types.FETCH_ALERTS_SUCCESS_WITH_PAGINATION,
    alerts,
    pagination: pagination
  }
}

function deleteInProcess(bool) {
  return {
    type: types.DELETE_ALERT_IN_PROCESS,
    deleteInProcess: bool
  }
}

function deleteError(error) {
  return {
    type: types.DELETE_ALERT_ERROR,
    deleteError: error
  }
}

function deleteSuccess(alertId) {
  return {
    type: types.DELETE_ALERT_SUCCESS,
    alertId
  }
}

export function mergeNewAlerts() {
  return {
    type: types.MERGE_NEW_ALERTS
  }
}

export function clearAlertData() {
  return {
    type: types.CLEAR_ALERT_DATA,
    alerts: initialState.alerts,
    newAlerts: initialState.newAlerts
  }
}

function newAlert(alert, mute) {
  if (mute === false) {
    var audio = new Audio(newAlertSound);
    audio.play();
  }
  return {
    type: types.NEW_ALERT,
    alert
  }
}

function handleNewAlert(user, payload) {
  if (payload.data.trigger_type == 'RA') {
    payload.data.trigger_type = 'Restricted Area';
  } else if (payload.data.trigger_type == 'VW') {
    payload.data.trigger_type = 'Virtual Wall';
  } else {
    payload.data.trigger_type = 'Loitering Detected';
  }
  let alert = {
    id: payload.data.id,
    type: payload.data.trigger_type,
    camera: {
      name: payload.notification.title,
      cameraGroup: {
        name: payload.data.camera_groups_name
      }
    }
  }
  return (dispatch) => {
    if (typeof user.mute == 'undefined') {
      user.mute = false;
    }
    dispatch(newAlert(alert, user.mute));
  }
}

function clearAllAlerts() {
  return {
    type: types.CLEAR_ALL_NEW_ALERTS
  }
}

export function listenForNewAlerts(user, messaging) {
  return (dispatch) => {
    messaging.onMessage(payload => {
      console.log("Notification Received", payload);
      dispatch(handleNewAlert(user, payload));
      dispatch(fetchAlerts(user));
    });

    messaging.onTokenRefresh(function(user, messaging) {
      messaging.getToken().then(function(refreshedToken) {
        console.log('Token refreshed: ' + refreshedToken);
        dispatch(storeUserDevice(user, refreshedToken, messaging));
      }).catch(function(err) {
        console.log('Unable to retrieve refreshed token ', err);
      });
    });
  }
}

export function fetchAlerts(user) {
  return (dispatch) => {
    dispatch(fetchError(''));
    dispatch(fetchInProcess(true));

    let itemsPerPage = 20;
    let currentPage = 1;

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/alerts?page=${currentPage}&per_page=${itemsPerPage}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}}
    axios.get(url, config)
      .then((response) => {
        if (!isEmpty(response.data)) {
          let pagination = {
            total: response.data[0]['total_alerts'],
            per_page: itemsPerPage,
            current_page: currentPage,
            last_page: Math.ceil(response.data[0]['total_alerts'] / itemsPerPage),
            from: ((currentPage - 1) * itemsPerPage) + 1,
            to: currentPage  * itemsPerPage
          };
          dispatch(fetchSuccessWithPagination(response.data, pagination));
        } else {
          dispatch(fetchError('No Alerts Found'));
        }
      })
      .catch((error) => {
        let errMessage = 'Error fecthing alerts';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        dispatch(fetchError(errMessage));
      })
      .finally(() => {
        dispatch(fetchError(''));
        dispatch(fetchInProcess(false));
      });
  }
}

export function fetchAlertsWithPagination(user, page, pageSize) {
  return (dispatch) => {
    dispatch(fetchError(''));
    dispatch(fetchInProcess(true));

    let itemsPerPage = pageSize;
    let currentPage = page;

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/alerts?page=${currentPage}&per_page=${itemsPerPage}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}}
    axios.get(url, config)
      .then((response) => {
        if (!isEmpty(response.data)) {
          let pagination = {
            total: response.data[0]['total_alerts'],
            per_page: itemsPerPage,
            current_page: currentPage,
            last_page: Math.ceil(response.data[0]['total_alerts'] / itemsPerPage),
            from: ((currentPage - 1) * itemsPerPage) + 1,
            to: currentPage  * itemsPerPage
          };
          dispatch(fetchSuccessWithPagination(response.data, pagination));
        }
      })
      .catch((error) => {
        dispatch(fetchError('Error fetching alerts'));
      })
      .finally(() => {
        dispatch(fetchError(''));
        dispatch(fetchInProcess(false));
      });
  }
}

export function markUserAlertsViewed(user) {
  return(dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/alerts`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}}
    let data = '';
    axios.patch(url, data, config)
      .then((response) => {
        dispatch(fetchAlerts(user));
      });
  }
}

export function deleteAlert(user, alertId) {
  return (dispatch) => {
    dispatch(deleteInProcess(true));
    dispatch(deleteError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/alerts/${alertId}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    axios.delete(url, config)
      .then(response => {
        dispatch(deleteSuccess(alertId));
      })
      .catch(error => {
        let errMessage = 'Error deleting alert';
        if (error.response.data['Error']) {
          errMessage = error.response.data['Error'];
        }
        dispatch(deleteError(errMessage));
      })
      .finally(() => {
        dispatch(deleteInProcess(false));
      })
  }
}

export function clearNewAlerts() {
  return (dispatch) => {
    dispatch(clearAllAlerts());
  }
}

// TODO: examine if this function is still needed
  export function registerCamera(userId, cameraDetails) {
    return (dispatch) => {
      // dispatch(registerCameraInProcess(true));

      // const jwt = localStorage.getItem('jwt');
      //
      // let urlAlert = `${process.env.REACT_APP_BVC_SERVER}/api/user/${userId}/cameras`;
      // let config = {headers: {Authorization:'Bearer' + ' ' + jwt}};
      // let cameraData = [];
      // for(let i = 0; i < cameraDetails.length; i++) {
      //   cameraData.push({id: cameraDetails[i].id, name: cameraDetails[i].name, url: cameraDetails[i].rtspUrl, enabled: true});
      // }
      // axios.get(urlAlert, config)
      //
      //   .then((resp) => {
      //     dispatch(registerCameraSuccess(true));
      //     // Issue with BVC API. It needs all the camera ids to be sent again, else it would delete the not sent ones.
      //     for(let i = 0; i < resp.data.cameras.length; i++ ) {
      //       if (resp.data.cameras[i].id !== cameraData[i].id) {
      //         axios.post(urlAlert, cameraData, config)
      //           .then((resp) => {
      //             // dispatch(registerCameraSuccess(true));
      //           })
      //           .catch((error) => {
      //             // dispatch(registerCameraSuccess(true));
      //           })
      //
      //
      //       }
      //     }
      //
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   })
    }
}
