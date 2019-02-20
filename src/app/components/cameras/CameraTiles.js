import React, { Component } from 'react';
import {Row, Col} from 'antd';

import CameraCard from './CameraCard';

class CameraTiles extends Component {

  render() {
    if (this.props.cameraGroup.cameras.length) {
      return (
        <Row type='flex' justify='start' style={styles.cameraListContainer}>
          {this.props.cameraGroup.cameras.map(camera => (
            <Col key={`camera-${camera.id}`} xs={24} sm={12} md={8} lg={6}>
              <CameraCard
                {...camera}
                style={styles.cameraCard}
                user={this.props.user}
                cameraCameraGroup={this.props.cameraGroup}
                liveView={this.props.liveView} />
            </Col>
          ))}
        </Row>
      );
    } else {
      return (
        <Row type='flex' justify='start' style={styles.cameraListContainer}>
          <p style={styles.noCamerasText}>
            This cameraGroup has no cameras.
            <br />
            Add a camera under this cameraGroup to get started.
          </p>
        </Row>
      );
    }
  }
}

const styles = {
  noCamerasText: {
    margin: '0 auto',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 24
  },
  cameraListContainer: {
    height: 'calc(100vh - 105px)'
  },
  cameraCard: {
    minWidth: 320
  }
}

export default CameraTiles;
