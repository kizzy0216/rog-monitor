import ReactGA from 'react-ga';
import axios from 'axios';
require('promise.prototype.finally').shim();

import { clearLocationData } from '../locations/actions';
import { clearCameraData } from '../cameras/actions';
import { clearInvitesData } from '../invites/actions';
import { clearAlertData } from '../alerts/actions';
import { fetchReceivedInvites } from '../invites/actions';

import * as types from './actionTypes';

function registerInProcess(bool) {
  return {
    type: types.REGISTER_IN_PROCESS,
    registerInProcess: bool
  }
}

function registerError(error) {
  return {
    type: types.REGISTER_ERROR,
    registerError: error
  }
}

function registerSuccess() {
  return {
    type: types.REGISTER_SUCCESS
  }
}

function loginInProcess(bool) {
  return {
    type: types.LOGIN_IN_PROCESS,
    loginInProcess: bool
  }
}

function loginError(error) {
  return {
    type: types.LOGIN_ERROR,
    loginError: error
  }
}

function loginSuccess(user) {
  return {
    type: types.LOGIN_SUCCESS,
    user
  }
}

function sendInvitationInProcess(bool) {
  return {
    type: types.SEND_INVITATION_IN_PROCESS,
    sendInvitationInProcess: bool
  }
}

function sendInvitationSuccess(bool) {
  return {
    type: types.SEND_INVITATION_SUCCESS,
    sendInvitationSuccess: bool
  }
}

function sendInvitationError(error) {
  return {
    type: types.SEND_INVITATION_ERROR,
    sendInvitationError: error
  }
}

function getInvitationInProcess(bool) {
  return {
    type: types.GET_INVITATION_IN_PROCESS,
    getInvitationInProcess: bool
  }
}

function getInvitationSuccess(invitation) {
  return {
    type: types.GET_INVITATION_SUCCESS,
    invitation
  }
}

function getInvitationError(error) {
  return {
    type: types.GET_INVITATION_ERROR,
    getInvitationError: error
  }
}

function sendNewPasswordRequestInProcess(bool) {
  return {
    type: types.SEND_NEW_PASSWORD_REQUEST_IN_PROCESS,
    sendNewPasswordRequestInProcess: bool
  }
}

function sendNewPasswordRequestSuccess(bool) {
  return {
    type: types.SEND_NEW_PASSWORD_REQUEST_SUCCESS,
    sendNewPasswordRequestSuccess: bool
  }
}

function sendNewPasswordRequestError(error) {
  return {
    type: types.SEND_NEW_PASSWORD_REQUEST_ERROR,
    sendNewPasswordRequestError: error
  }
}

function getNewPasswordRequestInProcess(bool) {
  return {
    type: types.GET_NEW_PASSWORD_REQUEST_IN_PROCESS,
    getNewPasswordRequestInProcess: bool
  }
}

function getNewPasswordRequestSuccess(invitation) {
  return {
    type: types.GET_NEW_PASSWORD_REQUEST_SUCCESS,
    invitation
  }
}

function getNewPasswordRequestError(error) {
  return {
    type: types.GET_NEW_PASSWORD_REQUEST_ERROR,
    getNewPasswordRequestError: error
  }
}

export function loginMissing() {
  return {
    type: types.LOGIN_MISSING,
    user: null
  }
}

export function logoutSuccess() {
  return {
    type: types.LOGOUT_SUCCESS,
    user: null
  }
}

export function resetRegisterSuccess() {
  return {
    type: types.RESET_REGISTER_SUCCESS
  }
}

