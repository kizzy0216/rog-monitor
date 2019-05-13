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
      },
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
          <Badge>
            <Icon type='video-camera' className='nav-icon' />
          </Badge>
        </Menu.Item>
        <Menu.Item key='/alerts'>
          <Badge count={!isEmpty(this.props.alerts) ? this.props.alerts[0].new_alerts: 0}>
            <Icon type='bell' className='nav-icon' />
          </Badge>
        </Menu.Item>
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
