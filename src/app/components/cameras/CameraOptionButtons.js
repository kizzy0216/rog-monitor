import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Icon, Menu, Dropdown, Tooltip, message } from 'antd';

import AddCameraModal from '../modals/AddCameraModal';
import ShareCameraGroupModal from '../modals/ShareCameraGroupModal';
import EditCameraGroupModal from '../modals/EditCameraGroupModal';
import CameraGroupPrivilegeSettingsModal from '../modals/CameraGroupPrivilegeSettingsModal';
import { fetchUserCameraLicenses } from '../../redux/users/actions';

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
      message.error("You have reached your license limit. Please send an email requesting additional licenses to help@gorog.co");
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
              <Icon style={styles.share} type='share-alt' onClick={this.toggleShareCameraGroupModalVisibility}/>
            </Tooltip>
            <ShareCameraGroupModal
              selectedCameraGroup={this.props.selectedCameraGroup}
              visible={this.state.shareCameraGroupModalVisible}
              toggleShareCameraGroupModalVisibility={this.toggleShareCameraGroupModalVisibility.bind(this)} />
          </Col>
          <Col xs={{span: 8}}>
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

const mapStateToProps = (state) => {
  return {}
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUserCameraLicenses: (user) => dispatch(fetchUserCameraLicenses(user))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraOptionButtons);
