import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'antd/dist/antd.css';
import './assets/css/styles.css';

import store from './app/redux/store';
import App from './app/App.js';
import App401 from './app/App401.js';
// import registerServiceWorker from './registerServiceWorker';
import {unregister} from './registerServiceWorker';
import { initializeFirebase, askForPermissionToReceiveNotifications } from './push-notification';

if ((window.location.protocol + '//' + window.location.host) == 'https://rog-monitor-dev.herokuapp.com') {
  var credentials = window.prompt("Enter Realm Password");
  if (!credentials|| credentials !== 'GoRogTeam!') {
    render401();
  } else {
      renderApp();
  }
} else {
  renderApp();
}

function renderApp() {
  const ReduxApp = () => (
    <Provider store={store}>
      <App />
    </Provider>
  )
  ReactDOM.render(<ReduxApp />, document.getElementById('root'));
  // registerServiceWorker();
  unregister();
  initializeFirebase();
  askForPermissionToReceiveNotifications();
}

function render401() {
  const ErrorApp = () => (
    <Provider store={store}>
      <App401 />
    </Provider>
  )
  ReactDOM.render(<ErrorApp />, document.getElementById('root'));
  // registerServiceWorker();
  unregister();
}
