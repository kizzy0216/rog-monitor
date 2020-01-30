import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon, Switch } from 'antd';
import { toggleCameraEnabled, checkCameraEnabled } from '../../redux/cameras/actions';

class ToggleCameraConnection extends Component {

  toggleCameraEnabled = (enabled) => {
    this.props.toggleCameraEnabled(this.props.data.user, this.props.data.cameraGroup, this.props.data.uuid, enabled);
    // if enabled is set to true, set an interval function that will poll the controller to check for a live view and stop it when we get a live view back. After x tries, clear the interval
  }

  UNSAFE_componentWillMount() {
    this.props.checkCameraEnabled(this.props.data.user, this.props.data.cameraGroup, this.props.data.uuid);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.data.uuid === nextProps.cameraConnectionUuid) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    let enabled = this.props.cameraConnectionEnabled;
    return (
      <Switch
        checkedChildren={<Icon type="check" />}
        unCheckedChildren={<Icon type="close" />}
        onChange={() => this.toggleCameraEnabled(!enabled)}
        checked={enabled}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    cameraConnectionEnabled: state.cameras.cameraConnectionEnabled,
    cameraConnectionUuid: state.cameras.cameraConnectionUuid,
  }
}

const mapDispatchToProps = (dispatch) => {
  return{
    toggleCameraEnabled: (user, cameraGroup, camera, cameraConnectionEnabled) => dispatch(toggleCameraEnabled(user, cameraGroup, camera, cameraConnectionEnabled)),
    checkCameraEnabled: (user, cameraGroup, cameraUuid) => dispatch(checkCameraEnabled(user, cameraGroup, cameraUuid))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ToggleCameraConnection));
