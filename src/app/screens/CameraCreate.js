import React, { Component } from 'react';

import AddCamera from '../components/cameras/AddCamera';

class CameraCreate extends Component {
  render() {
    return (
      <AddCamera cameraGroupId={this.props.match.params.cameraGroupId} />
    )
  }
}

export default CameraCreate;