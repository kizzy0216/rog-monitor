import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, Select, message, Switch } from 'antd';
import { NodeExpandOutlined, NodeCollapseOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { addCamera, readAllIntegrationTemplates } from '../../redux/cameras/actions';
import moment from 'moment-timezone';
// TODO: if the camera is a ROG verify camera, use this RTSP url: rtsp://172.31.19.237:8554/rog
const AddCameraForm = ({
  visible,
  onCancel,
  onCreate,
  form,
  addCameraInProcess,
  createSelectItems,
  updateTimeZone,
  currentTimeZone,
  toggleIntegration,
  existingIntegration,
  updateIntegrationTemplate,
  selectedIntegrationTemplate,
  integrationTemplateFields
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
        <Form.Item name="integration_toggle">
          <Switch onChange={toggleIntegration} defaultChecked={existingIntegration} loading={false} checkedChildren={<NodeExpandOutlined />} unCheckedChildren={<NodeCollapseOutlined />}></Switch>
        </Form.Item>
        {/* TODO: insert logic here to control the 3rd party integration visability */}
        <Form.Item name="integration_template">
          <Select defaultValue={selectedIntegrationTemplate} onChange={updateIntegrationTemplate}></Select>
        </Form.Item>
        {/* TODO: for this part of the form, we need to iterate through the template and dynamically generate the form fields */}
        {selectedIntegrationTemplate &&
          <Form.List
            name="integration_settings"
            rules={[
              {
                validator: async (_, names) => {
                  if (!names) { //put validator conditionals here separated by &&, || (and, or)
                    return Promise.reject(new Error('Error Message'));
                  }
                },
              },
            ]}
          >
            {(integrationTemplateFields, { add, move, remove }, { errors }) => (
              <div>
                {fields.map((field, index) => (
                  <Form.Item
                    {...field}
                    label={index}
                    key={field.key}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: false,
                        whitespace: true,
                        message: "Error Message",
                      },
                    ]}
                    noStyle
                    hasFeedback
                  >
                    <Input style={{ width: '60%' }} />
                  </Form.Item>
                ))}
              </div>
            )}
          </Form.List>
        }
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
      toggleIntegration: null,
      existingIntegration: null,
      updateIntegrationTemplate: null,
      selectedIntegrationTemplate: null,
      integrationTemplateFields: null
    };
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
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
    this.setState({fullRtspUrl: null});
  };

  handleCancel = () => {
    this.form.resetFields();
    this.props.toggleAddCameraModalVisibility();
  };

  handleCreate = () => {
    const form = this.form;
    form.validateFields().then(values => {
      this.setState({fullRtspUrl: null}, () => {
        // TODO: add new parameters into this function if external integration toggle is active.
        this.props.addCamera(this.props.user,
                                     this.props.selectedCameraGroup,
                                     values.name,
                                     values.rtspUrl.trim(),
                                     this.state.time_zone,
                                     values.username,
                                     values.password);
      });
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
          items.push(<Select.Option key={timezoneNames[i]} value={timezoneNames[i]}>{timezoneNames[i]}</Select.Option>);
        }
      }
    }
    return items;
  }

  handleUpdateTimeZone = (fieldValue) => {
    this.setState({time_zone: fieldValue});
  }

  handleToggleIntegration = () => {
    this.readAllIntegrationTemplates(this.props.user);
  }

  handleUpdateIntegrationTemplate = () => {
    // code...
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
        toggleIntegration={this.handleToggleIntegration}
        existingIntegration={this.state.existingIntegration}
        updateIntegrationTemplate={this.handleUpdateIntegrationTemplate}
        selectedIntegrationTemplate={this.state.selectedIntegrationTemplate}
        integrationTemplateFields={this.state.integrationTemplateFields}
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
    cameraConnectionFail: state.cameras.cameraConnectionFail
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addCamera: (user, cameraGroup, name, rtspUrl, time_zone, username, password) => dispatch(addCamera(user, cameraGroup, name, rtspUrl, time_zone, username, password)),
    readAllIntegrationTemplates: (user) => dispatch(readAllIntegrationTemplates(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCameraModal);
