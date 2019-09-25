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

function fetchTriggersSuccessAdmin(polygonDataAdmin) {
  return{
    type: types.FETCH_POLYGON_TRIGGER_SUCCESS_ADMIN,
    polygonDataAdmin: polygonDataAdmin
  }
}

function fetchTriggerErrorAdmin(fetchTriggerErrorAdmin) {
  return {
    type: types.FETCH_POLYGON_TRIGGER_ERROR_ADMIN,
    fetchTriggerErrorAdmin: fetchTriggerErrorAdmin
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

export function createTrigger(user, triggerCoordinates, triggerType, cameraGroup, cameraUuid, triggerDuration, direction, timeWindows, shared) {
  return (dispatch) => {
    dispatch(createTriggerInProcess(true));
    dispatch(createTriggerError(false));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroup.uuid}/cameras/${cameraUuid}/triggers`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
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
      .then((response) => {
        dispatch(createTriggerSuccess(true));
      })
      .catch((error) => {
        let errMessage = 'Error creating trigger';
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        console.log(errMessage);
        dispatch(createTriggerError(true));
      })
      .finally(() => {
        dispatch(createTriggerSuccess(false));
        dispatch(createTriggerInProcess(false));
        dispatch(fetchTriggers(user, cameraGroup, cameraUuid));
      })
  }
}

export function fetchTriggers(user, cameraGroup, cameraUuid) {
  return (dispatch) => {
    dispatch(fetchTriggersInProcess(true));
    dispatch(fetchTriggersInSuccess(false));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroup.uuid}/cameras/${cameraUuid}/triggers`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.get(url, config)
      .then((response) => {
        if (isEmpty(response.data)) {
          response.data = [];
        }
        dispatch(fetchTriggersSuccess(response.data));
        dispatch(fetchTriggersInSuccess(true));
      })
      .catch((error) => {
        let errMessage = 'Error fetching triggers';
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        console.log(errMessage);
      })
      .finally(() => {
        dispatch(fetchTriggersInProcess(false));
      })
  }
}

export function deleteTrigger(user, cameraGroupUuid, cameraUuid, baseTriggersUuid) {
  return (dispatch) => {
    dispatch(deleteTriggerInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroupUuid}/cameras/${cameraUuid}/triggers/${baseTriggersUuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.delete(url, config)
      .then((response) => {
        dispatch(deleteTriggerSuccess(true));
      })
      .catch((error) => {
        let errMessage = 'Error deleting trigger'
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        console.log(errMessage);
      })
      .finally(() => {
        dispatch(deleteTriggerInProcess(false));
        dispatch(deleteTriggerSuccess(false));
      })
  }
}

export function createTriggerTimeWindow(user, cameraGroupUuid, cameraUuid, triggersUuid, timeWindow, polygonData) {
  return (dispatch) => {
    dispatch(createTriggerTimeWindowInProcess(true));
    for (var i = 0; i < polygonData.length; i++) {
      if (triggersUuid == polygonData[i].base_trigger.uuid) {
        triggersUuid = polygonData[i].uuid;
        break;
      }
    }
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroupUuid}/cameras/${cameraUuid}/triggers/${triggersUuid}/trigger-time-windows`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = {
      days_of_week: timeWindow.days_of_week,
      start_at: timeWindow.start_at,
      end_at: timeWindow.end_at,
      shared: timeWindow.shared
    };

    axios.post(url, data, config)
      .then((response) => {
        dispatch(createTriggerTimeWindowSuccess(true));
        let cameraGroup = {uuid: cameraGroupUuid};
        dispatch(fetchTriggers(user, cameraGroup, cameraUuid));
      })
      .catch((error) => {
        let errMessage = 'Error creating trigger time window';
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        console.log(errMessage);
        dispatch(createTriggerTimeWindowError(true));
      })
      .finally(() => {
        dispatch(createTriggerTimeWindowSuccess(false));
        dispatch(createTriggerTimeWindowInProcess(false));
      })
  }
}

export function updateTriggerTimeWindow(user, cameraGroupUuid, cameraUuid, triggersUuid, timeWindow, polygonData) {
  return (dispatch) => {
    dispatch(updateTriggerTimeWindowInProcess(true));
    for (var i = 0; i < polygonData.length; i++) {
      if (triggersUuid == polygonData[i].base_trigger.uuid) {
        triggersUuid = polygonData[i].uuid;
        break;
      }
    }
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroupUuid}/cameras/${cameraUuid}/triggers/${triggersUuid}/trigger-time-windows/${timeWindow.uuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = {
      days_of_week: timeWindow.days_of_week,
      start_at: timeWindow.start_at,
      end_at: timeWindow.end_at
    };

    axios.patch(url, data, config)
      .then((response) => {
        dispatch(updateTriggerTimeWindowSuccess(true));
        let cameraGroup = {uuid: cameraGroupUuid};
        dispatch(fetchTriggers(user, cameraGroup, cameraUuid));
      })
      .catch((error) => {
        let errMessage = 'Error updating trigger time window';
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        console.log(errMessage);
      })
      .finally(() => {
        dispatch(updateTriggerTimeWindowSuccess(false));
        dispatch(updateTriggerTimeWindowInProcess(false));
      })
  }
}

export function deleteTriggerTimeWindow(user, cameraGroupUuid, cameraUuid, baseTriggersUuid, timeWindow) {
  return (dispatch) => {
    dispatch(deleteTriggerTimeWindowInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroupUuid}/cameras/${cameraUuid}/triggers/${baseTriggersUuid}/trigger-time-windows/${timeWindow.uuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.delete(url, config)
      .then((response) => {
        dispatch(deleteTriggerTimeWindowSuccess(true));
        let cameraGroup = {uuid: cameraGroupUuid};
        dispatch(fetchTriggers(user, cameraGroup, cameraUuid));
      })
      .catch((error) => {
        let errMessage = 'Error deleting trigger time window';
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        console.log(errMessage);
      })
      .finally(() => {
        dispatch(deleteTriggerTimeWindowInProcess(false));
        dispatch(deleteTriggerTimeWindowSuccess(false));
      })
  }
}

export function fetchTriggersAdmin(user, values) {
  return (dispatch) => {
    dispatch(fetchTriggersSuccessAdmin(""));
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${values.camera_groups_uuid}/cameras/${values.cameras_uuid}/triggers`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.get(url, config)
      .then((response) => {
        if (isEmpty(response.data)) {
          response.data = [];
          dispatch(fetchTriggerErrorAdmin("No Triggers Found."));
        } else {
          dispatch(fetchTriggersSuccessAdmin(response.data));
        }
      })
      .catch((error) => {
        let errMessage = 'Error fetching triggers';
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        dispatch(fetchTriggerErrorAdmin(errMessage));
      })
      .finally(() => {
        dispatch(fetchTriggerErrorAdmin(""));
      })
  }
}

export function deleteTriggerAdmin(user, values, camerasUuid, cameraGroupUuid) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroupUuid}/cameras/${camerasUuid}/triggers/${values.base_triggers_uuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.delete(url, config)
      .then((response) => {
        let values = {
          uuid: cameraGroupUuid,
          cameras_uuid: camerasUuid
        };
        dispatch(fetchTriggersAdmin(user, values));
      })
      .catch((error) => {
        let errMessage = 'Error deleting trigger'
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        dispatch(fetchTriggerErrorAdmin(errMessage));
      })
      .finally(() => {
        dispatch(fetchTriggerErrorAdmin(""));
      })
  }
}

