import React, { Component } from 'react';
import { Row, Col, Icon, Menu, Dropdown, Tooltip, message } from 'antd';

import AddCameraModal from '../modals/AddCameraModal';
import InviteGuardModal from '../modals/InviteGuardModal';
import EditCameraGroupModal from '../modals/EditCameraGroupModal';
import GuardSettingsModal from '../modals/GuardSettingsModal';

//here
const SettingsMenu = (props) => (
  <Menu>
    <Menu.Item>
      <EditCameraGroupModal selectedCameraGroup={props.selectedCameraGroup} />
    </Menu.Item>
    <Menu.Item>
      <GuardSettingsModal selectedCameraGroup={props.selectedCameraGroup} />
    </Menu.Item>
  </Menu>
)

class CameraOptionButtons extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addCameraModalVisible: false,
      inviteGuardModalVisible: false,
    }
  }

  toggleAddCameraModalVisibility = () => {
    let licensesAvailable = this.props.user.cameraLicenses - this.checkLicensesUsed();
    if (licensesAvailable >= 1) {
      this.setState({addCameraModalVisible: !this.state.addCameraModalVisible})
    } else {
      message.error("You have reached your license limit. Please send an email requesting additional licenses to help@gorog.co");
    }
  }

  checkLicensesUsed = () => {
    if (this.props.cameraGroups.length) {
      return  this.props.cameraGroups.map(cameraGroup => cameraGroup.cameras && cameraGroup.myRole === 'owner' ? cameraGroup.cameras : [])
                .reduce((a, b) => a.concat(b))
                .length;
    }
    else {
      return 0;
    }
  }

  toggleInviteGuardModalVisibility = () => {
    this.setState({inviteGuardModalVisible: !this.state.inviteGuardModalVisible})
  }

  render() {
    if (this.props.visible) {
      return (
        <div>
          <Col xs={{span: 8}}>
            <Tooltip title='Add Camera' placement='bottom'>
              <Icon type='video-camera' style={styles.addCamera} onClick={this.toggleAddCameraModalVisibility}/>
              <Icon style={styles.addCameraPlus} type='plus' onClick={this.toggleAddCameraModalVisibility}/>
            </Tooltip>
            <AddCameraModal
              user={this.props.user}
              selectedCameraGroup={this.props.selectedCameraGroup}
              visible={this.state.addCameraModalVisible}
              toggleAddCameraModalVisibility={this.toggleAddCameraModalVisibility.bind(this)} />
          </Col>
          <Col xs={{span: 8}}>
            <Tooltip title='Share CameraGroup' placement='bottom'>
              <Icon style={styles.share} type='share-alt' onClick={this.toggleInviteGuardModalVisibility}/>
            </Tooltip>
            <InviteGuardModal
              selectedCameraGroup={this.props.selectedCameraGroup}
              visible={this.state.inviteGuardModalVisible}
              toggleInviteGuardModalVisibility={this.toggleInviteGuardModalVisibility.bind(this)} />
          </Col>
          <Col xs={{span: 8}}>
            <Dropdown selectedCameraGroup={this.props.selectedCameraGroup} overlay={<SettingsMenu selectedCameraGroup={this.props.selectedCameraGroup} />}>
              <Icon style={styles.edit} type='setting'/>
            </Dropdown>
          </Col>
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
  }
}

const styles = {
  share: {
    float: 'left',
    fontSize: 18,
    paddingLeft: 10
  },
  edit: {
    float: 'left',
    fontSize: 18,
    paddingLeft: 10
  },
  addCamera: {
    float: 'right',
    fontSize: 18,
    paddingLeft: 10
  },
  addCameraPlus: {
    float: 'right',
    fontSize: 10,
    marginRight: -22,
    marginTop: 3.5
  }
}

export default CameraOptionButtons;
