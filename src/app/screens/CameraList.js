import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, Select, Row, Col, Icon, Modal, Button, Input, Form, Tooltip, message, Popconfirm } from 'antd';
const Option = Select.Option;

import CameraTiles from '../components/cameras/CameraTiles';
import AddCameraGroupModal from '../components/modals/AddCameraGroupModal';
import CameraOptionButtons from '../components/cameras/CameraOptionButtons';

import * as cameraGroupActions from '../redux/cameraGroups/actions';
import { trackEventAnalytics } from '../redux/auth/actions';
import { removeUserCameraGroupPrivilege } from '../redux/cameraGroups/actions';

class CameraList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      liveView: true,
      cameraGroupButtonsVisible: false,
      addCameraGroupModalVisible: false
    }
  }

  componentWillMount() {
    if (this.props.cameraGroups.length == 0){
      this.props.actions.fetchCameraGroups(this.props.user);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.cameraGroups.length > 0) {
      if (!nextProps.selectedCameraGroup.name || typeof nextProps.selectedCameraGroup === 'undefined'){
        this.selectCameraGroup(nextProps.user, nextProps.cameraGroups[0]);
      } else if (typeof nextProps.selectedCameraGroup.cameras === 'undefined' ||
      typeof nextProps.selectedCameraGroup.userCameraGroupPrivileges === 'undefined') {
        this.selectCameraGroup(nextProps.user, nextProps.selectedCameraGroup);
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
    this.props.actions.selectCameraGroup(user, cameraGroup);
  }

  toggleCameraGroupButtonsVisability = () => {
    this.setState({cameraGroupButtonsVisible: !this.state.cameraGroupButtonsVisible})
  }

  toggleAddCameraGroupModalVisibility = () => {
    this.setState({addCameraGroupModalVisible: !this.state.addCameraGroupModalVisible})
  }

  render() {
    if (this.props.cameraGroups.length > 0) {
      return (
        <div>
          <Row type='flex' justify='center' align='middle' style={styles.cameraOptions}>
            <Col xs={{span: 14}} sm={{span: 6}}>
              <Select style={styles.select} value={this.props.selectedCameraGroup.name}
                      onSelect={(value, option) => this.selectCameraGroup(this.props.user, option.props.cameraGroup)}>
                {this.props.cameraGroups.map(cameraGroup => (
                  <Option key={`cameraGroup-${cameraGroup.id}`} cameraGroup={cameraGroup}>{cameraGroup.name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={{span: 2}} sm={{span: 1}} style={styles.toggleCameraGroupOptionsContainer}>
                {typeof this.props.selectedCameraGroup.userCameraGroupPrivileges !== 'undefined' ?          this.props.selectedCameraGroup.userCameraGroupPrivileges.map(userCameraGroupPrivilege => (
                  userCameraGroupPrivilege.users_id == this.props.user.id && 0 in userCameraGroupPrivilege.user_privileges_ids ?
                  <Tooltip key={userCameraGroupPrivilege.id} title='Toggle Camera Group Options' placement='bottom'>
                    <Icon style={styles.toggleCameraGroupOptions} type='ellipsis' onClick={this.toggleCameraGroupButtonsVisability} />
                  </Tooltip>
                  :
                  <Tooltip key={userCameraGroupPrivilege.id} title='Remove Camera Group' placement='bottom'>
                    <Popconfirm title="Are you sure you want to stop viewing this camera group? This action cannot be undone." onConfirm={() => this.props.removeUserCameraGroupPrivilegeInProcess ? '' : this.props.removeUserCameraGroupPrivilege(this.props.user, userCameraGroupPrivilege)} okText="Yes, remove camera group" cancelText="Nevermind">
                      <Button type="danger" icon="close" className="removeCameraGroupButton" style={styles.removeCameraGroupButton} loading={this.props.removeUserCameraGroupPrivilegeInProcess} disabled={this.props.removeUserCameraGroupPrivilegeInProcess}></Button>
                    </Popconfirm>
                  </Tooltip>
                )) : ''}
            </Col>
            {typeof this.props.selectedCameraGroup.userCameraGroupPrivileges !== 'undefined' ? this.props.selectedCameraGroup.userCameraGroupPrivileges.map(userCameraGroupPrivilege => (
              userCameraGroupPrivilege.users_id == this.props.user.id && 0 in userCameraGroupPrivilege.user_privileges_ids ?
              (<CameraOptionButtons
                key={userCameraGroupPrivilege.id}
                user={this.props.user}
                selectedCameraGroup={this.props.selectedCameraGroup}
                visible={this.state.cameraGroupButtonsVisible}
                cameraGroup={this.props.selectedCameraGroup}/>) :
              (
                <span></span>
              )
            )) : ''}
          </Row>
          {typeof this.props.selectedCameraGroup.userCameraGroupPrivileges !== 'undefined' ?
            <CameraTiles user={this.props.user} cameraGroup={this.props.selectedCameraGroup} liveView={this.state.liveView} />
          :
          <Row type='flex' justify='start' style={styles.cameraListContainer}>
            <p style={styles.noCamerasText}>
              Sorry! <br/> An error occurred. <br/> Please reload the page. <br/> If you keep seeing this message, <br/> please email alex@gorog.co and let us know.
            </p>
          </Row>
          }
        </div>
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
    width: 28
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
    removeUserCameraGroupPrivilege: (user, userCameraGroupPrivilege) => dispatch(removeUserCameraGroupPrivilege(user, userCameraGroupPrivilege)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraList);
