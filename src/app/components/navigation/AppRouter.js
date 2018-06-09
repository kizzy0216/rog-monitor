import React, { Component } from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import { Layout, Row, Col } from 'antd';
const { Header, Sider, Content } = Layout;

import Hamburger from './Hamburger';
import NavigationMenu from './NavigationMenu';
import SideMenu from './SideMenu'

import Alerts from '../../screens/Alerts';
import CameraList from '../../screens/CameraList';
import CameraDetails from '../../screens/CameraDetails';
import CameraCreate from '../../screens/CameraCreate';
import CameraStream from '../../screens/CameraStream';

export default class AppRouter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: true
    }
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {
    return (
      <Router>
        <Layout>
          <Header style={styles.header}>
            <Hamburger
              style={{...styles.hamburger, ...styles.menu}}
              collapsed={this.state.collapsed}
              toggleCollapsed={this.toggleCollapsed.bind(this)} />
            <NavigationMenu style={styles.menu}/>
            {/* <Col xs={{span: 0}} sm={{span: 12}} style={{float: 'right'}}><h3 style={styles.chromeText}>ROG Monitor requires the Google Chrome web browser.</h3></Col> */}
          </Header>

          <Sider collapsed={this.state.collapsed} collapsedWidth={0} style={styles.sider}>
            <SideMenu />
          </Sider>

          <Content style={styles.content}>
            <Switch>
              <Route exact path='/cameras' component={CameraList} />
              <Route exact path='/cameras/:id' component={CameraDetails} />
              <Route exact path='/cameras/:id/stream' component={CameraStream} />
              <Route exact path='/cameras/new/:locationId' component={CameraCreate} />

              <Route exact path='/alerts' component={Alerts} />

              <Redirect to='/cameras' />
            </Switch>
          </Content>
        </Layout>
      </Router>
    )
  }
}

const styles = {
  header: {
    padding: 0,
    height: '50px',
    position: 'fixed',
    width: '100%',
    zIndex: 1 // Required for Content to scroll under Header
  },
  chromeText: {
    color: 'white',
    float: 'right',
    marginTop: -55,
    marginRight: 20
  },
  hamburger: {
    float: 'left',
  },
  menu: {
    lineHeight: '50px'
  },
  sider: {
    marginTop: 50
  },
  content: {
    marginTop: 60,
    zIndex: 0 // Required for Content to scroll under Header
  }
}
