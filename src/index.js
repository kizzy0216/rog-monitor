import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'antd/dist/antd.css';
import './assets/css/styles.css';

import store from './app/redux/store';
import App from './app/App.js';
import App401 from './app/App401.js';
import {registerServiceWorker, unregister} from './registerServiceWorker';

if ((window.location.protocol + '//' + window.location.host) == 'https://dev.monitor.gorog.co' || (window.location.protocol + '//' + window.location.host) == 'https://stage.monitor.gorog.co') {
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
  console.log("Version 2.0");
  // registerServiceWorker();
  unregister();
  const ReduxApp = () => (
    <Provider store={store}>
      <App />
    </Provider>
  )
  ReactDOM.render(<ReduxApp />, document.getElementById('root'));
}

function render401() {
  // registerServiceWorker();
  unregister();
  const ErrorApp = () => (
    <Provider store={store}>
      <App401 />
    </Provider>
  )
  ReactDOM.render(<ErrorApp />, document.getElementById('root'));
}
