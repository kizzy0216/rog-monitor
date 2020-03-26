import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, message } from 'antd';

import { addCamera } from '../../redux/cameras/actions';

const AddCameraForm = ({visible, onCancel, onCreate, form, addCameraInProcess}) =>{
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
      <Form ref={form} {...layout}>
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
        <Form.Item name="username" rules={[{required: false, message: 'Please enter the camera username'}]} hasFeedback>
          <Input placeholder='Enter camera username'/>
        </Form.Item>
        <Form.Item name="password" rules={[{required: false, message: 'Please enter the camera password'}]} hasFeedback>
          <Input type='password' placeholder='Enter camera password'/>
        </Form.Item>
      </Form>
    </Modal>
  );
};

class AddCameraModal extends Component {
  state = {
    fullRtspUrl: null
  };

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (nextProps.addCameraSuccess && this.props.addCameraSuccess !== nextProps.addCameraSuccess) {
      this.resetFields();
      this.props.toggleAddCameraModalVisibility();
    }
    if (nextProps.addCameraError !== '' && this.props.addCameraError !== nextProps.addCameraError) {
      message.error(nextProps.addCameraError);
    }
    if(nextProps.cameraConnectionFail && nextProps.cameraConnectionFail !== this.props.cameraConnectionFail){
      message.error('Camera stream could not connect.');
    }
  };

  resetFields = () => {
    this.form.resetFields();
    this.setState({fullRtspUrl: null});
  };

  handleCancel = () => {
    this.resetFields();
    this.props.toggleAddCameraModalVisibility();
  };

  handleCreate = () => {
    const form = this.form;
    form.validateFields().then(values => {
      this.setState({fullRtspUrl: null}, () => {
        this.props.addCamera(this.props.user,
                                     this.props.selectedCameraGroup,
                                     values.name,
                                     values.rtspUrl.trim(),
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

  render() {
    return (
      <div>
        <AddCameraForm
          form={this.saveFormRef}
          visible={this.props.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          testLiveView={this.testLiveView}
          fullRtspUrl={this.state.fullRtspUrl}
          addCameraError={this.props.addCameraError}
          addCameraInProcess={this.props.addCameraInProcess}
        />
      </div>
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
  }
};

const mapStateToProps = (state) => {
  return {
    addCameraError: state.cameras.addCameraError,
    addCameraSuccess: state.cameras.addCameraSuccess,
    addCameraInProcess: state.cameras.addCameraInProcess,
    addedCameraData: state.cameras.addedCameraData,
    cameraConnectionEnabled: state.cameras.cameraConnectionEnabled,
    cameraConnectionUuid: state.cameras.cameraConnectionUuid,
    cameraConnectionFail: state.cameras.cameraConnectionFail
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addCamera: (user, cameraGroup, name, rtspUrl, username, password) => dispatch(addCamera(user, cameraGroup, name, rtspUrl, username, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCameraModal);
