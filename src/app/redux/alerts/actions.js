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

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me/alerts`;
    let data = {alert: {id: alertId, is_valid: false}};
    let config = {headers: {Authorization: user.jwt}};
    axios.patch(url, data, config)
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