export function checkLogin() {
  return (dispatch) => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/me`;
      axios.get(url, {headers: {Authorization: jwt}})
        .then(resp => {
          const user = {
            ...resp.data,
            jwt
          };

          dispatch(loginSuccess(user));
          dispatch(fetchReceivedInvites(user));
        })
        .catch(error => {
          localStorage.removeItem('jwt');
          dispatch(loginMissing());
        });
    }
    else {
      dispatch(loginMissing());
    }
  }
}

export function register(email, firstName, lastName, phone, password, confirmPassword, token) {
  return (dispatch) => {
    dispatch(registerError(''));
    dispatch(registerInProcess(true));

    const url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/register`;
    const data = {
      invitation_token: token,
      user: {
        first_name: firstName,
        last_name: lastName,
        password_confirm: confirmPassword,
        email,
        phone,
        password
      }
    };

    axios.post(url, data)
      .then((resp) => {
        dispatch(registerSuccess());

        const registrationEvent = {
          email: email,
          name: firstName + ' ' + lastName,
          registration_status: 'Registration Successful',
          registration_date: new Date().toString().split(' ').splice(1, 4).join(' ')
        };

        dispatch(trackEventAnalytics('registration', registrationEvent));

        /*-- Needed for Woopra Trigger event --*/
        registrationEvent.registration_status = 'Registration Completed';
        setInterval(dispatch(trackEventAnalytics('registration', registrationEvent)), 1000);
      })
      .catch((error) => {
        let errMessage = 'Error registering. Please try again later';
        if (error.response && error.response.data && error.response.data.errors) {
          if (error.response.data.errors.password) {
            errMessage = error.response.data.errors.password;
          }
          else if (error.response.data.errors.token) {
            errMessage = 'Invalid invitation';
          }
        }
        dispatch(registerError(errMessage));
      })
      .finally(() => {
        dispatch(registerError(''));
        dispatch(registerInProcess(false));
      });
  }
}

export function login(email, password) {
  return (dispatch) => {
    dispatch(loginInProcess(true));
    dispatch(loginError(''));

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      dispatch(loginInProcess(false));
      dispatch(loginError('Please enter an email'));
    }
    else if (!cleanPassword) {
      dispatch(loginInProcess(false));
      dispatch(loginError('Please enter a password'));
    }
    else {
      let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/sessions`;
      axios.post(url, {session: {email: cleanEmail, password: cleanPassword}})
        .then((resp) => {
          const user = {
            ...resp.data.user,
            jwt: resp.data.jwt
          };

          localStorage.setItem('jwt', resp.data.jwt);

          dispatch(loginSuccess(user));
          dispatch(loginInProcess(false));


          dispatch(fetchReceivedInvites(user));

          // dispatch(trackEventAnalytics('User', 'Sign In', 'Sign In Success'));

          const loginEvent = {
            email: resp.data.user.email,
            name: resp.data.user.firstName + ' ' + resp.data.user.lastName,
            last_login: new Date().toString().split(' ').splice(1, 4).join(' ')
          };

          dispatch(trackEventAnalytics('login', loginEvent));
        })
        .catch((error) => {
          let errorMessage;
          if (error.response) {
            if (error.response.status === 500) {
              errorMessage = 'Server error';
            }
            else if (error.response.status === 422) {
              errorMessage = error.response.data.errors.detail;
            }
          }
          else {
            errorMessage = 'Error logging in. Please try again later.';
          }

          dispatch(loginError(errorMessage));
          dispatch(loginInProcess(false));
        });
    }
  }
}

function disconnectFromChannels(channels) {
  for (const channel of channels) {
    channel.leave();
  }
}

export function logout(channels) {
  return (dispatch) => {
    localStorage.removeItem('jwt');
    disconnectFromChannels(channels);
    dispatch(clearAssociatedData());
    dispatch(logoutSuccess());
  }
}

export function clearAssociatedData() {
  return (dispatch) => {
    dispatch(clearLocationData());
    dispatch(clearCameraData());
    dispatch(clearInvitesData());
    dispatch(clearAlertData());
  }
}

export function sendInvitationEmail(email) {
  return (dispatch) => {
    dispatch(sendInvitationError(''));
    dispatch(sendInvitationInProcess(true));

    const invitationEmail = email.trim();
    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/invitations`;
    let data = {invitation: {email: invitationEmail}};

    const invitationEvent = {
      email: invitationEmail,
      invite_status: 'Invitation Sent',
      invitation_date: new Date().toString().split(' ').splice(1, 4).join(' ')
    };

    dispatch(trackEventAnalytics('invitation', invitationEvent));


    /*-- Needed for Woopra Trigger event --*/
    invitationEvent.invite_status = 'Invitation Received';
    setInterval(dispatch(trackEventAnalytics('invitation', invitationEvent)), 1000);

    axios.post(url, data)
      .then(resp => {
        dispatch(sendInvitationSuccess(true));
        dispatch(sendInvitationSuccess(false));
      })
      .catch(error => {
        let errMessage = 'Error sending invitation. Please try again later.';
        if (error.response && error.response.data && error.response.data.errors && error.response.data.errors.email) {
          errMessage = 'An invitation has already been sent to this email.';
        }

        dispatch(sendInvitationError(errMessage));
      })
      .finally(() => {
        dispatch(sendInvitationError(''));
        dispatch(sendInvitationInProcess(false));
      })
  }
}

