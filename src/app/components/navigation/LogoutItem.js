import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';

import { logout } from '../../redux/auth/actions';

class LogoutItem extends Component {
  render() {
    return (
      <span onClick={() => this.props.logout(this.props.user)}>
        <Icon type='logout' />
        &nbsp;&nbsp;
        <span>Logout</span>
      </span>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: (user) => dispatch(logout(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogoutItem);
