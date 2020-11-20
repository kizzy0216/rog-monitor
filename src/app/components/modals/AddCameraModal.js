import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, Select, message, Switch } from 'antd';
import { NodeExpandOutlined, NodeCollapseOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { addCamera, readAllIntegrationTemplates } from '../../redux/cameras/actions';
import ExternalIntegration from '../formitems/ExternalIntegration';
import moment from 'moment-timezone';
import {isEmpty} from '../../redux/helperFunctions';
// TODO: if the camera is a ROG verify camera, use this RTSP url: rtsp://172.31.19.237:8554/rog
const { Option } = Select;
const AddCameraForm = ({
  visible,
  onCancel,
  onCreate,
  form,
  addCameraInProcess,
  createSelectItems,
  updateTimeZone,
  currentTimeZone,
  selectedIntegrationTemplate,
  integrationTemplateFields,
  integrationActive,
  integrationList,
  setFormFieldsValue,
  resetFields,
  fieldsReset
}) =>{
  const layout = {
    wrapperCol: {
      span: 16,
      offset: 4
    }
  };
  return (
    <Modal title='Add a Camera'
      visible={visible}
      onCancel={onCancel}
      onOk={onCreate}
      okText='Add'
      cancelText='Cancel'
      confirmLoading={addCameraInProcess}
    >
      <Form ref={form} initialValues={{time_zone: currentTimeZone}} {...layout}>
        <Form.Item name="name" rules={[{required: true, message: 'Please input the camera name'}]} hasFeedback>
          <Input placeholder='Enter camera name'/>
        </Form.Item>
        <Form.Item
          name="rtspUrl"
          rules={[{
            required: true,
            pattern: new RegExp("^(rtsp:\/\/)+(?!.+@+.+:)"),
            message: "Please enter an RTSP URL without embedded credentials."
          }]}
          hasFeedback
        >
          <Input placeholder='Enter Camera URL'/>
        </Form.Item>
        <Form.Item name="time_zone" rules={[{required: true, message: 'Please enter your time zone'}]} hasFeedback>
          <Select
            showSearch
            placeholder="Enter Time Zone"
            optionFilterProp="children"
            onChange={updateTimeZone}
            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {createSelectItems()}
          </Select>
        </Form.Item>
        <p style={{margin: '0 auto', marginBottom: 14, marginTop: -10}}>Username:</p>
        <Form.Item name="username" rules={[{required: false, message: 'Please enter the camera username'}]} hasFeedback>
          <Input placeholder='Enter camera username'/>
        </Form.Item>
        <p style={{margin: '0 auto', marginBottom: 14, marginTop: -10}}>Password:</p>
        <Form.Item name="password" rules={[{required: false, message: 'Please enter the camera password'}]} hasFeedback>
          <Input type='password' placeholder='Enter camera password'/>
        </Form.Item>
        <ExternalIntegration setFormFieldsValue={setFormFieldsValue} resetFields={resetFields} fieldsReset={fieldsReset} disabled={false} />
      </Form>
    </Modal>
  );
};

class AddCameraModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullRtspUrl: null,
      time_zone: props.time_zone,
      integrationActive: false,
      integrationList: this.props.integrationList,
      selectedIntegrationTemplate: null,
      integrationTemplateFields: null,
      resetFields: false
    };
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (nextProps.integrationList !== this.state.integrationList) {
      this.setState({integrationList: nextProps.integrationList});
    }
    if (this.props.time_zone !== nextProps.time_zone) {
      this.setState({time_zone: nextProps.time_zone});
      if (typeof this.form !== 'undefined') {
        this.form.setFieldsValue({time_zone: nextProps.time_zone});
      }
    }
    if (nextProps.addCameraSuccess && this.props.addCameraSuccess !== nextProps.addCameraSuccess) {
      this.resetFields();
      this.props.toggleAddCameraModalVisibility();
    }
    if (nextProps.addCameraError !== '' && this.props.addCameraError !== nextProps.addCameraError) {
      message.error(nextProps.addCameraError, 10);
    }
    if(nextProps.cameraConnectionFail && nextProps.cameraConnectionFail !== this.props.cameraConnectionFail){
      message.error('Camera stream could not connect.', 10);
    }
  };

  resetFields = () => {
    this.form.resetFields();
    this.setState({
      fullRtspUrl: null,
      integrationActive: false,
      integrationTemplateFields: null,
      selectedIntegrationTemplate: null,
      resetFields: true
    });
  };

  handleCancel = () => {
    this.form.resetFields();
    this.setState({
      integrationActive: false,
      integrationTemplateFields: null,
      selectedIntegrationTemplate: null,
      resetFields: true
    });
    this.props.toggleAddCameraModalVisibility();
  };

  handleCreate = () => {
    const form = this.form;
    form.validateFields().then(values => {
      if (typeof values.external_integration === 'undefined') {
        values.external_integration = false;
      }
      values.rtspUrl = values.rtspUrl.trim();
      this.props.addCamera(
        this.props.user,
        this.props.selectedCameraGroup,
        this.state.time_zone,
        values
      );
      this.setState({resetFields: true});
    });
  };

  saveFormRef = (form) => {
    this.form = form;
  };

  getFullRtspUrl = (rtspUrl, username, password) => {
    let index = rtspUrl.indexOf(":");
    let protocol = rtspUrl.substr(0, index + 3).toLowerCase();
    let urlAddress = rtspUrl.substr(index + 3);
    let lowerCaseUrl = (protocol + `${username}:${password}@` + urlAddress);
    return lowerCaseUrl;
  }

  testLiveView = () => {
    let isChrome = window.chrome || window.chrome.webstore;
    let isFirefox = typeof InstallTrigger !== 'undefined';
    let isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    if (!isChrome && !isFirefox && !isOpera) {
      alert('Sorry, live video requires the desktop Chrome, Firefox, or Opera web browser.');
    } else {
      const form = this.form;
      form.validateFields(['rtspUrl', 'username', 'password']).then(values => {
        this.setState({fullRtspUrl: null}, () => {
          this.setState({fullRtspUrl: this.getFullRtspUrl(values.rtspUrl, values.username, values.password)});
        });
      })
    }
  }

  handleCreateSelectItems = () => {
    let timezoneNames = moment.tz.names();
    let items = [];
    for (var i = 0; i < timezoneNames.length; i++) {
      if (!items.includes(timezoneNames[i])) {
        if (timezoneNames[i] !== "US/Pacific-New") {
          items.push(<Select.Option key={this.guid()} value={timezoneNames[i]}>{timezoneNames[i]}</Select.Option>);
        }
      }
    }
    return items;
  }

  handleUpdateTimeZone = (fieldValue) => {
    this.setState({time_zone: fieldValue});
  }

  handleSetFormFieldsValue = (field) => {
    this.form.setFieldsValue(field);
  }

  handleFieldsReset = () => {
    this.setState({resetFields: false});
  }

  guid = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  render() {
    return (
      <AddCameraForm
        form={this.saveFormRef}
        visible={this.props.visible}
        onCancel={this.handleCancel}
        onCreate={this.handleCreate}
        testLiveView={this.testLiveView}
        fullRtspUrl={this.state.fullRtspUrl}
        addCameraError={this.props.addCameraError}
        addCameraInProcess={this.props.addCameraInProcess}
        createSelectItems={this.handleCreateSelectItems}
        updateTimeZone={this.handleUpdateTimeZone}
        currentTimeZone={this.state.time_zone}
        integrationActive={this.state.integrationActive}
        integrationList={this.state.integrationList}
        selectedIntegrationTemplate={this.state.selectedIntegrationTemplate}
        integrationTemplateFields={this.state.integrationTemplateFields}
        setFormFieldsValue={this.handleSetFormFieldsValue}
        resetFields={this.state.resetFields}
        fieldsReset={this.handleFieldsReset}
      />
    );
  }
}

const styles = {
  videoContainer: {
    backgroundColor: 'black',
    height: 130,
    width: 230,
    color: 'white',
    margin: '0 auto'
  },
  videoContainerText: {
    paddingTop: 50
  },
  error: {
    color: 'red'
  },
  timeZone: {
    width: '80%'
  }
};

const mapStateToProps = (state) => {
  return {
    addCameraError: state.cameras.addCameraError,
    addCameraSuccess: state.cameras.addCameraSuccess,
    addCameraInProcess: state.cameras.addCameraInProcess,
    addedCameraData: state.cameras.addedCameraData,
    cameraArmed: state.cameras.cameraArmed,
    cameraConnectionUuid: state.cameras.cameraConnectionUuid,
    cameraConnectionFail: state.cameras.cameraConnectionFail,
    integrationList: state.cameras.integrationList
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addCamera: (user, cameraGroup, name, rtspUrl, time_zone, username, password) => dispatch(addCamera(user, cameraGroup, name, rtspUrl, time_zone, username, password)),
    readAllIntegrationTemplates: (user) => dispatch(readAllIntegrationTemplates(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCameraModal);
