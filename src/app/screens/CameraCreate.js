import React, { Component } from 'react';

import AddCamera from '../components/cameras/AddCamera';

class CameraCreate extends Component {
  render() {
    return (
      <AddCamera cameraGroupUuid={this.props.match.params.cameraGroupUuid} />
    )
  }
}

export default CameraCreate;
