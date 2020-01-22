import { combineReducers } from 'redux';

import auth from './auth/reducer';
import alerts from './alerts/reducer';
import cameraGroups from './cameraGroups/reducer';
import cameras from './cameras/reducer';
import invites from './invites/reducer';
import users from './users/reducer';
import triggers from './triggers/reducer';
import systemConfigurations from './systemConfiguration/reducer';
import recos from './recos/reducer';
import { firebaseReducer } from 'react-redux-firebase';

export default combineReducers({
  auth,
  alerts,
  cameraGroups,
  cameras,
  invites,
  users,
  triggers,
  systemConfigurations,
  recos,
  firebase: firebaseReducer
});
