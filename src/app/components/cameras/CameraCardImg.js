import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import loading from '../../../assets/img/TempCameraImage.jpeg'
import cameraConnectError from '../../../assets/img/connectError.jpeg'

class CameraCardImg extends Component {

  constructor() {
    super();
    this.state = {
      image: loading
    };
  }

  UNSAFE_componentWillMount() {
    if (this.props.data.thumbnail_url) {
      this.setState({image: this.props.data.thumbnail_url});
    } else if (this.props.cameraConnectionFail && this.props.cameraConnectionFailId === this.props.data.id) {
      this.setState({image: cameraConnectError});
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data.imageUpdateInProgress && nextProps.data.id === nextProps.data.imageUpdateInProgressId) {
      this.setState({image: loading});
    } else if (typeof nextProps.data.refreshCameraImage !== 'undefined' && nextProps.data.refreshCameraId == nextProps.data.id) {
      this.setState({image: nextProps.data.refreshCameraImage});
    } else if (nextProps.cameraConnectionFail && nextProps.cameraConnectionFailId === nextProps.data.id) {
      this.setState({image: cameraConnectError});
    } else {
      for (var i = 0; i < nextProps.data.cameraGroup.cameras.length; i++) {
        if (nextProps.data.id == nextProps.data.cameraGroup.cameras[i].id && this.props.data.cameraGroup.cameras[i].thumbnail_url !== nextProps.data.cameraGroup.cameras[i].thumbnail_url) {
          this.setState({image: nextProps.data.cameraGroup.cameras[i].thumbnail_url});
        }
      }
    }
  }

  render() {
    return (
      <div style={styles.cameraCardImgContainer}>
        <img src={this.state.image} style={styles.cameraCardImg} />
      </div>
    );
  }
}

const styles = {
  cameraCardImgContainer: {
    backgroundColor: 'white',
    height: 170,
    position: 'relative',
    margin: '0 auto',
    paddingLeft: 0,
    paddingRight: 0
  },
  cameraCardImg: {
    position: 'absolute',
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto'
  }
}

const mapStateToProps = (state) => {
  return {
    cameraConnectionFail: state.cameraGroups.cameraConnectionFail,
    cameraConnectionFailId: state.cameraGroups.cameraConnectionFailId
  }
}

const mapDispatchToProps = (dispatch) => {
  return{}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CameraCardImg));
