import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'antd/dist/antd.css';
import './assets/css/styles.css';

import store from './app/redux/store';
import App from './app/App.js';
import App401 from './app/App401.js';
import {registerServiceWorker, unregister} from './registerServiceWorker';
import firebase from 'firebase/app';
import { ReactReduxFirebaseProvider } from 'react-redux-firebase';

const config = {
  projectId: "rog-2-0",
  apiKey: "AIzaSyCY1oTVrozQfDrCG1k-b3Q4Iw5iWSF_LIM",
  appId: "1:153344187169:web:64dd90de0f9831cc643c60",
  messagingSenderId: "153344187169"
};

const rrfConfig = {
  userProfile: 'users'
};

const rrfProps = {
  firebase: firebase,
  config: rrfConfig,
  dispatch: store.dispatch
}

firebase.initializeApp(config);

const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

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
  if (!isChrome) {
    alert("ROG supports Google Chrome. Other web browsers are not currently supported.");
  }
  console.log("Version 2.1");
  registerServiceWorker();
  // unregister();
  const ReduxApp = () => (
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <App/>
      </ReactReduxFirebaseProvider>
    </Provider>
  )
  ReactDOM.render(<ReduxApp />, document.getElementById('root'));
}

function render401() {
  registerServiceWorker();
  // unregister();
  const ErrorApp = () => (
    <Provider store={store}>
      <App401 />
    </Provider>
  )
  ReactDOM.render(<ErrorApp />, document.getElementById('root'));
}
