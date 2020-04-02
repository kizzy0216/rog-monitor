import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, Select, Row, Col, Modal, Button, Input, Form, Tooltip, message, Popconfirm } from 'antd';
import { EllipsisOutlined, CloseOutlined } from '@ant-design/icons';

import CameraTiles from '../components/cameras/CameraTiles';
import AddCameraGroupModal from '../components/modals/AddCameraGroupModal';
import CameraOptionButtons from '../components/cameras/CameraOptionButtons';

import * as cameraGroupActions from '../redux/cameraGroups/actions';
import { trackEventAnalytics } from '../redux/auth/actions';
import { removeUserCameraGroupPrivilege } from '../redux/cameraGroups/actions';
import { isEmpty } from '../redux/helperFunctions';

class CameraList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraGroupButtonsVisible: false,
      addCameraGroupModalVisible: false
    }
  }

  UNSAFE_componentWillMount() {
    if (this.props.cameraGroups.length == 0){
      this.props.actions.fetchCameraGroups(this.props.user);
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.cameraGroups.length > 0) {
      if (isEmpty(nextProps.selectedCameraGroup.name) && isEmpty(this.props.selectedCameraGroup.name)){
        this.selectCameraGroup(nextProps.user, nextProps.cameraGroups[0]);
      } else if (typeof nextProps.selectedCameraGroup.cameras === 'undefined' ||
      typeof nextProps.selectedCameraGroup.userCameraGroupPrivileges === 'undefined') {
        if (typeof this.props.selectedCameraGroup.cameras === 'undefined' || typeof this.props.selectedCameraGroup.userCameraGroupPrivileges === 'undefined') {
          this.selectCameraGroup(nextProps.user, nextProps.selectedCameraGroup);
        }
      }
    }

    if (nextProps.createCameraError && nextProps.createCameraError !== this.props.createCameraError) {
      message.error(nextProps.createCameraError);
    }

    if (nextProps.deleteCameraError && nextProps.deleteCameraError !== this.props.deleteCameraError) {
      message.error(nextProps.deleteCameraError);
    }

    if (nextProps.rescindInviteError && nextProps.rescindInviteError !== this.props.rescindInviteError) {
      message.error(nextProps.rescindInviteError);
    }

    if (nextProps.removeUserCameraGroupPrivilegeError && nextProps.removeUserCameraGroupPrivilegeError !== this.props.removeUserCameraGroupPrivilegeError) {
      message.error(nextProps.removeUserCameraGroupPrivilegeError);
    }
  }

  selectCameraGroup = (user, cameraGroup) => {
    sessionStorage.setItem('selectedCameraGroupUuid', cameraGroup.uuid);
    this.props.actions.selectCameraGroup(user, cameraGroup);
    this.setState({cameraGroupButtonsVisible: false});
  }

  toggleCameraGroupButtonsVisability = () => {
    this.setState({cameraGroupButtonsVisible: !this.state.cameraGroupButtonsVisible});
  }

  toggleAddCameraGroupModalVisibility = () => {
    this.setState({addCameraGroupModalVisible: !this.state.addCameraGroupModalVisible});
  }

  deleteCameraGroup = (userCameraGroupPrivilege) => {
    sessionStorage.removeItem('selectedCameraGroupUuid');
    this.props.removeUserCameraGroupPrivilege(this.props.user, userCameraGroupPrivilege.camera_groups_uuid, userCameraGroupPrivilege.uuid, userCameraGroupPrivilege);
  }

  render() {
    if (this.props.cameraGroups.length > 0 && !isEmpty(this.props.selectedCameraGroup.name)) {
      return (
        <div>
          <Row type='flex' justify='center' align='middle' style={styles.cameraOptions}>
            <Col xs={{span: 14}} sm={{span: 6}}>
              <Select style={styles.select} value={this.props.selectedCameraGroup.name}
                      onSelect={(value, option) => this.selectCameraGroup(this.props.user, option.props.cameragroup)}>
                {this.props.cameraGroups.map(cameraGroup => (
                  <Select.Option key={`cameragroup-${cameraGroup.id}`} cameragroup={cameraGroup}>{cameraGroup.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={{span: 2}} sm={{span: 1}} style={styles.toggleCameraGroupOptionsContainer}>
                {typeof this.props.selectedCameraGroup.userCameraGroupPrivileges !== 'undefined' ?          this.props.selectedCameraGroup.userCameraGroupPrivileges.map(userCameraGroupPrivilege => (
                  userCameraGroupPrivilege.users_uuid == this.props.user.uuid && userCameraGroupPrivilege.user_camera_group_privilege_ids.includes(0) ?
                  <Tooltip key={userCameraGroupPrivilege.id} title='Toggle Camera Group Options' placement='bottom'>
                    <EllipsisOutlined style={styles.toggleCameraGroupOptions}  onClick={this.toggleCameraGroupButtonsVisability} />
                  </Tooltip>
                  :
                  userCameraGroupPrivilege.users_uuid == this.props.user.uuid && !userCameraGroupPrivilege.user_camera_group_privilege_ids.includes(0) ?
                  <Tooltip key={userCameraGroupPrivilege.id} title='Remove Camera Group' placement='bottom'>
                    <Popconfirm title="Are you sure you want to stop viewing this camera group? This action cannot be undone." onConfirm={() => this.props.removeUserCameraGroupPrivilegeInProcess ? '' : this.deleteCameraGroup(userCameraGroupPrivilege)} okText="Yes, remove camera group" cancelText="Nevermind">
                      <Button type="primary" danger icon={<CloseOutlined />} className="removeCameraGroupButton" style={styles.removeCameraGroupButton} loading={this.props.removeUserCameraGroupPrivilegeInProcess} disabled={this.props.removeUserCameraGroupPrivilegeInProcess}></Button>
                    </Popconfirm>
                  </Tooltip>
                  :
                  ''
                )) : ''}
            </Col>
            {typeof this.props.selectedCameraGroup.userCameraGroupPrivileges !== 'undefined' ? this.props.selectedCameraGroup.userCameraGroupPrivileges.map(userCameraGroupPrivilege => (
              userCameraGroupPrivilege.users_uuid == this.props.user.uuid && 0 in userCameraGroupPrivilege.user_camera_group_privilege_ids ?
              (<CameraOptionButtons
                key={userCameraGroupPrivilege.id}
                user={this.props.user}
                selectedCameraGroup={this.props.selectedCameraGroup}
                visible={this.state.cameraGroupButtonsVisible}
                cameraGroup={this.props.selectedCameraGroup}/>) :
              (
                <span key={userCameraGroupPrivilege.id}></span>
              )
            )) : ''}
          </Row>
          {typeof this.props.selectedCameraGroup.userCameraGroupPrivileges !== 'undefined' ?
            <CameraTiles user={this.props.user} cameraGroup={this.props.selectedCameraGroup} />
          :
          <Row type='flex' justify='start' style={styles.cameraListContainer}>
            <p style={styles.noCamerasText}>
              Loading Camera Group Information
            </p>
          </Row>
          }
        </div>
      )
    } else if (this.props.cameraGroups.length > 0 && typeof this.props.selectedCameraGroup === 'undefined') {
      this.selectCameraGroup(this.props.user, this.props.cameraGroups[0]);
      return (
        <Row type='flex' justify='start' style={styles.cameraListContainer}>
          <p style={styles.noCamerasText}>
            Loading
          </p>
        </Row>
      )
    } else {
      return (
        <Row type='flex' justify='start' style={styles.cameraGroupContainer}>
          <Button style={styles.noCameraGroupsBtn}>
            <AddCameraGroupModal linkText='Create a camera group to onboard cameras.' />
          </Button>
        </Row>
      )
    }
  }
}

const styles = {
  cameraOptions: {
    marginBottom: 10
  },
  select: {
    width: '100%'
  },
  toggleCameraGroupOptionsContainer: {
    width: 28,
    marginRight: '-3%'
  },
  toggleCameraGroupOptions: {
    transform: 'rotate(90deg)',
    fontSize: 18,
    paddingBottom: 10
  },
  cameraGroupContainer: {
    height: 'calc(100vh - 65px)'
  },
  noCameraGroupsBtn: {
    margin: '0 auto',
    marginTop: 100,
    fontSize: 24,
    backgroundColor: 'transparent'
  },
  noCamerasText: {
    margin: '0 auto',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 24
  },
  cameraListContainer: {
    height: 'calc(100vh - 105px)'
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    newAlerts: state.auth.newAlerts,
    cameraGroups: state.cameraGroups.cameraGroups,
    selectedCameraGroup: state.cameraGroups.selectedCameraGroup,
    fetchError: state.cameraGroups.fetchError,
    fetchInProcess: state.cameraGroups.fetchInProcess,
    deleteCameraSuccess: state.cameras.deleteCameraSuccess,
    deleteCameraError: state.cameras.deleteCameraError,
    removeUserCameraGroupPrivilegeInProcess: state.cameraGroups.removeUserCameraGroupPrivilegeInProcess,
    removeUserCameraGroupPrivilegeError: state.cameraGroups.removeUserCameraGroupPrivilegeError
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(cameraGroupActions, dispatch),
    addCameraGroupCamera: (user, cameraGroup, name, rtspUrl, username, password) => dispatch(addCameraGroupCamera(user, cameraGroup, name, rtspUrl, username, password)),
    trackEventAnalytics: (event, data) => dispatch(trackEventAnalytics(event, data)),
    removeUserCameraGroupPrivilege: (user, cameraGroupUuid, cameraGroupPrivilegeUuid) => dispatch(removeUserCameraGroupPrivilege(user, cameraGroupUuid, cameraGroupPrivilegeUuid)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraList);
