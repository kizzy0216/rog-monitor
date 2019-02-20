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
import { removeGuard } from '../redux/cameraGroups/actions';

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
    if (nextProps.cameraGroups.length && !nextProps.selectedCameraGroup.name) {
      this.selectCameraGroup(nextProps.cameraGroups[0]);
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

    if (nextProps.removeGuardError && nextProps.removeGuardError !== this.props.removeGuardError) {
      message.error(nextProps.removeGuardError);
    }
  }

  selectCameraGroup = (cameraGroup) => {
    this.props.actions.selectCameraGroup(cameraGroup);
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
            {/* <Col xs={{span: 2}} sm={{span: 1}}>
              {this.props.selectedCameraGroup.myRole}
            </Col> */}
            <Col xs={{span: 14}} sm={{span: 6}}>
              <Select style={styles.select} value={this.props.selectedCameraGroup.name}
                      onSelect={(value, option) => this.selectCameraGroup(option.props.cameraGroup)}>
                {this.props.cameraGroups.map(cameraGroup => (
                  <Option key={`cameraGroup-${cameraGroup.id}`} cameraGroup={cameraGroup}>{cameraGroup.name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={{span: 2}} sm={{span: 1}} style={styles.toggleCameraGroupOptionsContainer}>
              {this.props.selectedCameraGroup.myRole === 'viewer' ?
                (
                  this.props.selectedCameraGroup.guards.map(guard => (
                    guard.user.id == this.props.user.id ?
                      <Tooltip key={guard.id} title='Remove CameraGroup' placement='bottom'>
                        <Popconfirm title="Are you sure you want to stop viewing this cameraGroup? This action cannot be undone." onConfirm={() => this.props.removeGuardInProcess ? '' : this.props.removeGuard(this.props.user, guard)} okText="Yes, remove cameraGroup" cancelText="Nevermind">
                          <Button type="danger" icon="close" className="removeCameraGroupButton" style={styles.removeCameraGroupButton} loading={this.props.removeGuardInProcess} disabled={this.props.removeGuardInProcess}></Button>
                        </Popconfirm>
                      </Tooltip>
                    :
                    ''
                  ))
                ) :
                (
                  <Tooltip title='Toggle CameraGroup Options' placement='bottom'>
                    <Icon style={styles.toggleCameraGroupOptions} type='ellipsis' onClick={this.toggleCameraGroupButtonsVisability} />
                  </Tooltip>
                )
              }
            </Col>
            {this.props.selectedCameraGroup.myRole === 'viewer' ?
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
            <AddCameraGroupModal linkText='Create a cameraGroup to onboard cameras.' />
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
    removeGuardInProcess: state.cameraGroups.removeGuardInProcess,
    removeGuardError: state.cameraGroups.removeGuardError
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(cameraGroupActions, dispatch),
    addCameraGroupCamera: (user, cameraGroup, name, rtspUrl, username, password) => dispatch(addCameraGroupCamera(user, cameraGroup, name, rtspUrl, username, password)),
    trackEventAnalytics: (event, data) => dispatch(trackEventAnalytics(event, data)),
    listenForNewImageThumbnails: (user) => dispatch(listenForNewImageThumbnails(user)),
    removeGuard: (user, guard) => dispatch(removeGuard(user, guard)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraList);
