import React, { Component } from 'react';

import LoginRouter from './components/navigation/LoginRouter';
import AppRouter from './components/navigation/AppRouter';

import { checkLogin, initialiseAnalyticsEngine } from './redux/auth/actions';
import { listenForNewAlerts } from './redux/alerts/actions';
import store from './redux/store';

class App extends Component {
  isChrome;
  constructor(props) {
    super(props);

    this.state = {
      currentUser: null,
      loading: true,
      socketSet: false
    }
  }

  componentWillMount() {
    store.subscribe(this.onStoreUpdate.bind(this));
    store.dispatch(checkLogin());
    store.dispatch(initialiseAnalyticsEngine());
    this.checkBrowser();
  }

  onStoreUpdate() {
    const { user } = store.getState().auth;
    if (this.state.currentUser !== user) {
      this.setState({currentUser: user});
      if (user && this.state.socketSet == false) {
        this.setState({socketSet: true});
        store.dispatch(listenForNewAlerts(user));
      }
    }
    this.setState({loading: false});
  }

  checkBrowser() {
    this.isChrome = !!window.chrome && !!window.chrome.webstore;
  }

  render() {
    if (!this.isChrome) {
      alert('Only Google Chrome browser (Not The App) is supported. Please note that features may not work properly when using this browser.')
    }
    if (this.state.loading) {
      return (<div>Loading</div>)
    }
    else if (this.state.currentUser) {
      return (<AppRouter />)
    }
    else {
      return (<LoginRouter />)
    }
  }
}

export default App;
