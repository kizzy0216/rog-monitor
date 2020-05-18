import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Menu, Dropdown, Tooltip, Button, message, Popconfirm } from 'antd';
import { SettingOutlined, VideoCameraAddOutlined, ShareAltOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';

import AddCameraModal from '../modals/AddCameraModal';
import ShareCameraGroupModal from '../modals/ShareCameraGroupModal';
import EditCameraGroupModal from '../modals/EditCameraGroupModal';
import CameraGroupPrivilegeSettingsModal from '../modals/CameraGroupPrivilegeSettingsModal';
import { fetchUserCameraLicenses } from '../../redux/users/actions';
import { enableCameraGroup, disableCameraGroup } from '../../redux/cameraGroups/actions';

class CameraOptionButtons extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addCameraModalVisible: false,
      shareCameraGroupModalVisible: false
    }
  }

  toggleAddCameraModalVisibility = () => {
    let licensesAvailable = this.countAvailableCameraLicenses();
    if (licensesAvailable >= 1) {
      this.setState({addCameraModalVisible: !this.state.addCameraModalVisible})
    } else if (this.state.addCameraModalVisible === true) {
      this.setState({addCameraModalVisible: false})
    } else {
      message.error("You have reached your license limit. Please send an email requesting additional licenses to hello@gorog.co");
    }
  }

  countAvailableCameraLicenses = () => {
    this.props.fetchUserCameraLicenses(this.props.user)
    let count = 0;
    this.props.user.cameraLicenses.map(cameraLicense => cameraLicense.cameras_uuid == null ? count++ : count)
    return count;
  }

  toggleShareCameraGroupModalVisibility = () => {
    this.setState({shareCameraGroupModalVisible: !this.state.shareCameraGroupModalVisible})
  }

  render() {
    if (this.props.visible) {
      return (
        <Col xs={{span: 8}} sm={{span: 6}} md={{span: 4}} style={styles.optionsContainer}>
          <Col xs={{span: 4}} style={styles.optionWrapper}>
            <Tooltip title='Add Camera' placement="top">
              <VideoCameraAddOutlined style={styles.addCamera} onClick={this.toggleAddCameraModalVisibility}/>
            </Tooltip>
            <AddCameraModal
              user={this.props.user}
              selectedCameraGroup={this.props.selectedCameraGroup}
              visible={this.state.addCameraModalVisible}
              toggleAddCameraModalVisibility={this.toggleAddCameraModalVisibility.bind(this)} />
          </Col>
          <Col xs={{span: 4}} style={styles.optionWrapper}>
            <Tooltip title='Share CameraGroup' placement="top">
              <ShareAltOutlined style={styles.share} onClick={this.toggleShareCameraGroupModalVisibility}/>
            </Tooltip>
            <ShareCameraGroupModal
              selectedCameraGroup={this.props.selectedCameraGroup}
              visible={this.state.shareCameraGroupModalVisible}
              toggleShareCameraGroupModalVisibility={this.toggleShareCameraGroupModalVisibility.bind(this)} />
          </Col>
          <Col xs={{span: 4}} style={styles.optionWrapper}>
            <Tooltip title='Enable CameraGroup' placement="top">
              <Popconfirm title="Are you sure you want to enable this camera group?" onConfirm={() => this.props.enableCameraGroup(this.props.user, this.props.selectedCameraGroup)} okText="Enable" cancelText="Nevermind">
                <Button type="link" style={styles.enableDisableCameraGroup}><LinkOutlined /></Button>
              </Popconfirm>
            </Tooltip>
          </Col>
          <Col xs={{span: 4}} style={styles.optionWrapper}>
            <Tooltip title='Disable CameraGroup' placement="top">
              <Popconfirm title="Are you sure you want to disable this camera group?" onConfirm={() => this.props.disableCameraGroup(this.props.user, this.props.selectedCameraGroup)} okText="Disable" cancelText="Nevermind">
                <Button type="link" style={styles.enableDisableCameraGroup}><DisconnectOutlined /></Button>
              </Popconfirm>
            </Tooltip>
          </Col>
          <Col xs={{span: 4}} style={styles.optionWrapper}>
            <Dropdown
            placement='bottomCenter'
            overlay={
              <Menu>
                <Menu.Item>
                  <EditCameraGroupModal selectedCameraGroup={this.props.selectedCameraGroup} />
                </Menu.Item>
                <Menu.Item>
                  <CameraGroupPrivilegeSettingsModal selectedCameraGroup={this.props.selectedCameraGroup} />
                </Menu.Item>
              </Menu>
            }>
              <SettingOutlined style={styles.edit} type='setting'/>
            </Dropdown>
          </Col>
        </Col>
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
    fontSize: 20,
    paddingLeft: 10
  },
  edit: {
    fontSize: 20,
    paddingLeft: 10
  },
  addCamera: {
    fontSize: 20,
    paddingLeft: 10
  },
  optionsContainer: {
    marginTop: -5,
    width: 60
  },
  optionWrapper: {
    display: 'inline-block'
  },
  enableDisableCameraGroup: {
    color: 'inherit',
    fontSize: 20,
    paddingLeft: 10,
    paddingRight: 0
  }
}

const mapStateToProps = (state) => {
  return {}
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUserCameraLicenses: (user) => dispatch(fetchUserCameraLicenses(user)),
    enableCameraGroup: (user, cameraGroup) => dispatch(enableCameraGroup(user, cameraGroup)),
    disableCameraGroup: (user, cameraGroup) => dispatch(disableCameraGroup(user, cameraGroup))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraOptionButtons);
