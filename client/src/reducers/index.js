import { combineReducers } from 'redux';
import toggleMenu from './toggleMenu';
import widthChanged from './widthChanged';

/* Reducers */

// When user logs in/out
const changeLoginReducer = (loggedIn = false, action) => {
  // If action is to change login, return the changed login state.
  // Else, return original state
  if (action.type === 'CHANGE_LOGIN') return action.payload.loggedIn;

  return loggedIn;
};

// When user gets verified
const changeVerifyReducer = (verified = false, action) => {
  // If action is to change verification, return the changed verification state.
  // Else, return original state
  if (action.type === 'CHANGE_VERIFY') return action.payload.verified;

  return verified;
};

// When we get new user data
const changeUserData = (user = null, action) => {
  // If action is to change user data, return the new user data state.
  // Else, return original state
  if (action.type === 'CHANGE_USER') return action.payload.user;

  return user;
};

// when app setting is to be updated
const changeAppSetting = (
  setting = {
    userHandle: 'ME',
    fontSize: 12,
    fontColor: 'black'
  },
  action
) => {
  // return new app setting if conition matched
  if (action.type === 'CHANGE_SETTING') return action.payload.setting;
  // return default setting
  return setting;
};

// Combine the reducers
export default combineReducers({
  loggedIn: changeLoginReducer,
  verified: changeVerifyReducer,
  user: changeUserData,
  setting: changeAppSetting,
  toggleMenu,
  widthChanged
});