export function updateTriggerTimeWindowAdmin(user, values, trigger, cameraGroupUuid) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroupUuid}/cameras/${trigger.cameras_uuid}/triggers/${trigger.uuid}/trigger-time-windows/${values.uuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = {
      days_of_week: values.days_of_week,
      start_at: values.start_at,
      end_at: values.end_at
    };

    axios.patch(url, data, config)
      .then((response) => {
        // enter response here.
      })
      .catch((error) => {
        console.log(error);
        let errMessage = 'Error updating trigger time window';
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        dispatch(fetchTriggerErrorAdmin(errMessage));
        let values = {
          uuid: cameraGroupUuid,
          cameras_uuid: trigger.cameras_uuid
        };
        dispatch(fetchTriggersAdmin(user, values));
      })
      .finally(() => {
        dispatch(fetchTriggerErrorAdmin(""));
      })
  }
}

export function deleteTriggerTimeWindowAdmin(user, triggerTimeWindow, camerasUuid, cameraGroupUuid) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/users/${user.uuid}/camera-groups/${cameraGroupUuid}/cameras/${camerasUuid}/triggers/${triggerTimeWindow.triggers_uuid}/trigger-time-windows/${triggerTimeWindow.uuid}`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.delete(url, config)
      .then((response) => {
        let values = {
          uuid: cameraGroupUuid,
          cameras_uuid: camerasUuid
        };
        dispatch(fetchTriggersAdmin(user, values));
      })
      .catch((error) => {
        let errMessage = 'Error deleting trigger time window';
        if (typeof error.response != 'undefined') {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
            if ('Error' in error.response.data) {
              errMessage = error.response.data['Error'];
            }
          }
        }
        dispatch(fetchTriggerErrorAdmin(errMessage));
      })
      .finally(() => {
        dispatch(fetchTriggerErrorAdmin(""));
      })
  }
}
