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

function resetPasswordInProcess(bool) {
  return {
    type: types.RESET_PASSWORD_IN_PROCESS,
    resetPasswordInProcess: bool
  }
}

function resetPasswordError(error) {
  return {
    type: types.RESET_PASSWORD_ERROR,
    resetPasswordError: error
  }
}

function resetPasswordSuccess() {
  return {
    type: types.RESET_PASSWORD_SUCCESS
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

function sendPasswordResetRequestInProcess(bool) {
  return {
    type: types.SEND_PASSWORD_RESET_REQUEST_IN_PROCESS,
    sendPasswordResetRequestInProcess: bool
  }
}

function sendPasswordResetRequestSuccess(bool) {
  return {
    type: types.SEND_PASSWORD_RESET_REQUEST_SUCCESS,
    sendPasswordResetRequestSuccess: bool
  }
}

function sendPasswordResetRequestError(error) {
  return {
    type: types.SEND_PASSWORD_RESET_REQUEST_ERROR,
    sendPasswordResetRequestError: error
  }
}

function getPasswordResetRequestInProcess(bool) {
  return {
    type: types.GET_PASSWORD_RESET_REQUEST_IN_PROCESS,
    getPasswordResetRequestInProcess: bool
  }
}

function getPasswordResetRequestSuccess(request) {
  return {
    type: types.GET_PASSWORD_RESET_REQUEST_SUCCESS,
    request
  }
}

function getPasswordResetRequestError(error) {
  return {
    type: types.GET_PASSWORD_RESET_REQUEST_ERROR,
    getPasswordResetRequestError: error
  }
}

function bvcAuthSuccess(token) {
  return {
    type: types.BVC_AUTH_SUCCESS,
    token
  }
}

function bvcAuthInProcess(bool) {
  return {
    type: types.BVC_INTERACTION_IN_PROCESS,
    bool
  }
}

function bvcAuthError(error) {
  return {
    type: types.BVC_AUTH_ERROR,
    error
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

export function resetResetPasswordSuccess() {
  return {
    type: types.RESET_RESET_PASSWORD_SUCCESS
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
          if (jwtTokenRefresh === null) {
            dispatch(login(localStorage.getItem('email'), localStorage.getItem('password')));
          }
        })
        .catch(error => {
          localStorage.removeItem('jwt');
          localStorage.removeItem('bvc_jwt');
          if(jwtTokenRefresh !== null){
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            window.clearInterval(jwtTokenRefresh);
          };
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

export function resetPassword(password, confirmPassword, token) {
  return (dispatch) => {
    dispatch(resetPasswordError(''));
    dispatch(resetPasswordInProcess(true));

    const url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/reset_password`;
    const data = {
      password_reset_token: token,
      user: {
        password_confirm: confirmPassword,
        password
      }
    };

    axios.post(url, data)
      .then((resp) => {
        dispatch(resetPasswordSuccess());

        const registrationEvent = {
          reset_password_status: 'Password Reset Successful',
          reset_password_date: new Date().toString().split(' ').splice(1, 4).join(' ')
        };

        dispatch(trackEventAnalytics('resetPassword', resetPasswordEvent));

        /*-- Needed for Woopra Trigger event --*/
        resetPasswordEvent.reset_password_status = 'Password Reset Completed';
        setInterval(dispatch(trackEventAnalytics('resetPassword', resetPasswordEvent)), 1000);
      })
      .catch((error) => {
        let errMessage = 'Error resetting your password. Please try again later';
        if (error.response && error.response.data && error.response.data.errors) {
          if (error.response.data.errors.password) {
            errMessage = error.response.data.errors.password;
          }
          else if (error.response.data.errors.token) {
            errMessage = 'Invalid request';
          }
        }
        dispatch(resetPasswordError(errMessage));
      })
      .finally(() => {
        dispatch(resetPasswordError(''));
        dispatch(resetPasswordInProcess(false));
      });
  }
}

// set timout variable to call login function to refresh token
var jwtTokenRefresh = null;

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
          typeof(localStorage.getItem('email') == 'undefined') ? localStorage.setItem('email', email) : '';
          typeof(localStorage.getItem('password') == 'undefined') ? localStorage.setItem('password', password) : '';

          if (jwtTokenRefresh === null) {
            jwtTokenRefresh = window.setInterval(
              function(){
                dispatch(login(email, password));
              }, (570 * 1000), [email, password]
            );
          }

          dispatch(loginSuccess(user));
          dispatch(loginInProcess(false));
          dispatch(authenticateBVCServer());
          dispatch(fetchReceivedInvites(user));

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
            } else if (error.response.status === 422) {
              errorMessage = error.response.data.errors.detail;
            }
          }
          else {
            console.log(error);
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
    localStorage.removeItem('bvc_jwt');
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    window.clearInterval(jwtTokenRefresh);
    jwtTokenRefresh = null;
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

export function sendPasswordResetRequestEmail(email) {
  return (dispatch) => {
    dispatch(sendPasswordResetRequestError(''));
    dispatch(sendPasswordResetRequestInProcess(true));

    const passwordResetRequestEmail = email.trim();
    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/password_reset_request`;
    let data = {request: {email: passwordResetRequestEmail}};

    const passwordResetRequestEvent = {
      email: passwordResetRequestEmail,
      password_reset_request_status: 'PasswordResetRequest Sent',
      password_reset_request_date: new Date().toString().split(' ').splice(1, 4).join(' ')
    };

    dispatch(trackEventAnalytics('passwordResetRequest', passwordResetRequestEvent));


    /*-- Needed for Woopra Trigger event --*/
    passwordResetRequestEvent.invite_status = 'PasswordResetRequest Received';
    setInterval(dispatch(trackEventAnalytics('passwordResetRequest', passwordResetRequestEvent)), 1000);

    axios.post(url, data)
      .then(resp => {
        dispatch(sendPasswordResetRequestSuccess(true));
        dispatch(sendPasswordResetRequestSuccess(false));
      })
      .catch(error => {
        let errMessage = 'Sorry, we can\'t find that email.';

        dispatch(sendPasswordResetRequestError(errMessage));
      })
      .finally(() => {
        dispatch(sendPasswordResetRequestError(''));
        dispatch(sendPasswordResetRequestInProcess(false));
      })
  }
}

export function getPasswordResetRequest(token) {
  return (dispatch) => {
    dispatch(getPasswordResetRequestError(''));
    dispatch(getPasswordResetRequestInProcess(true));

    let url = `${process.env.REACT_APP_ROG_API_URL}/api/v1/password_reset_form/${token}`;
    axios.get(url)
      .then(resp => {
        dispatch(getPasswordResetRequestSuccess(resp.data.data));
      })
      .catch(error => {
        let errMessage = 'Error getting Valid Password Reset Request. Please try again later.';
        if (error.response.status === 404) {
          let errMessage = 'Invalid request: 404';
        }
        dispatch(getPasswordResetRequestError(errMessage));
      })
      .finally(() => {
        dispatch(getPasswordResetRequestError(''));
        dispatch(getPasswordResetRequestInProcess(false));
      })
  }
}

export function checkBVCAuthToken() {
  return (dispatch) => {
    const jwt = localStorage.getItem('bvc_jwt');
    if (jwt) {
      dispatch(loginSuccess(jwt));
    } else {
      dispatch(loginMissing());
    }
  }
}

export function authenticateBVCServer() {
  return (dispatch) => {
    dispatch(bvcAuthInProcess(true));
    dispatch(bvcAuthError(''));

    let url = `${process.env.REACT_APP_BVC_SERVER}/api/auth`;
    let data = {username: 'rogt-1', password: 'qwerty1'};
    axios.post(url, data)
      .then((resp) => {
        const bvc_authToken = resp.data.access_token;

        localStorage.setItem('bvc_jwt', bvc_authToken);

        dispatch(bvcAuthSuccess(bvc_authToken));
        dispatch(bvcAuthInProcess(true));
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
          errorMessage = 'Error Authorizing. Please try again later.';
        }

        dispatch(bvcAuthError(errorMessage));
        dispatch(bvcAuthInProcess(false));
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
