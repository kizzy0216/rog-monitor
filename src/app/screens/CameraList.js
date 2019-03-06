import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, Select, Row, Col, Icon, Modal, Button, Input, Form, Tooltip, message, Popconfirm } from 'antd';
const Option = Select.Option;

import CameraTiles from '../components/cameras/CameraTiles';
import AddCameraGroupModal from '../components/modals/AddCameraGroupModal';
import CameraOptionButtons from '../components/cameras/CameraOptionButtons';

import { listenForNewImageThumbnails } from '../redux/cameras/actions';
import * as cameraGroupActions from '../redux/cameraGroups/actions';
import { trackEventAnalytics } from '../redux/auth/actions';
import { removeCameraGroupPrivilege } from '../redux/cameraGroups/actions';

class CameraList extends Component {
  constructor(props) {
    super(props);
    let currentGuard = '';
    this.state = {
      rtspUrl: '',
      liveView: true,
      cameraGroupButtonsVisible: false,
      addCameraGroupModalVisible: false
    }
  }

  componentWillMount = () => {
    this.props.actions.fetchCameraGroups(this.props.user, this.props.rummage, true);
    this.props.listenForNewImageThumbnails(this.props.user);
  }
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.cameraGroups.length > 0) {
      if (!nextProps.selectedCameraGroup.name || !('cameras' in nextProps.selectedCameraGroup) || !('userCameraGroupPrivileges' in nextProps.selectedCameraGroup)) {
        this.selectCameraGroup(nextProps.user, nextProps.cameraGroups[0]);
      }
    }

    if (this.props.selectedCameraGroup.cameras.length > 0) {
      const cameraGroupOwnedEvent = {
        email: this.props.user.email,
        name: this.props.user.firstName+ ' ' +this.props.user.lastName,
        cameraGroup_owned: this.props.cameraGroups.length,
        camera_owned: this.props.selectedCameraGroup.cameras.length
      };

      this.props.trackEventAnalytics('cameraGroup owned', cameraGroupOwnedEvent);
    }

    if (nextProps.deleteCameraError && nextProps.deleteCameraError !== this.props.deleteCameraError) {
      message.error(nextProps.deleteCameraError);
    }

    if (nextProps.rescindInviteError && nextProps.rescindInviteError !== this.props.rescindInviteError) {
      message.error(nextProps.rescindInviteError);
    }

    if (nextProps.removeCameraGroupPrivilegeError && nextProps.removeCameraGroupPrivilegeError !== this.props.removeCameraGroupPrivilegeError) {
      message.error(nextProps.removeCameraGroupPrivilegeError);
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
    if (this.props.cameraGroups.length) {
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
              {this.props.selectedCameraGroup.userCameraGroupPrivileges === 2 ?
                (
                  this.props.selectedCameraGroup.userCameraGroupPrivileges.map(userCameraGroupPrivilege => (
                    userCameraGroupPrivilege.user.id == this.props.user.id ?
                      <Tooltip key={userCameraGroupPrivilege.id} title='Remove Camera Group' placement='bottom'>
                        <Popconfirm title="Are you sure you want to stop viewing this camera group? This action cannot be undone." onConfirm={() => this.props.removeCameraGroupPrivilegeInProcess ? '' : this.props.removeCameraGroupPrivilege(this.props.user, userCameraGroupPrivilege)} okText="Yes, remove camera group" cancelText="Nevermind">
                          <Button type="danger" icon="close" className="removeCameraGroupButton" style={styles.removeCameraGroupButton} loading={this.props.removeCameraGroupPrivilegeInProcess} disabled={this.props.removeCameraGroupPrivilegeInProcess}></Button>
                        </Popconfirm>
                      </Tooltip>
                    :
                    ''
                  ))
                ) :
                (
                  <Tooltip title='Toggle Camera Group Options' placement='bottom'>
                    <Icon style={styles.toggleCameraGroupOptions} type='ellipsis' onClick={this.toggleCameraGroupButtonsVisability} />
                  </Tooltip>
                )
              }
            </Col>
            {this.props.selectedCameraGroup.userCameraGroupPrivileges === 2 ?
              (<span></span>) :
              (
                <CameraOptionButtons
                  user={this.props.user}
                  selectedCameraGroup={this.props.selectedCameraGroup}
                  visible={this.state.cameraGroupButtonsVisible}
                  cameraGroups={this.props.cameraGroups}/>
              )
            }
          </Row>

          <CameraTiles user={this.props.user} cameraGroup={this.props.selectedCameraGroup} liveView={this.state.liveView} />
        </div>
      )
    }
    else {
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
    removeCameraGroupPrivilegeInProcess: state.cameraGroups.removeCameraGroupPrivilegeInProcess,
    removeCameraGroupPrivilegeError: state.cameraGroups.removeCameraGroupPrivilegeError
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(cameraGroupActions, dispatch),
    addCameraGroupCamera: (user, cameraGroup, name, rtspUrl, username, password) => dispatch(addCameraGroupCamera(user, cameraGroup, name, rtspUrl, username, password)),
    trackEventAnalytics: (event, data) => dispatch(trackEventAnalytics(event, data)),
    listenForNewImageThumbnails: (user) => dispatch(listenForNewImageThumbnails(user)),
    removeCameraGroupPrivilege: (user, userCameraGroupPrivilege) => dispatch(removeCameraGroupPrivilege(user, userCameraGroupPrivilege)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraList);
