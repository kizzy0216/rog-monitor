import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Card, Icon, Row, Col, Popconfirm, Button, Switch } from 'antd';
import moment, { lang } from 'moment';

import Recorder from '../video/Recorder';
import EditCamera from '../cameras/EditCamera';
import { deleteCamera } from '../../redux/cameras/actions';
import { trackEventAnalytics } from '../../redux/auth/actions';
import TriggerModal from '../modals/TriggerModal';
import { registerCamera } from '../../redux/alerts/actions';
import RefreshPreviewImage from '../buttons/RefreshPreviewImage';
import CameraCardImg from './CameraCardImg';
import ToggleCameraConnection from '../buttons/ToggleCameraConnection';

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
    this.props.deleteCamera(this.props.user, this.props.camera_groups_id, this.props.id);
  };

  viewCameraStream = () => {
    const cameraViewEvent = {
      email: this.props.user.email,
      name: this.props.user.firstName+ ' ' +this.props.user.lastName,
      cameraGroup_viewed: this.props.cameraGroup.name,
      camera_viewed: this.props.name
    };

    this.props.trackEventAnalytics('camera viewed', cameraViewEvent);

    this.props.history.push(`/cameras/${this.props.id}/stream`);
  }

  componentWillMount = () => {
    this.props.registerCamera(this.props.user.id, this.props.cameraGroup.cameras);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id === nextProps.id){
      if (nextProps.id === nextProps.refreshCameraId){
        if (this.props.thumbnail_url !== nextProps.thumbnail_url && this.props.refreshCameraId === nextProps.refreshCameraId) {
          this.props.thumbnail_url = nextProps.thumbnail_url
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
            <div>
              {this.props.cameraGroup.myRole === 'viewer' ?
                (<div></div>) :
                <div>
                  <Col span={8} style={styles.alertModal}>
                    <TriggerModal
                      data={this.props}
                    />
                  </Col>
                  <Col span={8} style={styles.cameraConnectionSwitch}>
                    <ToggleCameraConnection
                      data={this.props}
                    />
                  </Col>
                </div>
              }
              <div>
                <Col span={8} style={styles.refreshImage}>
                  <RefreshPreviewImage
                    data={this.props}
                  />
                </Col>
              </div>
            </div>
          </Row>
          <Row onClick={() => this.viewCameraStream()}>
            <CameraCardImg data={this.props} />
          </Row>
          {this.props.cameraGroup.myRole === 'viewer' ?
            (<Row type='flex' justify="flex-end" style={styles.cameraCardButtons}>
              <Col span={20} offset={2}>
                <p style={{textAlign: 'center'}}>{/*{this.formatDatetime(this.props.updatedAt)}<br/>GMT*/}</p>
              </Col>
            </Row>) :
            (<Row type='flex' justify="flex-end" style={styles.cameraCardButtons}>
              <Col span={2}>
                <EditCamera data={this.props} />
              </Col>
              <Col span={20}>
                <p style={{textAlign: 'center'}}>{/*{this.formatDatetime(this.props.updatedAt)}<br/>GMT*/}</p>
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
  cameraCardButtons: {
    marginTop: 10
  },
  refreshImage: {
    float: 'right'
  },
  alertModal: {
    marginTop: 6.5
  },
  cameraConnectionSwitch: {
    textAlign: 'center',
    marginTop: 5
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
    deleteCamera: (user, cameraGroupId, cameraId) => dispatch(deleteCamera(user, cameraGroupId, cameraId)),
    trackEventAnalytics: (event, data) => dispatch(trackEventAnalytics(event, data)),
    registerCamera: (userId, cameraDetails) => dispatch(registerCamera(userId, cameraDetails)),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CameraCard));
