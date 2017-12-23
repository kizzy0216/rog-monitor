import initialState from './initialState';
import * as types from './actionTypes';

const auth = (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_MISSING:
      return {
        ...state,
        user: action.user
      }
    case types.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.user
      }
    case types.REGISTER_IN_PROCESS:
      return {
        ...state,
        registerInProcess: action.registerInProcess
      }
    case types.REGISTER_ERROR:
      return {
        ...state,
        registerError: action.registerError
      }
    case types.REGISTER_SUCCESS:
      return {
        ...state,
        registerSuccess: true
      }
    case types.RESET_REGISTER_SUCCESS:
      return {
        ...state,
        registerSuccess: false
      }
    case types.LOGIN_IN_PROCESS:
      return {
        ...state,
        loginInProcess: action.loginInProcess
      }
    case types.LOGIN_ERROR:
      return {
        ...state,
        loginError: action.loginError
      }
    case types.LOGOUT_SUCCESS:
      return {
        ...state,
        user: action.user
      }
    case types.SEND_INVITATION_IN_PROCESS:
      return {
        ...state,
        sendInvitationInProcess: action.sendInvitationInProcess
      }
    case types.SEND_INVITATION_SUCCESS:
      return {
        ...state,
        sendInvitationSuccess: action.sendInvitationSuccess
      }
    case types.SEND_INVITATION_ERROR:
      return {
        ...state,
        sendInvitationError: action.sendInvitationError
      }
    case types.GET_INVITATION_IN_PROCESS:
      return {
        ...state,
        getInvitationInProcess: action.getInvitationInProcess
      }
    case types.GET_INVITATION_SUCCESS:
      return {
        ...state,
        invitation: action.invitation
      }
    case types.GET_INVITATION_ERROR:
      return {
        ...state,
        getInvitationError: action.getInvitationError
      }
    default:
      return state;
  }
}

export default auth;
