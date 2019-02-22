import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import { updateUserData } from '../users/actions';
import * as types from './actionTypes';

function createTriggerInProcess(bool) {
  return {
    type: types.CREATE_TRIGGER_IN_PROCESS,
   bool
  }
}

function createTriggerError(bool) {
  return {
    type: types.CREATE_TRIGGER_ERROR,
    createTriggerError: bool
  }
}

function createTriggerSuccess(bool) {
  return {
    type: types.CREATE_TRIGGER_SUCCESS,
    createTriggerSuccess: bool
  }
}

function fetchTriggerSuccess(polygonData) {
  return{
    type: types.FETCH_POLYGON_TRIGGER_SUCCESS,
    polygonData
  }
}

function fetchTriggerInSuccess(bool) {
  return{
    type: types.FETCH_POLYGON_TRIGGER_IN_SUCCESS,
    bool
  }
}

function fetchTriggerInProcess(bool) {
  return{
    type: types.FETCH_POLYGON_TRIGGER_IN_PROCESS,
    bool
  }
}

function deleteTriggerSuccess(bool) {
  return {
    type: types.DELETE_POLYGON_TRIGGER_SUCCESS,
    bool
  }
}

function deleteTriggerInProcess(bool) {
  return {
    type: types.DELETE_POLYGON_TRIGGER_IN_PROCESS,
    bool
  }
}

function updateTriggerTimeWindowData(values) {
  return {
    type: types.UPDATE_TRIGGER_TIME_WINDOWS_DATA,
    trigger_windows: values
  }
}

export function updateTimeWindowData(timeWindowSelect, values, fieldValue, fieldName) {
  return (dispatch) => {
    values[timeWindowSelect][fieldName] = fieldValue;
    dispatch(updateTriggerTimeWindowData(values));
  };
}

export function clearTimeWindowData(timeWindowSelect, values) {
  return (dispatch) => {
    values[timeWindowSelect]['daysOfWeek'] = [];
    values[timeWindowSelect]['start'] = null;
    values[timeWindowSelect]['stop'] = null;
    dispatch(updateTriggerTimeWindowData(values));
  }
}

// TODO: build create, update, delete functions for trigger_time_windows

export function createTrigger(triggerCoordinates, triggerType, cameraGroupId, cameraId, duration, direction) {
  return (dispatch) => {
    dispatch(createTriggerInProcess(true));
    dispatch(createTriggerError(false));

    let urlTrigger = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/${cameras}/${cameraId}/triggers`;
    let config = {headers: {Authorization: user.jwt}};
    // TODO: Get time_windows data out of the cameraData and split it into its own data variable.
    // TODO: Add target_type and time_windows to the data being sent.
    let triggerData = {triggerType: triggerType, vertices: triggerCoordinates};
    if(duration !== undefined){
      triggerData['duration'] = duration;
    }
    if(direction !== undefined){
      triggerData['direction'] = direction;
    }

    axios.post(urlTrigger, triggerData, config)
      .then((resp) => {
        dispatch(createTriggerSuccess(true));
      })
      .catch((error) => {
        dispatch(createTriggerError(true));
      })
      .finally(() => {
        dispatch(createTriggerSuccess(false));
        dispatch(createTriggerInProcess(false));
      })
  }
}

export function fetchTrigger(user, cameraGroupId, cameraId, baseTriggersId) {
  return (dispatch) => {
    dispatch(fetchTriggerInProcess(true));
    dispatch(fetchTriggerInSuccess(false));

    let urlTrigger = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/cameras/${cameraId}/triggers/${baseTriggersId}`;
    let config = {headers: {Authorization: user.jwt}};

    axios.get(urlTrigger, config)
      .then((resp) => {
        dispatch(fetchTriggerSuccess(resp.data));
        dispatch(fetchTriggerInSuccess(true));
      })
      .catch((error) => {
      })
      .finally(() => {
        dispatch(fetchTriggerInProcess(false));
      })
  }
}

export function deleteTrigger(user, cameraGroupId, cameraId, baseTriggersId) {
  return (dispatch) => {
    dispatch(deleteTriggerInProcess(true));

    let urlTrigger = `${process.env.REACT_APP_BVC_SERVER}/users/${user.id}/camera-groups/${cameraGroupId}/cameras/${cameraId}/triggers/${baseTriggersId}`;
    let config = {headers: {Authorization: user.jwt}};

    axios.delete(urlTrigger, config)
      .then((resp) => {
        dispatch(deleteTriggerSuccess(true));
      })
      .catch((error) => {
      })
      .finally(() => {
        dispatch(deleteTriggerInProcess(false));
        dispatch(deleteTriggerSuccess(false));
      })
  }
}
