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
    this.props.deleteCamera(this.props.user, this.props.camera_groups_uuid, this.props.uuid);
  };

  viewCameraStream = () => {
    const cameraViewEvent = {
      email: this.props.user.email,
      name: this.props.user.firstName+ ' ' +this.props.user.lastName,
      cameraGroup_viewed: this.props.cameraGroup.name,
      camera_viewed: this.props.name
    };

    this.props.trackEventAnalytics('camera viewed', cameraViewEvent);

    this.props.history.push(`/camera-groups/${this.props.camera_groups_uuid}/cameras/${this.props.uuid}/stream`);
  }

  render() {
    if (this.props.liveView) {
      let myRole = [];
      for (var i = 0; i < this.props.cameraGroup.userCameraGroupPrivileges.length; i++) {
        if (this.props.cameraGroup.userCameraGroupPrivileges[i].users_uuid == this.props.user.uuid) {
          myRole = this.props.cameraGroup.userCameraGroupPrivileges[i].user_camera_group_privilege_ids
        }
      }
      return (
        <Card>
          <Row type='flex' justify='center'>
            <Col style={styles.cameraCardTitle}>{this.props.name}</Col>
          </Row>
          <Row>
            <div>
              <Col span={8} style={styles.alertModal}>
                <TriggerModal
                  data={this.props}
                />
              </Col>
              {!myRole.includes(0) ?
                (<div></div>) :
                <div>
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
          <Row> {/*onClick={() => this.viewCameraStream()}*/}
            <CameraCardImg data={this.props} />
          </Row>
          {!myRole.includes(0) ?
            (<Row type='flex' style={styles.cameraCardButtons}>
              <Col span={20} offset={2}>
                <p style={{textAlign: 'center'}}>{/*{this.formatDatetime(this.props.updatedAt)}<br/>GMT*/}</p>
              </Col>
            </Row>) :
            (<Row type='flex' style={styles.cameraCardButtons}>
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
            <Recorder cameraUuid={this.props.uuid} rtspUrl={this.props.rtspUrl} />
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
    polygonData: state.triggers.polygonData,
    refreshCameraImage: state.cameras.refreshCameraImage,
    refreshCameraUuid: state.cameras.refreshCameraUuid,
    imageUpdateInProgress: state.cameras.imageUpdateInProgress,
    imageUpdateInProgressUuid: state.cameras.imageUpdateInProgressUuid,
    refreshCameraError: state.cameras.refreshCameraError,
    refreshCameraErrorUuid: state.cameras.refreshCameraErrorUuid,
    imageUpdateSuccess: state.cameras.imageUpdateSuccess,
    imageUpdateSuccessUuid: state.cameras.imageUpdateSuccessUuid
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    deleteCamera: (user, cameraGroupUuid, cameraUuid) => dispatch(deleteCamera(user, cameraGroupUuid, cameraUuid)),
    trackEventAnalytics: (event, data) => dispatch(trackEventAnalytics(event, data))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CameraCard));
