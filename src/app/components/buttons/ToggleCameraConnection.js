import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { toggleCameraEnabled, checkCameraEnabled } from '../../redux/cameras/actions';

class ToggleCameraConnection extends Component {
  constructor(props){
    super(props);
    props.checkCameraEnabled(props.data.user, props.data.cameraGroup, props.data.uuid);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.data.uuid === nextProps.cameraConnectionUuid) {
      return true;
    } else {
      return false;
    }
  }

  toggleCameraEnabled = (enabled) => {
    this.props.toggleCameraEnabled(this.props.data.user, this.props.data.cameraGroup, this.props.data.uuid, enabled);
  }

  render() {
    let enabled = this.props.cameraConnectionEnabled;
    return (
      <Switch
        checkedChildren={<CheckOutlined />}
        unCheckedChildren={<CloseOutlined />}
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
