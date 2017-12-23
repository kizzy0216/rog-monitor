import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import RtspStream from '../components/video/RtspStream';
import * as cameraActions from '../redux/cameras/actions';

class CameraStream extends Component {
  componentWillMount = () => {
    this.props.actions.fetchCameraAuthRtspUrl(this.props.user, this.props.match.params.id);
  }

  render() {
    if (this.props.fetchInProcess) {
      return (
        <span>Loading</span>
      )
    }
    else if (this.props.authRtspUrl) {
      return (
        <RtspStream rtspUrl={this.props.authRtspUrl} />
      )
    }
    else {
      return (
        <span>{this.props.fetchErrro}</span>
      )
    }
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    authRtspUrl: state.cameras.authRtspUrl,
    fetchError: state.cameras.fetchError,
    fetchInProcess: state.cameras.fetchInProcess,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(cameraActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CameraStream);