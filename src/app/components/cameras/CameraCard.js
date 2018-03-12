import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Card, Icon, Row, Col, Popconfirm, message, Button } from 'antd';

import Recorder from '../video/Recorder';
import EditCamera from '../cameras/EditCamera';

import { deleteCamera } from '../../redux/cameras/actions';
import { trackEventAnalytics } from '../../redux/auth/actions';
import AddAlertModal from '../modals/AddAlertModal';
import { registerCamera } from '../../redux/alerts/actions';
import RefreshPreviewImage from '../buttons/RefreshPreviewImage';

class CameraCard extends Component {
  deleteCamera = () => {
    this.props.deleteCamera(this.props.user, this.props.id);
  };

  viewCameraStream = () => {
    const cameraViewEvent = {
      email: this.props.user.email,
      name: this.props.user.firstName+ ' ' +this.props.user.lastName,
      location_viewed: this.props.cameraLocation.name,
      camera_viewed: this.props.name
    };

    this.props.trackEventAnalytics('camera viewed', cameraViewEvent);

    this.props.history.push(`/cameras/${this.props.id}/stream`);
  }

  componentWillMount = () => {
    this.props.registerCamera(this.props.user.id, this.props.cameraLocation.cameras);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id === nextProps.id){
      if (nextProps.id === nextProps.refreshCameraId){
        if (this.props.image.original !== nextProps.refreshCameraImage) {
          this.props.image.original = nextProps.refreshCameraImage
        }
      }
      if (this.props.id === nextProps.refreshCameraErrorId) {
        if (nextProps.refreshCameraError && nextProps.refreshCameraError !== this.props.refreshCameraError) {
          message.error(nextProps.refreshCameraError);
        }
      }
      if (this.props.id === nextProps.imageUpdateInProgressId) {
        if (nextProps.imageUpdateInProgress && nextProps.imageUpdateInProgress !== this.props.imageUpdateInProgress) {
          message.warning('Retrieving preview image. This may take up to 90 seconds.');
        }
      }
      if (this.props.id === nextProps.imageUpdateSuccessId) {
        if (nextProps.imageUpdateSuccess && nextProps.imageUpdateSuccess !== this.props.imageUpdateSuccess) {
          message.success('Preview image retrieved!');
        }
      }
    }
  }

  render() {
    if (this.props.liveView) {
      return (
        <Card>
          <Row type='flex' justify='center'>
            <Col>{this.props.name}</Col>
          </Row>
          <div style={styles.refreshImage}>
            {/* <RefreshPreviewImage data={this.props}/> */}

            <span style={styles.alertModal}>
            <AddAlertModal data={this.props}/>
            </span>
          </div>
          <div>

          </div>
          <div style={styles.cameraCardImgContainer} onClick={() => this.viewCameraStream()}>
            {this.props.image.original ?
              <img src={this.props.image.original} style={styles.cameraCardImg} /> :
              <img src={loading} style={styles.cameraCardImg} />
            }

          </div>
          {this.props.cameraLocation.myRole === 'viewer' ?
            (<span></span>) :

            (<Row type='flex' justify="flex-end" style={styles.cameraCardButtons}>
              <Col span={2}>
                <EditCamera data={this.props} />
              </Col>
              <Col span={2} offset={20}>
                <Popconfirm title='Are you sure delete this camera?' onConfirm={this.deleteCamera} okText='Yes' cancelText='No'>
                  <Icon type='delete' />
                </Popconfirm>
              </Col>
            </Row>)
          }
        </Card>
      )
    }
    else {
      return (
        <Card>
          <div>
            <Recorder cameraId={this.props.id} rtspUrl={this.props.rtspUrl} />
          </div>
          <p>{this.props.name}</p>
        </Card>
      )
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
  },
  cameraCardButtons: {
    marginTop: 10
  },
  refreshImage: {
    textAlign: 'right',
    padding: '0 15px'
  },
  alertModal: {
    float: 'left'
  },
  getThumbnailBtn: {
    backgroundColor: 'white'
  }
}
const mapStateToProps = (state) => {
  return {
    polygonData: state.alerts.polygonData,
    refreshCameraImage: state.cameras.refreshCameraImage,
    refreshCameraId: state.cameras.refreshCameraId,
    imageUpdateInProgress: state.cameras.imageUpdateInProgress,
    imageUpdateInProgressId: state.cameras.imageUpdateInProgressId,
    refreshCameraError: state.cameras.refreshCameraError,
    refreshCameraErrorId: state.cameras.refreshCameraErrorId,
    imageUpdateSuccess: state.cameras.imageUpdateSuccess,
    imageUpdateSuccessId: state.cameras.imageUpdateSuccessId
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    deleteCamera: (user, cameraId) => dispatch(deleteCamera(user, cameraId)),
    trackEventAnalytics: (event, data) => dispatch(trackEventAnalytics(event, data)),
    registerCamera: (userId, cameraDetails) => dispatch(registerCamera(userId, cameraDetails)),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CameraCard));
