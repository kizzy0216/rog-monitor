import React, { Component } from 'react';

import LoginRouter from './components/navigation/LoginRouter';
import AppRouter from './components/navigation/AppRouter';

import { checkLogin, initialiseAnalyticsEngine } from './redux/auth/actions';
import { listenForNewAlerts } from './redux/alerts/actions';
import store from './redux/store';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      currentUser: null,
      loading: true
    }
  }

  componentWillMount() {
    store.subscribe(this.onStoreUpdate.bind(this));
    store.dispatch(checkLogin());
    store.dispatch(initialiseAnalyticsEngine());
  }

  onStoreUpdate() {
    const { user } = store.getState().auth;
    if (this.state.currentUser !== user) {
      this.setState({currentUser: user});
      if (user) {
        store.dispatch(listenForNewAlerts(user))
      }
    }
    this.setState({loading: false});
  }

  render() {
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
