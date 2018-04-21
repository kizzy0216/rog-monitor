import { combineReducers } from 'redux';

import auth from './auth/reducer';
import alerts from './alerts/reducer';
import locations from './locations/reducer';
import cameras from './cameras/reducer';
import invites from './invites/reducer';
import users from './users/reducer';

export default combineReducers({
  auth,
  alerts,
  locations,
  cameras,
  invites,
  users,
});
