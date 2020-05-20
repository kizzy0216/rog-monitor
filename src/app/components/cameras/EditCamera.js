import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Modal, Form, Input, Button, message, TimePicker, Select, Switch, Popconfirm } from 'antd';
import { SettingOutlined, CheckOutlined, CloseOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
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
      popconfirmvisible: false,
      error: false,
      flag: false,
      time_zone: this.props.data.time_zone,
      fullRtspUrl: null,
      away_mode: this.props.data.away_mode,
      enabled: this.props.data.enabled
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
      values.camera_groups_uuid = this.props.data.cameraGroup.uuid;
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

  handleToggleAwayMode = (fieldValue) => {
    if (this.props.cameraArmed && this.state.enabled) {
      this.setState({away_mode: fieldValue});
    } else {
      this.setState({away_mode: false});
      message.error('Camera connection must be enabled and triggers must be armed in order to turn on away mode.');
    }
  }

  handleVisibleChange = (popconfirmvisible) => {
    if (!popconfirmvisible) {
      this.setState({ popconfirmvisible });
    }
    if (!this.state.enabled) {
      this.handleToggleEnabled(!this.state.enabled);
    } else {
      this.setState({ popconfirmvisible });
    }
  }

  handleToggleEnabled = (fieldValue) => {
    this.setState({enabled: fieldValue});
    if (!this.state.enabled == false) {
      this.setState({away_mode: false});
    }
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
        }
      }
    }
  }

  saveFormRef = (form) => {
    this.form = form;
  };

  render() {
    let away_mode = this.props.cameraArmed ? this.props.data.away_mode : false;
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
            ref={this.saveFormRef}
            initialValues={{
              name: this.props.data.name,
              camera_sku: this.props.data.uuid.slice(-8),
              camera_url: this.props.data.camera_url,
              username: this.props.data.username,
              away_mode: away_mode,
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
            <Form.Item label="Away Mode" name="away_mode" {...formItemLayout}>
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                onChange={this.handleToggleAwayMode}
                checked={this.state.away_mode}
              />
            </Form.Item>
            <Form.Item
              label="Camera Connection"
              name="enabled" {...formItemLayout}>
              <Popconfirm
                title={<p>Are you sure you want to disconnect this camera? <br /> <font color='orange'>WARNING: This will disconnect the ROG Security system</font></p>}
                visible={this.state.popconfirmvisible}
                onVisibleChange={this.handleVisibleChange}
                onConfirm={() => this.handleToggleEnabled(!this.state.enabled)}
                okText="Confirm"
                cancelText="Nevermind">
                <Switch
                  checkedChildren={<LinkOutlined />}
                  unCheckedChildren={<DisconnectOutlined />}
                  checked={this.state.enabled}
                />
              </Popconfirm>
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
    editCameraSuccess: state.cameras.editCameraSuccess,
    cameraConnectionEnabled: state.cameras.cameraConnectionEnabled,
    cameraArmed: state.cameras.cameraArmed
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    editCamera: (user, camera, cameraData) => dispatch(editCamera(user, camera, cameraData))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCamera);
