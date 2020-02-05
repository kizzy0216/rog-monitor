import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Menu, Icon, Badge, notification } from 'antd';

import { fetchAlerts, clearNewAlerts, markUserAlertsViewed } from '../../redux/alerts/actions';
import { isEmpty } from '../../redux/helperFunctions';

class NavigationMenu extends Component {
  UNSAFE_componentWillMount = () => {
    this.props.fetchAlerts(this.props.user);
  }
  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (nextProps.newAlerts.length) {
      const alert = nextProps.newAlerts[0];

      notification.open({
        message: 'Alert:',
        description: `${alert.type} by ${alert.camera.name} at ${alert.camera.cameraGroup.name}`,
        duration: 5,
        style: {
          marginTop: 30
        }
      });
      nextProps.clearNewAlerts();
    }
  }

  goToPath = (path) => {
    if (path === '/alerts') {
      this.props.markUserAlertsViewed(this.props.user);
    }

    if (path == this.props.location.pathname) {
      window.window.scrollTo(0, 0);
    } else {
      this.props.history.push(path);
    }
  }

  render() {
    return (
      <Menu
        theme='dark'
        mode='horizontal'
        style={this.props.style}
        selectedKeys={[this.props.location.pathname]}
        defaultSelectedKeys={[this.props.location.pathname]}
        onClick={({key}) => this.goToPath(key)}>
        <Menu.Item key='/cameras'>
          <Icon type='video-camera' className='nav-icon' />
        </Menu.Item>
        <Menu.Item key='/alerts'>
          <Badge count={!isEmpty(this.props.alerts) ? this.props.alerts[0].new_alerts: 0}>
            <Icon type='alert' className='nav-icon' />
          </Badge>
        </Menu.Item>
        {this.props.user.user_privileges_id == 0 ?
          <Menu.SubMenu title={<Icon type="ellipsis" className='nav-icon' />}>
            <Menu.Item key='/system-configuration-admin'>
              <Icon type="database" className='nav-icon' /> System Configuration
            </Menu.Item>
            <Menu.Item key='/invitations-admin'>
              <Icon type="mail" className='nav-icon' /> Invitations
            </Menu.Item>
            <Menu.Item key='/users-admin'>
              <Icon type="user" className='nav-icon' /> Users
            </Menu.Item>
            <Menu.Item key='/licenses-admin'>
              <Icon type="idcard" className='nav-icon' /> Licenses
            </Menu.Item>
            <Menu.Item key='/camera-groups-admin'>
              <Icon type="team" className='nav-icon' /> Camera Groups
            </Menu.Item>
            <Menu.Item key='/cameras-admin'>
              <Icon type="video-camera" className='nav-icon' /> Cameras
            </Menu.Item>
            <Menu.Item key='/triggers-admin'>
              <Icon type="radius-setting" className='nav-icon' /> Triggers
            </Menu.Item>
            <Menu.Item key='/recos-admin'>
              <Icon type="cloud-server" className='nav-icon' /> Recos
            </Menu.Item>
            <Menu.Item key='/devices-admin'>
              <Icon type="mobile" className='nav-icon' /> Devices
            </Menu.Item>
            <Menu.Item key='/alerts-admin'>
              <Icon type="alert" className='nav-icon' /> Alerts
            </Menu.Item>
          </Menu.SubMenu>
          :
          null
        }
      </Menu>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    newAlerts: state.alerts.newAlerts,
    alerts: state.alerts.alerts,
    user: state.auth.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearNewAlerts: () => dispatch(clearNewAlerts()),
    fetchAlerts: (user) => dispatch(fetchAlerts(user)),
    markUserAlertsViewed: (user) => dispatch(markUserAlertsViewed(user))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavigationMenu));
