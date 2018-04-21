import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Card, Icon, Row, Col, Popconfirm, message, Button } from 'antd';
import moment, { lang } from 'moment';

import Recorder from '../video/Recorder';
import EditCamera from '../cameras/EditCamera';

import { deleteCamera } from '../../redux/cameras/actions';
import { trackEventAnalytics } from '../../redux/auth/actions';
import AddAlertModal from '../modals/AddAlertModal';
import { registerCamera } from '../../redux/alerts/actions';
import RefreshPreviewImage from '../buttons/RefreshPreviewImage';
import loading from '../../../assets/img/TempCameraImage.jpeg'
import cameraConnectError from '../../../assets/img/connectError.jpeg'

class CameraCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag: false
    }
  }

  formatDatetime = (timestamp) => {
    const dt = moment(timestamp);
    return `${dt.format('L')} ${dt.format('LT')}`;
  }

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
        if (this.props.image.original !== nextProps.refreshCameraImage && this.props.refreshCameraId === nextProps.refreshCameraId) {
          this.props.image.original = nextProps.refreshCameraImage
        }
      }
      if (nextProps.id === nextProps.imageUpdateInProgressId) {
        if (nextProps.imageUpdateInProgress && nextProps.imageUpdateInProgress !== this.props.imageUpdateInProgress) {
          message.warning('Retrieving preview image. This may take up to 90 seconds.');
        }
      }
    }
  }

  render() {
    if (this.props.liveView) {
      return (
        <Card>
          <Row type='flex' justify='center'>
            <Col style={styles.cameraCardTitle}>{this.props.name}</Col>
          </Row>
          <Row>
            <div style={styles.refreshImage}>
              <RefreshPreviewImage data={this.props}/>

              <span style={styles.alertModal}>
                {this.props.cameraLocation.myRole === 'viewer' ?
                  ('') :
                  <AddAlertModal data={this.props}/>
                }
              </span>
            </div>
          </Row>
          <Row>
            <div style={styles.cameraCardImgContainer} onClick={() => this.viewCameraStream()}>
              {this.props.image.original ?
                <img src={this.props.image.original} style={styles.cameraCardImg} /> :
                ((this.props.bvcCameraConnectionFail) && (this.props.id === this.props.bvcCameraConnectionFailId)) ?
                  <img src={cameraConnectError} style={styles.cameraCardImg} /> :
                  <img src={loading} style={styles.cameraCardImg} />
              }

            </div>
          </Row>
          {this.props.cameraLocation.myRole === 'viewer' ?
            (<Row type='flex' justify="flex-end" style={styles.cameraCardButtons}>
              <Col span={20} offset={2}>
                <p style={{textAlign: 'center'}}>{this.formatDatetime(this.props.timestamp)}</p>
              </Col>
            </Row>) :
            (<Row type='flex' justify="flex-end" style={styles.cameraCardButtons}>
              <Col span={2}>
                <EditCamera data={this.props} />
              </Col>
              <Col span={20}>
                <p style={{textAlign: 'center'}}>{this.formatDatetime(this.props.timestamp)}</p>
              </Col>
              <Col span={2}>
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
  cameraCardTitle: {
    wordBreak: 'break-word'
  },
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
    imageUpdateSuccessId: state.cameras.imageUpdateSuccessId,
    bvcCameraConnectionFail: state.locations.bvcCameraConnectionFail,
    bvcCameraConnectionFailId: state.locations.bvcCameraConnectionFailId
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
