import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';

import { logout } from '../../redux/auth/actions';
// TODO: change this logout component to pass in the user object.
class LogoutItem extends Component {
  render() {
    return (
      <span onClick={() => this.props.logout(this.props.channels)}>
        <Icon type='logout' />
        &nbsp;&nbsp;
        <span>Logout</span>
      </span>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    channels: state.alerts.channels
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: (channels) => dispatch(logout(channels))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogoutItem);
