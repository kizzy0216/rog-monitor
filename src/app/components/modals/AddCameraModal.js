import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, Icon, message } from 'antd';

import { addCamera } from '../../redux/cameras/actions';

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
        confirmLoading={props.addCameraInProcess}
      >
        <Form>
          {/*}<FormItem style={styles.videoContainer}>
            {props.fullRtspUrl ?
              (<RtspStream rtspUrl={props.fullRtspUrl} />) :
              (
                <p style={styles.videoContainerText}>
                  {props.addCameraInProcess ? 'Adding camera' : 'No Video Available'}
                </p>
              )
            }
          </FormItem>
          <FormItem hasFeedback>
            <Button key='submit' type='primary' size='large' onClick={props.testLiveView}>
              <Icon type='reload'></Icon>Test Live View
            </Button>
            <div style={styles.error}>{props.addCameraError}</div>
          </FormItem>*/}
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
                {
                  required: true,
                  pattern: new RegExp("^(rtsp:\/\/)+(?!.+@+.+:)"),
                  message: "Please enter an RTSP URL without embedded credentials."
                }
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
    form.validateFields((err, values) => {
      if (err) return;
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
