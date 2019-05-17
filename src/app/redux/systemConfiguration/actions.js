import axios from 'axios';
import initialState from './initialState';
import * as types from './actionTypes';

function readSystemConfigurationsSuccess(systemConfigurations) {
  return {
    type: types.READ_SYSTEM_CONFIGURATIONS_SUCCESS,
    systemConfigurations: systemConfigurations
  }
}

export function readSystemConfigurations() {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/system-configurations`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};

    axios.get(url, config)
    .then(response => {
      dispatch(readSystemConfigurationsSuccess(response.data));
    })
    .catch((error) => {
      let errMessage = 'Error fetching recieved invites';
      if (error.response.data['Error']) {
        errMessage = error.response.data['Error'];
      }
      console.log(errMessage);
    })
  }
}

export function updateSystemConfiguration(systemConfigurationId, key, value) {
  return (dispatch) => {
    let url = `${process.env.REACT_APP_ROG_API_URL}/system-configurations`;
    let config = {headers: {Authorization: 'Bearer '+sessionStorage.getItem('jwt')}};
    let data = {
      system_configuration_id: systemConfigurationId,
      key:  key,
      value: value
    }

    axios.patch(url, data, config)
    .catch((error) => {
      let errMessage = 'Error fetching recieved invites';
      if (error.response.data['Error']) {
        errMessage = error.response.data['Error'];
      }
      console.log(errMessage);
    })
  }
}
