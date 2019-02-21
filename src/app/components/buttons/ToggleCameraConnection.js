import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon, Switch } from 'antd';
import { toggleCameraEnabled } from '../../redux/cameras/actions';
import { checkCameraEnabled } from '../../redux/cameras/actions';

class ToggleCameraConnection extends Component {

  toggleCameraEnabled = (enabled) => {
    this.props.toggleCameraEnabled(this.props.id, enabled);
  }

  componentWillMount = () => {
    this.props.checkCameraEnabled(this.props.id);
  }

  shouldComponentUpdate = (nextProps) => {
    if (nextProps.id === nextProps.cameraConnectionId) {
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
    toggleCameraEnabled: (cameraId, cameraConnectionEnabled) => dispatch(toggleCameraEnabled(cameraId, cameraConnectionEnabled)),
    checkCameraEnabled: (cameraId) => dispatch(checkCameraEnabled(cameraId))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ToggleCameraConnection));
