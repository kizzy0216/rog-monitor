import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import loading from '../../../assets/img/TempCameraImage.jpeg'
import cameraConnectError from '../../../assets/img/connectError.gif'
import VideoPlayer from 'react-video-js-player';

class CameraCardImg extends Component {

  constructor() {
    super();
    this.state = {
      image: loading,
      live_view_url: null
    };
    this.live_view_key = 0;
  }

  UNSAFE_componentWillMount() {
    if (this.props.data.thumbnail_url) {
      this.setState({image: this.props.data.thumbnail_url+'?auth='+ this.props.data.user.jwt});
      if (this.props.data.live_view_url) {
        this.setState({live_view_url: this.props.data.live_view_url+'?auth='+ this.props.data.user.jwt});
      }
    } else if (this.props.cameraConnectionFail && this.props.cameraConnectionFailUuid === this.props.data.uuid) {
      this.setState({image: cameraConnectError});
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data.imageUpdateInProgress && nextProps.data.uuid === nextProps.data.imageUpdateInProgressUuid) {
      this.setState({image: loading});
      this.setState({live_view_url: null});
      this.live_view_key++;
    } else if (typeof nextProps.data.refreshCameraImage !== 'undefined' && nextProps.data.refreshCameraUuid == nextProps.data.uuid) {
      this.setState({image: nextProps.data.refreshCameraImage+'?auth='+ this.props.data.user.jwt});
      if (nextProps.data.live_view_url && this.props.live_view_url !== nextProps.live_view_url) {
        this.setState({live_view_url: nextProps.data.live_view_url+'?auth='+ this.props.data.user.jwt});
        this.live_view_key++;
      }
    } else if (nextProps.cameraConnectionFail && nextProps.cameraConnectionFailUuid === nextProps.data.uuid) {
      this.setState({image: cameraConnectError});
      this.setState({live_view_url: null});
      this.live_view_key++;
    } else {
      for (var i = 0; i < nextProps.data.cameraGroup.cameras.length; i++) {
        if (nextProps.data.uuid == nextProps.data.cameraGroup.cameras[i].uuid && this.props.data.cameraGroup.cameras[i].thumbnail_url !== nextProps.data.cameraGroup.cameras[i].thumbnail_url) {
          this.setState({image: nextProps.data.cameraGroup.cameras[i].thumbnail_url+'?auth='+ this.props.data.user.jwt});
          if (nextProps.data.cameraGroup.cameras[i].live_view_url) {
            this.setState({live_view_url: nextProps.data.cameraGroup.cameras[i].live_view_url+'?auth='+ this.props.data.user.jwt});
            this.live_view_key++;
          }
        }
      }
    }
  }

  render() {
    if (this.state.live_view_url && this.props.data.enabled && !this.props.data.imageUpdateInProgress) {
      return (
        <div style={styles.cameraCardImgContainer} key={this.live_view_key}>
          <VideoPlayer
            controls={true}
            hideControls={['volume', 'seekbar', 'timer', 'playbackrates']}
            preload='auto'
            bigPlayButton={true}
            autoPlay={true}
            height='170'
            poster={this.state.image}
            src={this.state.live_view_url}
            className="cameraCardImg">
          </VideoPlayer>
        </div>
      );
    } else {
      return (
        <div style={styles.cameraCardImgContainer} key={this.live_view_key}>
          <img src={this.state.image} style={styles.cameraCardImg} />
        </div>
      );
    }
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
    cameraConnectionFailUuid: state.cameraGroups.cameraConnectionFailUuid
  }
}

const mapDispatchToProps = (dispatch) => {
  return{}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CameraCardImg));
