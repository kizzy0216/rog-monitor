import axios from 'axios';
require('promise.prototype.finally').shim();

import initialState from './initialState';

import { updateUserData } from '../users/actions';
import { isEmpty } from '../helperFunctions';
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

function fetchTriggersSuccess(polygonData) {
  return{
    type: types.FETCH_POLYGON_TRIGGER_SUCCESS,
    polygonData: polygonData
  }
}

function fetchTriggersInSuccess(bool) {
  return{
    type: types.FETCH_POLYGON_TRIGGER_IN_SUCCESS,
    bool
  }
}

function fetchTriggersInProcess(bool) {
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

function createTriggerTimeWindowInProcess(bool) {
  return {
    type: types.CREATE_TRIGGER_TIME_WINDOW_IN_PROCESS,
    bool
  }
}

function createTriggerTimeWindowSuccess(bool) {
  return {
    type: types.CREATE_TRIGGER_TIME_WINDOW_SUCCESS,
    bool
  }
}

function createTriggerTimeWindowError(bool) {
  return{
    type: types.CREATE_TRIGGER_TIME_WINDOW_ERROR,
    bool
  }
}

function updateTriggerTimeWindowInProcess(bool) {
  return {
    type: types.UPDATE_TRIGGER_TIME_WINDOW_IN_PROCESS,
    bool
  }
}

function updateTriggerTimeWindowSuccess(bool) {
  return {
    type: types.UPDATE_TRIGGER_TIME_WINDOW_SUCCESS,
    bool
  }
}

function deleteTriggerTimeWindowInProcess(bool) {
  return {
    type: types.DELETE_TRIGGER_TIME_WINDOW_IN_PROCESS,
    bool
  }
}

function deleteTriggerTimeWindowSuccess(bool) {
  return {
    type: types.DELETE_TRIGGER_TIME_WINDOW_SUCCESS,
    bool
  }
}

function updateTriggerTimeWindowData(values) {
  return {
    type: types.UPDATE_TRIGGER_TIME_WINDOWS_DATA,
    triggerTimeWindows: values
  }
}

export function addNewTriggerTimeWindow(values) {
  return (dispatch) => {
    values.push({'start_at': null, 'end_at': null, 'days_of_week': []});
    dispatch(updateTriggerTimeWindowData(values));
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
    values[timeWindowSelect]['days_of_week'] = [];
    values[timeWindowSelect]['start_at'] = null;
    values[timeWindowSelect]['end_at'] = null;
    dispatch(updateTriggerTimeWindowData(values));
  }
}
export function setTriggerSpecificTimeWindows(triggers) {
  return (dispatch) => {
    dispatch(updateTriggerTimeWindowData(triggers));
  }
}

export function clearTriggerSpecificTimeWindows() {
  return (dispatch) => {
    dispatch(updateTriggerTimeWindowData([]));
  }
}

export function createTrigger(user, triggerCoordinates, triggerType, cameraGroup, cameraId, triggerDuration, direction, timeWindows, shared) {
  return (dispatch) => {
    dispatch(createTriggerInProcess(true));
    dispatch(createTriggerError(false));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}/cameras/${cameraId}/triggers`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    let triggerData = {
      trigger_type: triggerType,
      target_type: null,
      vertices: triggerCoordinates,
      time_windows: timeWindows,
      trigger_duration: triggerDuration,
      direction: direction,
      shared: shared
    };

    axios.post(url, triggerData, config)
      .then((resp) => {
        dispatch(createTriggerSuccess(true));
        dispatch(fetchTriggers(user, cameraGroup, cameraId));
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

export function fetchTriggers(user, cameraGroup, cameraId) {
  return (dispatch) => {
    dispatch(fetchTriggersInProcess(true));
    dispatch(fetchTriggersInSuccess(false));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroup.id}/cameras/${cameraId}/triggers`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    axios.get(url, config)
      .then((resp) => {
        if (isEmpty(resp.data)) {
          resp.data = [];
        }
        dispatch(fetchTriggersSuccess(resp.data));
        dispatch(fetchTriggersInSuccess(true));
      })
      .catch((error) => {
        console.log(error.response);
      })
      .finally(() => {
        dispatch(fetchTriggersInSuccess(false));
        dispatch(fetchTriggersInProcess(false));
      })
  }
}

export function deleteTrigger(user, cameraGroupId, cameraId, baseTriggersId) {
  return (dispatch) => {
    dispatch(deleteTriggerInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/cameras/${cameraId}/triggers/${baseTriggersId}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    axios.delete(url, config)
      .then((resp) => {
        dispatch(deleteTriggerSuccess(true));
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        dispatch(deleteTriggerInProcess(false));
        dispatch(deleteTriggerSuccess(false));
      })
  }
}

export function createTriggerTimeWindow(user, cameraGroupId, cameraId, triggersId, timeWindow) {
  return (dispatch) => {
    dispatch(createTriggerTimeWindowInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/cameras/${cameraId}/triggers/${triggersId}/trigger-time-windows`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    let data = {
      days_of_week: timeWindow.days_of_week,
      start_at: timeWindow.start_at,
      end_at: timeWindow.end_at
    };

    axios.post(url, data, config)
      .then((resp) => {
        dispatch(createTriggerTimeWindowSuccess(true));
        let cameraGroup = {id: cameraGroupId};
        dispatch(fetchTriggers(user, cameraGroup, cameraId));
      })
      .catch((error) => {
        dispatch(createTriggerTimeWindowError(true));
      })
      .finally(() => {
        dispatch(createTriggerTimeWindowSuccess(false));
        dispatch(createTriggerTimeWindowInProcess(false));
      })
  }
}

export function updateTriggerTimeWindow(user, cameraGroupId, cameraId, triggersId, timeWindow) {
  return (dispatch) => {
    dispatch(updateTriggerTimeWindowInProcess(true));
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/cameras/${cameraId}/triggers/${triggersId}/trigger-time-windows/${timeWindow.id}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};
    let data = {
      days_of_week: timeWindow.days_of_week,
      start_at: timeWindow.start_at,
      end_at: timeWindow.end_at
    };

    axios.patch(url, data, config)
      .then((resp) => {
        dispatch(updateTriggerTimeWindowSuccess(true));
        let cameraGroup = {id: cameraGroupId};
        dispatch(fetchTriggers(user, cameraGroup, cameraId));
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        dispatch(updateTriggerTimeWindowSuccess(false));
        dispatch(updateTriggerTimeWindowInProcess(false));
      })
  }
}

export function deleteTriggerTimeWindow(user, cameraGroupId, cameraId, baseTriggersId, timeWindow) {
  return (dispatch) => {
    dispatch(deleteTriggerTimeWindowInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.id}/camera-groups/${cameraGroupId}/cameras/${cameraId}/triggers/${baseTriggersId}/trigger-time-windows/${timeWindow.id}`;
    let config = {headers: {Authorization: 'Bearer '+user.jwt}};

    axios.delete(url, config)
      .then((resp) => {
        dispatch(deleteTriggerTimeWindowSuccess(true));
        let cameraGroup = {id: cameraGroupId};
        dispatch(fetchTriggers(user, cameraGroup, cameraId));
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        dispatch(deleteTriggerTimeWindowInProcess(false));
        dispatch(deleteTriggerTimeWindowSuccess(false));
      })
  }
}
