import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon, Switch } from 'antd';
import { toggleCameraConnection } from '../../redux/cameras/actions';
import { checkCameraConnection } from '../../redux/cameras/actions';

class ToggleCameraConnection extends Component {

  constructor() {
    super();
    this.state = {};
  }

  toggleCameraConnection = (status) => {
    this.props.toggleCameraConnection(this.props.id, status);
  }

  componentWillMount = () => {
    this.props.checkCameraConnection(this.props.id);
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
        onChange={() => this.toggleCameraConnection(!enabled)}
        checked={enabled}
      />
    );
  }
}

const styles = {

}

const mapStateToProps = (state) => {
  return {
    cameraConnectionEnabled: state.cameras.cameraConnectionEnabled,
    cameraConnectionId: state.cameras.cameraConnectionId,
  }
}

const mapDispatchToProps = (dispatch) => {
  return{
    toggleCameraConnection: (cameraId, cameraConnectionEnabled) => dispatch(toggleCameraConnection(cameraId, cameraConnectionEnabled)),
    checkCameraConnection: (cameraId) => dispatch(checkCameraConnection(cameraId))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ToggleCameraConnection));
