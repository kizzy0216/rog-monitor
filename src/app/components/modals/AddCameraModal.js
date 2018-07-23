import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, Icon, message } from 'antd';

import RtspStream from '../video/RtspStream';

import { addLocationCamera } from '../../redux/locations/actions';
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
        confirmLoading={props.addLocationCameraInProcess}
      >
        <Form>
          <FormItem style={styles.videoContainer}>
            {props.fullRtspUrl ?
              (<RtspStream rtspUrl={props.fullRtspUrl} />) :
              (
                <p style={styles.videoContainerText}>
                  {props.addLocationCameraInProcess ? 'Adding camera' : 'No Video Available'}
                </p>
              )
            }
          </FormItem>
          <FormItem hasFeedback>
            <Button key='submit' type='primary' size='large' onClick={props.testLiveView}>
              <Icon type='reload'></Icon>Test Live View
            </Button>
            <div style={styles.error}>{props.addLocationCameraError}</div>
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
    if (nextProps.addLocationCameraSuccess && this.props.addLocationCameraSuccess !== nextProps.addLocationCameraSuccess) {
      this.resetFields();
      this.props.toggleAddCameraModalVisibility();
    }
    if (nextProps.addLocationCameraError !== '' && this.props.addLocationCameraError !== nextProps.addLocationCameraError) {
      message.error(nextProps.addLocationCameraError);
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
        this.props.addLocationCamera(this.props.user,
                                     this.props.selectedLocation,
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
          addLocationCameraError={this.props.addLocationCameraError}
          addLocationCameraInProcess={this.props.addLocationCameraInProcess}
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
    addLocationCameraError: state.locations.addLocationCameraError,
    addLocationCameraSuccess: state.locations.addLocationCameraSuccess,
    addLocationCameraInProcess: state.locations.addLocationCameraInProcess,
    addedCameraData: state.locations.addedCameraData,
    bvcCameraConnection: state.locations.bvcCameraConnection,
    bvcCameraConnectionFail: state.locations.bvcCameraConnectionFail
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addLocationCamera: (user, location, name, rtspUrl, username, password) => dispatch(addLocationCamera(user, location, name, rtspUrl, username, password)),
    registerCamera: (userId, cameraDetails) => dispatch(registerCamera(userId, cameraDetails)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCameraModal);
