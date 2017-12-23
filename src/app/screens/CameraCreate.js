import React, { Component } from 'react';

import AddCamera from '../components/cameras/AddCamera';

class CameraCreate extends Component {
  render() {
    return (
      <AddCamera locationId={this.props.match.params.locationId} />
    )
  }
}

export default CameraCreate;