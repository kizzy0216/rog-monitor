import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon, Switch } from 'antd';
import { toggleCameraEnabled } from '../../redux/cameras/actions';
import { checkCameraEnabled } from '../../redux/cameras/actions';

class ToggleCameraConnection extends Component {

  toggleCameraEnabled = (enabled) => {
    this.props.toggleCameraEnabled(this.props.data.user, this.props.data.cameraGroup, this.props.data.id, enabled);
  }

  componentWillMount() {
    this.props.checkCameraEnabled(this.props.data.user, this.props.data.cameraGroup, this.props.data.id);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.data.id === nextProps.cameraConnectionId) {
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
        unCheckedChildren={<Icon type="cross" />}
        onChange={() => this.toggleCameraEnabled(!enabled)}
        checked={enabled}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    cameraConnectionEnabled: state.cameras.cameraConnectionEnabled,
    cameraConnectionId: state.cameras.cameraConnectionId,
  }
}

const mapDispatchToProps = (dispatch) => {
  return{
    toggleCameraEnabled: (user, cameraGroup, camera, cameraConnectionEnabled) => dispatch(toggleCameraEnabled(user, cameraGroup, camera, cameraConnectionEnabled)),
    checkCameraEnabled: (user, cameraGroup, camera) => dispatch(checkCameraEnabled(user, cameraGroup, camera))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ToggleCameraConnection));