export function getInvitation(token) {
  return (dispatch) => {
    dispatch(getInvitationError(''));
    dispatch(getInvitationInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/invitations/${token}`;
    axios.get(url)
      .then(resp => {
        dispatch(getInvitationSuccess(resp.data.data));
      })
      .catch(error => {
        let errMessage = 'Error getting invitation. Please try again later.';
        if (error.response.status === 404) {
          errMessage = 'Invalid invation';
        }

        dispatch(getInvitationError(errMessage));
      })
      .finally(() => {
        dispatch(getInvitationError(''));
        dispatch(getInvitationInProcess(false));
      });
  }
}

export function sendNewPasswordRequestEmail(email) {
  return (dispatch) => {
    dispatch(sendNewPasswordRequestError(''));
    dispatch(sendNewPasswordRequestInProcess(true));

    const newPasswordRequestEmail = email.trim();
    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/password_reset`;
    let data = {newPasswordRequest: {email: newPasswordRequestEmail}};

    const newPasswordRequestEvent = {
      email: newPasswordRequestEmail,
      new_password_request_status: 'NewPasswordRequest Sent',
      new_password_request_date: new Date().toString().split(' ').splice(1, 4).join(' ')
    };

    dispatch(trackEventAnalytics('newPasswordRequest', newPasswordRequestEvent));


    /*-- Needed for Woopra Trigger event --*/
    newPasswordRequestEvent.invite_status = 'NewPasswordRequest Received';
    setInterval(dispatch(trackEventAnalytics('newPasswordRequest', newPasswordRequestEvent)), 1000);

    axios.post(url, data)
      .then(resp => {
        dispatch(sendNewPasswordRequestSuccess(true));
        dispatch(sendNewPasswordRequestSuccess(false));
      })
      .catch(error => {
        let errMessage = 'Error sending request. Please try again later.';
        if (error.response && error.response.data && error.response.data.errors && error.response.data.errors.email) {
          errMessage = 'A request has already been sent to this email.';
        }

        dispatch(sendNewPasswordRequestError(errMessage));
      })
      .finally(() => {
        dispatch(sendNewPasswordRequestError(''));
        dispatch(sendNewPasswordRequestInProcess(false));
      })
  }
}

export function getNewPasswordRequest(token) {
  return (dispatch) => {
    dispatch(getNewPasswordRequestError(''));
    dispatch(getNewPasswordRequestInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/password_reset/${token}`;
    axios.get(url)
      .then(resp => {
        dispatch(getNewPasswordRequestSuccess(resp.data.data));
      })
      .catch(error => {
        let errMessage = 'Error getting Valid Password Reset Request. Please try again later.';
        if (error.response.status === 404) {
          errMessage = 'Invalid request';
        }

        dispatch(getNewPasswordRequestError(errMessage));
      })
      .finally(() => {
        dispatch(getNewPasswordRequestError(''));
        dispatch(getNewPasswordRequestInProcess(false));
      });
  }
}

export function initialiseAnalyticsEngine() {
  return (dispatch) => {
    // initialiseGoogleAnalytics();
    initialiseWoopraAnalytics();
  }
}

export function trackEventAnalytics(event, data) {

  return (dispatch) => {

    woopra.identify(data);

    if ((event === 'registration') || (event === 'invitation')) {
      woopra.track(event, data);
    }
    else {
      woopra.track(data);
    }
  }
}

function initialiseGoogleAnalytics() {
  ReactGA.initialize(process.env.REACT_APP_ROG_GA_ID);
}

function initialiseWoopraAnalytics() {
  (function () {
    var t, i, e, n = window, o = document, a = arguments, s = "script",
      r = ["config", "track", "identify", "visit", "push", "call", "trackForm", "trackClick"], c = function () {
        var t, i = this;
        for (i._e = [], t = 0; r.length > t; t++)(function (t) {
          i[t] = function () {
            return i._e.push([t].concat(Array.prototype.slice.call(arguments, 0))), i
          }
        })(r[t])
      };
    for (n._w = n._w || {}, t = 0; a.length > t; t++)n._w[a[t]] = n[a[t]] = n[a[t]] || new c;
    i = o.createElement(s), i.async = 1, i.src = "//static.woopra.com/js/w.js", e = o.getElementsByTagName(s)[0], e.parentNode.insertBefore(i, e)
  })("woopra");

  woopra.config({
    domain: 'gorog.co'
  });
  woopra.track();
}
