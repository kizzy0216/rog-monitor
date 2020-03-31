import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Card, Row, Col, Popconfirm, Button, Switch } from 'antd';
import {DeleteOutlined} from '@ant-design/icons';
import moment, { lang } from 'moment';
import EditCamera from '../cameras/EditCamera';
import { deleteCamera, checkCameraConnection } from '../../redux/cameras/actions';
import { trackEventAnalytics } from '../../redux/auth/actions';
import TriggerModal from '../modals/TriggerModal';
import RefreshPreviewImage from '../buttons/RefreshPreviewImage';
import CameraCardImg from './CameraCardImg';
import CameraCardVideo from './CameraCardVideo';
import ToggleCameraConnection from '../buttons/ToggleCameraConnection';
import {isEmpty} from '../../redux/helperFunctions';

class CameraCard extends Component {
  constructor(props) {
    super(props);

    props.checkCameraConnection(props.user, props.uuid);

    this.state = {
      flag: false,
      live_view_url: props.live_view_url
    }
  }

  formatDatetime = (timestamp) => {
    const dt = moment(timestamp);
    return `${dt.format('L')} ${dt.format('LT')}`;
  }

  deleteCamera = () => {
    this.props.deleteCamera(this.props.user, this.props.camera_groups_uuid, this.props.uuid);
  };

static getDerivedStateFromProps(nextProps, prevState) {
  for (var i = 0; i < nextProps.cameraGroup.cameras.length; i++) {
    if (nextProps.cameraGroup.cameras[i].uuid == nextProps.uuid) {
      return {live_view_url: nextProps.cameraGroup.cameras[i].live_view_url}
    }
  }
}

  render() {
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
          <Col span={8} style={styles.alertModal}>
            <TriggerModal
              data={this.props}
            />
          </Col>
          {!myRole.includes(0) ?
            (<Col span={8} style={styles.cameraConnectionSwitch}></Col>) :
            <Col span={8} style={styles.cameraConnectionSwitch}>
              <ToggleCameraConnection
                data={this.props}
              />
            </Col>
          }
          <Col span={8} style={styles.refreshImage}>
            <RefreshPreviewImage
              data={this.props}
            />
          </Col>
        </Row>
        <Row>
          {
            isEmpty(this.state.live_view_url) ||
            (!this.props.cameraConnectionEnabled && this.props.uuid == this.props.cameraConnectionUuid) ||
            (this.props.imageUpdateInProgress && this.props.imageUpdateInProgressUuid == this.props.uuid)
            ?
            <CameraCardImg data={this.props} />
            :
            <CameraCardVideo data={this.props} />
          }

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
                <DeleteOutlined />
              </Popconfirm>
            </Col>
          </Row>)
        }
      </Card>
    )
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
    imageUpdateSuccessUuid: state.cameras.imageUpdateSuccessUuid,
    cameraConnectionEnabled: state.cameras.cameraConnectionEnabled,
    cameraConnectionUuid: state.cameras.cameraConnectionUuid,
    cameraConnectionVerified: state.cameras.cameraConnectionVerified,
    cameraConnectionVerifiedUuid: state.cameras.cameraConnectionVerifiedUuid
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    deleteCamera: (user, cameraGroupUuid, cameraUuid) => dispatch(deleteCamera(user, cameraGroupUuid, cameraUuid)),
    checkCameraConnection: (user, cameraUuid) => dispatch(checkCameraConnection(user, cameraUuid)),
    trackEventAnalytics: (event, data) => dispatch(trackEventAnalytics(event, data))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CameraCard));
