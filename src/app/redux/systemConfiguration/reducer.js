import initialState from './initialState';
import * as types from './actionTypes';

const systemConfigurations = (state = initialState, action) => {
  switch (action.type) {
    case types.READ_SYSTEM_CONFIGURATIONS_SUCCESS:
      return {
        ...state,
        data: action.systemConfigurations
      }

    default:
      return state;
  }
}

export default systemConfigurations;
