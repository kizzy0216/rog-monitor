import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';
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

function deleteSuccess(alertUuid) {
  return {
    type: types.DELETE_ALERT_SUCCESS,
    alertUuid
  }
}

function clearAllAlerts() {
  return {
    type: types.CLEAR_ALL_NEW_ALERTS
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
  } else if (payload.data.trigger_type == 'LD'){
    payload.data.trigger_type = 'Loitering Detected';
  }
  let alert = {
    uuid: payload.data.uuid,
    type: payload.data.trigger_type,
    camera: {
      name: payload.data.camera_name,
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

var previousAlert = null;

export function listenForNewAlerts(user, messaging) {
  return (dispatch) => {
    messaging.onTokenRefresh(function(user, messaging) {
      messaging.getToken("153344187169", "FCM").then(function(refreshedToken) {
        console.log('Token refreshed: ' + refreshedToken);
        dispatch(storeUserDevice(user, refreshedToken, messaging));
      }).catch(function(err) {
        console.log('Unable to retrieve refreshed token ', err);
      });
    });

    messaging.onMessage((payload) => {
      if (previousAlert !== payload.data.uuid) {
        console.log("Notification Received", payload);
        previousAlert = payload.data.uuid;
        dispatch(handleNewAlert(user, payload));
        dispatch(fetchAlerts(user));
      }
    });
  }
}

export function fetchAlerts(user) {
  return (dispatch) => {
    dispatch(fetchError(''));
    dispatch(fetchInProcess(true));

    let itemsPerPage = 20;
    let currentPage = 1;

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/alerts?page=${currentPage}&per_page=${itemsPerPage}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}}
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
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if (typeof error.response.data === 'object') {
              if ('Error' in error.response.data) {
                errMessage = error.response.data['Error'];
              }
            }
          }
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

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/alerts?page=${currentPage}&per_page=${itemsPerPage}`;
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
        let errMessage = 'Error fetching alerts';
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        dispatch(fetchError(errMessage));
      })
      .finally(() => {
        dispatch(fetchError(''));
        dispatch(fetchInProcess(false));
      });
  }
}

export function markUserAlertsViewed(user) {
  return(dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/alerts`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}}
    let data = '';
    axios.patch(url, data, config)
      .then((response) => {
        dispatch(fetchAlerts(user));
      });
  }
}

export function deleteAlert(user, alertUuid) {
  return (dispatch) => {
    dispatch(deleteInProcess(true));
    dispatch(deleteError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/alerts/${alertUuid}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    axios.delete(url, config)
      .then(response => {
        dispatch(deleteSuccess(alertUuid));
      })
      .catch(error => {
        let errMessage = 'Error deleting alert';
        if ('Error' in error.response.data) {
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
