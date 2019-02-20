import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, Icon, message } from 'antd';

import RtspStream from '../video/RtspStream';

import { addCameraGroupCamera } from '../../redux/cameraGroups/actions';
import { registerCamera } from '../../redux/alerts/actions';

const FormItem = Form.Item;

const AddCameraForm = Form.create()(
  (props) => {
    const {visible, onCancel, onCreate, form} = props;
    const {getFieldDecorator} = form;

    return (
      <Modal title='Add a Camera'
        visible={visible}
        onCancel={onCancel}
        onOk={onCreate}
        okText='Add'
        cancelText='Cancel'
        confirmLoading={props.addCameraGroupCameraInProcess}
      >
        <Form>
          <FormItem style={styles.videoContainer}>
            {props.fullRtspUrl ?
              (<RtspStream rtspUrl={props.fullRtspUrl} />) :
              (
                <p style={styles.videoContainerText}>
                  {props.addCameraGroupCameraInProcess ? 'Adding camera' : 'No Video Available'}
                </p>
              )
            }
          </FormItem>
          <FormItem hasFeedback>
            <Button key='submit' type='primary' size='large' onClick={props.testLiveView}>
              <Icon type='reload'></Icon>Test Live View
            </Button>
            <div style={styles.error}>{props.addCameraGroupCameraError}</div>
          </FormItem>
          <FormItem hasFeedback>
            {getFieldDecorator('name', {rules: [
                {required: true, message: 'Please input the camera name'}
              ]
            })(
              <Input placeholder='Enter camera name'/>
            )}
          </FormItem>
          <FormItem hasFeedback>
            {getFieldDecorator('rtspUrl', {rules: [
                {required: true, message: 'Please enter the camera URL'}
              ]
            })(
              <Input placeholder='Enter Camera URL'/>
            )}

          </FormItem>
          <FormItem hasFeedback>
            {getFieldDecorator('username', {
              rules: [
                {required: false, message: 'Please enter the camera username'}
              ]
            })(
              <Input placeholder='Enter camera username'/>
            )}
          </FormItem>
          <FormItem hasFeedback>
            {getFieldDecorator('password', {
              rules: [
                {required: false, message: 'Please enter the camera password'}
              ]
            })(
              <Input type='password' placeholder='Enter camera password'/>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class AddCameraModal extends Component {
  state = {
    fullRtspUrl: null
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.addCameraGroupCameraSuccess && this.props.addCameraGroupCameraSuccess !== nextProps.addCameraGroupCameraSuccess) {
      this.resetFields();
      this.props.toggleAddCameraModalVisibility();
    }
    if (nextProps.addCameraGroupCameraError !== '' && this.props.addCameraGroupCameraError !== nextProps.addCameraGroupCameraError) {
      message.error(nextProps.addCameraGroupCameraError);
    }
    if(nextProps.addedCameraData !== '' && nextProps.addedCameraData !== this.props.addedCameraData) {
      this.props.registerCamera(this.props.user.id, nextProps.addedCameraData.data.data);
    }
    if(nextProps.bvcCameraConnectionFail && nextProps.bvcCameraConnectionFail !== this.props.bvcCameraConnectionFail){
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
    form.validateFields((err, values) => {
      if (err) return;
      this.setState({fullRtspUrl: null}, () => {
        this.props.addCameraGroupCamera(this.props.user,
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
    let isChrome = !!window.chrome && !!window.chrome.webstore;
    let isFirefox = typeof InstallTrigger !== 'undefined';
    let isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    if (!isChrome && !isFirefox && !isOpera) {
      alert('Sorry, live video requires the desktop Chrome, Firefox, or Opera web browser.');
    } else {
      const form = this.form;
      form.validateFields(['rtspUrl', 'username', 'password'], (err, values) => {
        if (err) return;
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
          ref={this.saveFormRef}
          visible={this.props.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          testLiveView={this.testLiveView}
          fullRtspUrl={this.state.fullRtspUrl}
          addCameraGroupCameraError={this.props.addCameraGroupCameraError}
          addCameraGroupCameraInProcess={this.props.addCameraGroupCameraInProcess}
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
    addCameraGroupCameraError: state.cameraGroups.addCameraGroupCameraError,
    addCameraGroupCameraSuccess: state.cameraGroups.addCameraGroupCameraSuccess,
    addCameraGroupCameraInProcess: state.cameraGroups.addCameraGroupCameraInProcess,
    addedCameraData: state.cameraGroups.addedCameraData,
    bvcCameraConnection: state.cameraGroups.bvcCameraConnection,
    bvcCameraConnectionFail: state.cameraGroups.bvcCameraConnectionFail
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addCameraGroupCamera: (user, cameraGroup, name, rtspUrl, username, password) => dispatch(addCameraGroupCamera(user, cameraGroup, name, rtspUrl, username, password)),
    registerCamera: (userId, cameraDetails) => dispatch(registerCamera(userId, cameraDetails)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCameraModal);
