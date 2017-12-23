import React, { Component } from 'react';
import { Row, Col, Icon, Menu, Dropdown, Tooltip } from 'antd';

import AddCameraModal from '../modals/AddCameraModal';
import InviteGuardModal from '../modals/InviteGuardModal';
import EditLocationModal from '../modals/EditLocationModal';
import GuardSettingsModal from '../modals/GuardSettingsModal';

//here
const SettingsMenu = (props) => (
  <Menu>
    <Menu.Item>
      <EditLocationModal selectedLocation={props.selectedLocation} />
    </Menu.Item>
    <Menu.Item>
      <GuardSettingsModal selectedLocation={props.selectedLocation} />
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
    this.setState({addCameraModalVisible: !this.state.addCameraModalVisible})
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
              selectedLocation={this.props.selectedLocation}
              visible={this.state.addCameraModalVisible}
              toggleAddCameraModalVisibility={this.toggleAddCameraModalVisibility.bind(this)} />
          </Col>
          <Col xs={{span: 8}}>
            <Tooltip title='Share Location' placement='bottom'>
              <Icon style={styles.share} type='share-alt' onClick={this.toggleInviteGuardModalVisibility}/>
            </Tooltip>
            <InviteGuardModal
              selectedLocation={this.props.selectedLocation}
              visible={this.state.inviteGuardModalVisible}
              toggleInviteGuardModalVisibility={this.toggleInviteGuardModalVisibility.bind(this)} />
          </Col>
          <Col xs={{span: 8}}>
            <Dropdown selectedLocation={this.props.selectedLocation} overlay={<SettingsMenu selectedLocation={this.props.selectedLocation} />}>
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
