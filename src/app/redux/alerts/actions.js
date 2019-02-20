import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import { Socket } from '../../../lib/phoenix/phoenix';
import newAlertSound from '../../../assets/audio/newAlert.mp3';
import { updateUserData } from '../users/actions';
import * as types from './actionTypes';

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

function createAlertInProcess(bool) {
  return {
    type: types.CREATE_ALERT_IN_PROCESS,
   bool
  }
}

function createAlertError(bool) {
  return {
    type: types.CREATE_ALERT_ERROR,
    createAlertError: bool
  }
}

function createAlertSuccess(bool) {
  return {
    type: types.CREATE_ALERT_SUCCESS,
    createAlertSuccess: bool
  }
}

function fetchPolygonAlertSuccess(polygonData) {
  return{
    type: types.FETCH_POLYGON_ALERT_SUCCESS,
    polygonData
  }
}

function fetchPolygonAlertInSuccess(bool) {
  return{
    type: types.FETCH_POLYGON_ALERT_IN_SUCCESS,
    bool
  }
}

function fetchPolygonAlertInProcess(bool) {
  return{
    type: types.FETCH_POLYGON_ALERT_IN_PROCESS,
    bool
  }
}

function deletePolygonAlertSuccess(bool) {
  return {
    type: types.DELETE_POLYGON_ALERT_SUCCESS,
    bool
  }
}

function deletePolygonAlertInProcess(bool) {
  return {
    type: types.DELETE_POLYGON_ALERT_IN_PROCESS,
    bool
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
    newAlerts: initialState.newAlerts,
    channels: initialState.channels
  }
}

