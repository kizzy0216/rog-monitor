import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import { Layout, Row, Col, Icon, Button } from 'antd';
const { Header, Sider, Content } = Layout;

import Hamburger from './Hamburger';
import NavigationMenu from './NavigationMenu';
import SideMenu from './SideMenu'

import Alerts from '../../screens/Alerts';
import CameraList from '../../screens/CameraList';
import CameraDetails from '../../screens/CameraDetails';
import CameraCreate from '../../screens/CameraCreate';
import CameraStream from '../../screens/CameraStream';
import RecosAdmin from '../../screens/RecosAdmin';
import UsersAdmin from '../../screens/UsersAdmin';
import CameraGroupSettingsAdmin from '../../screens/CameraGroupSettingsAdmin';
import CameraGroupPrivilegesAdmin from '../../screens/CameraGroupPrivilegesAdmin';
import CamerasAdmin from '../../screens/CamerasAdmin';
import TriggersAdmin from '../../screens/TriggersAdmin';
import AlertsAdmin from '../../screens/AlertsAdmin';
import InvitationsAdmin from '../../screens/InvitationsAdmin';
import UserPrivilegesAdmin from '../../screens/UserPrivilegesAdmin';
import DevicesAdmin from '../../screens/DevicesAdmin';
import LicensesAdmin from '../../screens/LicensesAdmin';
import SystemConfigurationAdmin from '../../screens/SystemConfigurationAdmin';

import { muteSound } from '../../redux/users/actions';

class AppRouter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: true,
      mute: props.mute
    }
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  toggleMute = () => {
    this.setState({mute: !this.state.mute});
    this.props.muteSound(this.props.user, !this.state.mute);
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
            <NavigationMenu style={styles.menu} />
            <div style={styles.headerButton}>
              <Button type="ghost" shape="circle" icon="sound" size={"large"} style={styles.muteButton} onClick={this.toggleMute}>
                {this.state.mute == true ? <Icon type="close" style={styles.muteIcon} /> : ''}
              </Button>
            </div>
          </Header>

          <Sider collapsed={this.state.collapsed} collapsedWidth={0} style={styles.sider}>
            <SideMenu />
          </Sider>

          <Content style={styles.content}>
              {this.props.user.user_privileges_ids == 0 ?
                <Switch>
                  <Route path='/cameras' component={CameraList} />
                  <Route path='/cameras/:id' component={CameraDetails} />
                  <Route path='/camera-groups/:cameraGroupId/cameras/:id/stream' component={CameraStream} />
                  <Route path='/cameras/new/:cameraGroupId' component={CameraCreate} />
                  <Route path='/alerts' component={Alerts} />
                  <Route path='/recos-admin' component={RecosAdmin} />
                  <Route path='/users-admin' component={UsersAdmin} />
                  <Route path='/camera-group-settings-admin' component={CameraGroupSettingsAdmin} />
                  <Route path='/camera-group-privileges-admin' component={CameraGroupPrivilegesAdmin} />
                  <Route path='/cameras-admin' component={CamerasAdmin} />
                  <Route path='/triggers-admin' component={TriggersAdmin} />
                  <Route path='/alerts-admin' component={AlertsAdmin} />
                  <Route path='/invitations-admin' component={InvitationsAdmin} />
                  <Route path='/user-privileges-admin' component={UserPrivilegesAdmin} />
                  <Route path='/Devices-admin' component={DevicesAdmin} />
                  <Route path='/licenses-admin' component={LicensesAdmin} />
                  <Route path='/system-configuration-admin' component={SystemConfigurationAdmin} />
                  <Redirect to='/cameras' />
                </Switch>
                :
                <Switch>
                  <Route path='/cameras' component={CameraList} />
                  <Route path='/cameras/:id' component={CameraDetails} />
                  <Route path='/camera-groups/:cameraGroupId/cameras/:id/stream' component={CameraStream} />
                  <Route path='/cameras/new/:cameraGroupId' component={CameraCreate} />
                  <Route path='/alerts' component={Alerts} />
                  <Redirect to='/cameras' />
                </Switch>
              }
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
  headerButton: {
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
  },
  muteButton: {
    color: 'white'
  },
  muteIcon: {
    position: 'absolute',
    right: 5,
    top: 5,
    fontSize: 30
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    mute: state.auth.user.mute
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    muteSound: (user, mute) => dispatch(muteSound(user, mute)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppRouter);
