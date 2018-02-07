import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import { Socket } from '../../../lib/phoenix/phoenix';

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

function newAlert(alert) {
  return {
    type: types.NEW_ALERT,
    alert
  }
}

function handleNewAlert(channel) {
  return (dispatch) => {
    channel.on('new_alert', alert => dispatch(newAlert(alert)));
  }
}

function clearAllAlerts() {
  return {
    type: types.CLEAR_ALL_ALERTS
  }
}


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
        dispatch(handleNewAlert(channel));
      })
      .receive('error', resp => console.log(`Unable to join channel ${channelName}`));
  }
}

export function fetchAlerts(user) {
  return (dispatch) => {
    dispatch(fetchError(''));
    dispatch(fetchInProcess(true));


    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/alerts`;
    let config = {headers: {Authorization: user.jwt}}
    axios.get(url, config)
      .then((response) => {
        dispatch(fetchSuccess(response.data.data));
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

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/alerts/${alertId}`;
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


export function createAlert(alertCoordinates, alertType, cameraId, duration, direction) {
  return (dispatch) => {
    dispatch(createAlertInProcess(true));
    dispatch(createAlertError(false));
    const bvc_jwt = localStorage.getItem('bvc_jwt');

    let urlAlert = `${process.env.REACT_APP_BVC_SERVER}/api/cameras/` + cameraId + `/alerts`;
    let config = {headers: {Authorization:'JWT' + ' ' + bvc_jwt}};

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

export function fetchPolygonAlert(cameraId) {
  return (dispatch) => {
    dispatch(fetchPolygonAlertInProcess(true));
    dispatch(fetchPolygonAlertInSuccess(false));

    const bvc_jwt = localStorage.getItem('bvc_jwt');

    let urlAlert = `${process.env.REACT_APP_BVC_SERVER}/api/cameras/` + cameraId + `/alerts`;
    let config = {headers: {Authorization:'JWT' + ' ' + bvc_jwt}};

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

export function deletePolygonAlert(cameraId, alertId) {
  return (dispatch) => {
    dispatch(deletePolygonAlertInProcess(true));

    const bvc_jwt = localStorage.getItem('bvc_jwt');

    let urlAlert = `${process.env.REACT_APP_BVC_SERVER}/api/cameras/` + cameraId + `/alerts/` + alertId;
    let config = {headers: {Authorization: 'JWT' + ' ' + bvc_jwt}};

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

  export function registerCamera(userId, cameraDetails) {
    return (dispatch) => {
      // dispatch(registerCameraInProcess(true));

      const bvc_jwt = localStorage.getItem('bvc_jwt');

      let urlAlert = `${process.env.REACT_APP_BVC_SERVER}/api/user/` + userId + `/cameras`;
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