function channelConnected(channel) {
  return {
    type: types.CHANNEL_CONNECTED,
    channel
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

function handleNewAlert(channel, user) {
  return (dispatch) => {
    if (typeof user.mute == 'undefined') {
      user.mute = false;
    }
    channel.on('new_alert', alert => dispatch(newAlert(alert, user.mute)));
  }
}

function clearAllAlerts() {
  return {
    type: types.CLEAR_ALL_ALERTS
  }
}

// TODO: change this function to use FCM logic
export function listenForNewAlerts(user) {
  return (dispatch) => {
    let channelName = `alerts:user-${user.id}`;
    let params = {token: user.jwt};
    let ws = new Socket(`${process.env.REACT_APP_ROG_WS_URL}/socket`, {params});

    ws.connect();

    let channel = ws.channel(channelName, {});
    channel.join()
      .receive('ok', resp => {
        dispatch(channelConnected(channel));
        dispatch(handleNewAlert(channel, user));
      })
      .receive('error', resp => console.log(`Unable to join channel ${channelName}`));

    user.channel = channel;
    dispatch(updateUserData(user));
  }
}

export function fetchAlerts(user) {
  return (dispatch) => {
    dispatch(fetchError(''));
    dispatch(fetchInProcess(true));


    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/alerts`;
    let config = {headers: {Authorization: user.jwt}}
    axios.get(url, config)
      .then((response) => {
        dispatch(fetchSuccessWithPagination(response.data.data, response.data.pagination));
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
// TODO: change this function to load alerts with pagination on this side of the code.
export function fetchAlertsWithPagination(user, page) {
  return (dispatch) => {
    dispatch(fetchError(''));
    dispatch(fetchInProcess(true));


    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/alerts`;
    let config = {headers: {Authorization: user.jwt}}
    let data = {
      page: page
    }
    axios.post(url, data, config)
      .then((response) => {
        dispatch(fetchSuccessWithPagination(response.data.data, response.data.pagination));
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

export function deleteAlert(user, alertId) {
  return (dispatch) => {
    dispatch(deleteInProcess(true));
    dispatch(deleteError(''));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/alerts/${alertId}`;
    let config = {headers: {Authorization: user.jwt}};
    axios.delete(url, config)
      .then(response => {
        dispatch(deleteSuccess(alertId));
      })
      .catch(error => {
        dispatch(deleteError('Error deleting alert.'))
      })
      .finally(() => {
        dispatch(deleteInProcess(false));
      })
  }
}

export function clearAlerts() {
  return (dispatch) => {
    dispatch(clearAllAlerts());
  }
}


export function createAlertTrigger(alertCoordinates, alertType, cameraGroupId, cameraId, duration, direction) {
  return (dispatch) => {
    dispatch(createAlertInProcess(true));
    dispatch(createAlertError(false));

    let urlAlert = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/${cameras}/${cameraId}/triggers`;
    let config = {headers: {Authorization: user.jwt}};

    let alertData = {type: alertType, points: alertCoordinates};
    if(duration !== undefined){
      alertData['duration'] = duration;
    }
    if(direction !== undefined){
      alertData['direction'] = direction;
    }


    axios.post(urlAlert, alertData, config)
      .then((resp) => {
        dispatch(createAlertSuccess(true));
      })
      .catch((error) => {
        dispatch(createAlertError(true));
      })
      .finally(() => {
        dispatch(createAlertSuccess(false));
        dispatch(createAlertInProcess(false));
      })
  }
}

export function fetchPolygonAlertTrigger(user, cameraGroupId, cameraId, baseTriggersId) {
  return (dispatch) => {
    dispatch(fetchPolygonAlertInProcess(true));
    dispatch(fetchPolygonAlertInSuccess(false));

    let urlAlert = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/cameras/${cameraId}/triggers/${baseTriggersId}`;
    let config = {headers: {Authorization: user.jwt}};

    axios.get(urlAlert, config)
      .then((resp) => {
        dispatch(fetchPolygonAlertSuccess(resp.data));
        dispatch(fetchPolygonAlertInSuccess(true));
      })
      .catch((error) => {
      })
      .finally(() => {
        dispatch(fetchPolygonAlertInProcess(false));
      })
  }
}

export function deletePolygonAlertTrigger(user, cameraGroupId, cameraId, baseTriggersId) {
  return (dispatch) => {
    dispatch(deletePolygonAlertInProcess(true));

    let urlAlert = `${process.env.REACT_APP_BVC_SERVER}/users/${user.id}/camera-groups/${cameraGroupId}/cameras/${cameraId}/triggers/${baseTriggersId}`;
    let config = {headers: {Authorization: user.jwt}};

    axios.delete(urlAlert, config)
      .then((resp) => {
        dispatch(deletePolygonAlertSuccess(true));
      })
      .catch((error) => {
      })
      .finally(() => {
        dispatch(deletePolygonAlertInProcess(false));
        dispatch(deletePolygonAlertSuccess(false));
      })
  }
}
// TODO: examine if thie function is still needed
  export function registerCamera(userId, cameraDetails) {
    return (dispatch) => {
      // dispatch(registerCameraInProcess(true));

      const bvc_jwt = localStorage.getItem('bvc_jwt');

      let urlAlert = `${process.env.REACT_APP_BVC_SERVER}/api/user/${userId}/cameras`;
      let config = {headers: {Authorization:'JWT' + ' ' + bvc_jwt}};
      let cameraData = [];
      for(let i = 0; i < cameraDetails.length; i++) {
        cameraData.push({id: cameraDetails[i].id, name: cameraDetails[i].name, url: cameraDetails[i].rtspUrl, enabled: true});
      }
      axios.get(urlAlert, config)

        .then((resp) => {

          // Issue with BVC API. It needs all the camera ids to be sent again, else it would delete the not sent ones.
          for(let i = 0; i < resp.data.cameras.length; i++ ) {
            if (resp.data.cameras[i].id !== cameraData[i].id) {
              axios.post(urlAlert, cameraData, config)
                .then((resp) => {
                  // dispatch(registerCameraSuccess(true));
                })
                .catch((error) => {
                  // dispatch(registerCameraSuccess(true));
                })


            }
          }

        })
        .catch((error) => {
        })
    }
}
