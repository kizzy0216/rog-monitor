import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Menu, Icon, Badge, notification } from 'antd';

import { mergeNewAlerts }from '../../redux/alerts/actions';

class NavigationMenu extends Component {
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
    }
  }

  goToPath = (path) => {
    if (path === '/alerts') {
      this.props.mergeNewAlerts();
    }

    if (path == this.props.location.pathname) {
      window.window.scrollTo(0, 0);
    }
    else {
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
          <Badge count={this.props.newAlerts.length}>
            <Icon type='bell' className='nav-icon' />
          </Badge>
        </Menu.Item>
      </Menu>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    newAlerts: state.alerts.newAlerts
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    mergeNewAlerts: () => dispatch(mergeNewAlerts())
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavigationMenu));
