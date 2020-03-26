import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Modal, Form, Input, Button, message, TimePicker, Select, Switch } from 'antd';
import { SettingOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';

import { editCamera } from '../../redux/cameras/actions';
import loading from '../../../assets/img/TempCameraImage.jpeg';

const formItemLayout = {
  labelCol: {
    xs: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 14 },
  },
};

class EditCamera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: false,
      flag: false,
      time_zone: this.props.data.time_zone,
      fullRtspUrl: null,
      vacation_mode: this.props.data.vacation_mode
    }
  }

  showModal = () => {
    this.setState({visible: true});
  };
  handleCancel = () => {
    this.setState({visible: false});
    this.setState({fullRtspUrl: null});
  };
  handleCreate = (e) => {
    const form = this.form;
    form.validateFields().then(values => {
      values.camera_group_uuid = this.props.data.cameraGroup.uuid;
      delete values.camera_url;
      this.props.editCamera(this.props.user, this.props.data.uuid, values);
      this.setState({visible: false});
      this.setState({flag: true});
      this.setState({fullRtspUrl: null});
    });
  };

  handleCreateSelectItems = () => {
    if (this.state.visible == true) {
      let timezoneNames = moment.tz.names();
      let items = [];
      for (var i = 0; i < timezoneNames.length; i++) {
        if (!items.includes(timezoneNames[i])) {
          if (timezoneNames[i] !== "US/Pacific-New") {
            items.push(<Select.Option key={timezoneNames[i]} value={timezoneNames[i]}>{timezoneNames[i]}</Select.Option>);
          }
        }
      }
      return items;
    }
  }

  handleUpdateTimeZone = (fieldValue) => {
    this.setState({time_zone: fieldValue});
  }

  handleToggleVacationMode = (fieldValue) => {
    this.setState({vacation_mode: fieldValue});
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (this.props.data.uuid === nextProps.data.uuid) {
      if (this.state.flag == true) {
        if (nextProps.editCameraError !== '' && this.props.editCameraError !== nextProps.editCameraError) {
          message.error(nextProps.editCameraError);
          this.setState({flag: false});
        }
        if (nextProps.editCameraSuccess === true) {
          // message.success("Camera Updated");
          this.setState({flag: false});
          this.this.props.data = nextProps.data;
        }
      }
    }
  }

  render() {
    return (
      <div>
        <SettingOutlined onClick={this.showModal} style={styles.editCamera}/>
        <Modal title={`Edit ${this.props.data.name}`}
               visible={this.state.visible}
               style={styles.modal}
               onCancel={this.handleCancel}
               onOk={this.handleCreate}
               okText='Done'
               cancelText='Cancel'
        >
          <Form
            initialValues={{
              name: this.props.data.name,
              camera_sku: this.props.data.uuid.slice(-8),
              camera_url: this.props.data.camera_url,
              username: this.props.data.username,
              vacation_mode: this.props.data.vacation_mode,
              time_zone: this.props.data.time_zone
            }}
          >
            <Form.Item label='Camera Name' name="name" {...formItemLayout}>
              <Input style={styles.input} type='text' placeholder="Camera Name" />
            </Form.Item>
            <Form.Item label="Camera SKU" name="camera_sku" {...formItemLayout}>
              <Input style={styles.input} type='text' disabled />
            </Form.Item>
            <Form.Item label='URL' name="camera_url" {...formItemLayout}>
              <Input style={styles.input} type='text' disabled />
            </Form.Item>
            <Form.Item label='Username' name="username" {...formItemLayout}>
              <Input style={styles.input} type='text' placeholder="Camera Username" />
            </Form.Item>
            <Form.Item label='Password' name="password" {...formItemLayout}>
              <Input style={styles.input} type='password' placeholder="********" />
            </Form.Item>
            <Form.Item label="Vacation Mode" name="vacation_mode" {...formItemLayout}>
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                onChange={this.handleToggleVacationMode}
                checked={this.state.vacation_mode}
              />
            </Form.Item>
            <Form.Item label="Camera Time Zone" name="time_zone" {...formItemLayout}>
              <Select
                style={styles.timeZone}
                showSearch
                placeholder="Enter Time Zone"
                optionFilterProp="children"
                default="UTC"
                onChange={this.handleUpdateTimeZone}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {this.handleCreateSelectItems()}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

const styles = {
  modal: {
    textAlign: 'center',
    wordBreak: 'break-word'
  },
  error: {
    color: 'red',
    textAlign: 'center'
  },
  editCamera: {
    float: 'right',
    fontSize: 18
  },
  image: {
    width: '50%'
  },
  timeZone: {
    width: '80%'
  },
  videoContainer: {
    backgroundColor: 'black',
    height: 130,
    width: 230,
    color: 'white',
    margin: '0 auto'
  },
  videoContainerText: {
    paddingTop: 50
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    editCameraInProcess: state.cameras.editCameraInProcess,
    editCameraError: state.cameras.editCameraError,
    editCameraSuccess: state.cameras.editCameraSuccess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    editCamera: (user, camera, cameraData) => dispatch(editCamera(user, camera, cameraData))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCamera);
