import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Icon, Modal, Form, Input, Button, message, TimePicker, Select, Switch } from 'antd';
import moment from 'moment-timezone';

import { editCamera } from '../../redux/cameras/actions';
import loading from '../../../assets/img/TempCameraImage.jpeg';

const Option = Select.Option;
const FormItem = Form.Item;
const CameraForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, form, cameraData, updateTimeZone, createSelectItems, toggleVacationMode, vacationMode} = props;
    const {getFieldDecorator, fullRtspUrl} = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 16 },
      },
    };
    return (
      <Modal title={`Edit ${cameraData.name}`}
             visible={visible}
             style={styles.modal}
             onCancel={onCancel}
             onOk={onCreate}
             okText='Done'
             cancelText='Cancel'
      >
        <Form>
          <FormItem label='Camera Name' {...formItemLayout}>
            {getFieldDecorator('name', {
              'initialValue': cameraData.name
            })(
              <Input style={styles.input} type='text' placeholder="Camera Name" />
            )}
          </FormItem>
          <FormItem label="Camera SKU" {...formItemLayout}>
            {getFieldDecorator('camera_sku', {
              'initialValue': cameraData.uuid.slice(-8)
            })(
              <Input style={styles.input} type='text' disabled />
            )}
          </FormItem>
          <FormItem label='URL' {...formItemLayout}>
            {getFieldDecorator('camera_url', {
              'initialValue': cameraData.camera_url
            })(
              <Input style={styles.input} type='text' disabled />
            )}
          </FormItem>
          <FormItem label='Username' {...formItemLayout}>
            {getFieldDecorator('username', {
              'initialValue': cameraData.username
            })(
              <Input style={styles.input} type='text' placeholder="Camera Username" />
            )}
          </FormItem>
          <FormItem label='Password' {...formItemLayout}>
            {getFieldDecorator('password')(
              <Input style={styles.input} type='password' placeholder="********" />
            )}
          </FormItem>
          <FormItem label="Vacation Mode" {...formItemLayout}>
            {getFieldDecorator('vacation_mode', {
              'initialValue': cameraData.vacation_mode
            })(
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="close" />}
                onChange={toggleVacationMode}
                checked={vacationMode}
              />
            )}
          </FormItem>
          <FormItem label="Camera Time Zone">
            {getFieldDecorator('time_zone', {
              'initialValue': cameraData.time_zone
            })(
              <Select
                style={styles.timeZone}
                showSearch
                placeholder="Enter Time Zone"
                optionFilterProp="children"
                default="UTC"
                onChange={updateTimeZone}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {props.createSelectItems()}
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

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
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
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
            items.push(<Option key={timezoneNames[i]} value={timezoneNames[i]}>{timezoneNames[i]}</Option>);
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
          this.cameraData = nextProps.data;
        }
      }
    }
  }

  render() {
    return (
      <div>
        <Icon type='setting' onClick={this.showModal} style={styles.editCamera}/>
        <CameraForm
          ref={(form) => this.form = form}
          visible={this.state.visible}
          time_zone={this.state.time_zone}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          updateTimeZone={this.handleUpdateTimeZone}
          createSelectItems={this.handleCreateSelectItems}
          error={this.state.error}
          cameraData={this.props.data}
          toggleVacationMode={this.handleToggleVacationMode}
          vacationMode={this.state.vacation_mode}
        />
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
