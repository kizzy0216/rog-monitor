import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Icon, Modal, Form, Input, Button, message, TimePicker, Select } from 'antd';
import moment from 'moment-timezone';

import { editCamera } from '../../redux/cameras/actions';
import loading from '../../../assets/img/TempCameraImage.jpeg';
import RtspStream from '../video/RtspStream';

const Option = Select.Option;
const FormItem = Form.Item;
const CameraForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, form, cameraData, updateTimeZone, createSelectItems} = props;
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
          <FormItem style={styles.videoContainer}>
            {props.fullRtspUrl ?
              (<RtspStream rtspUrl={props.fullRtspUrl} />) :
              (
                <p style={styles.videoContainerText}>No Video Available</p>
              )
            }
          </FormItem>
          <FormItem label='Camera Name' {...formItemLayout}>
            {getFieldDecorator('name', {
              'initialValue': cameraData.name
            })(
              <Input style={styles.input} type='text' placeholder="Camera Name" />
            )}
          </FormItem>
          <FormItem label='URL' {...formItemLayout}>
            {getFieldDecorator('rtsp_url', {
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
      fullRtspUrl: null
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
      values.cameraGroup_id = this.props.data.cameraGroup.id;
      values.rtsp_url = this.props.data.rtspUrl.trim();
      this.props.editCamera(this.props.user, this.props.data.id, values);
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
      form.validateFields(['rtsp_url', 'username', 'password'], (err, values) => {
        if (err) return;
        this.setState({fullRtspUrl: null}, () => {
          this.setState({fullRtspUrl: this.getFullRtspUrl(values.rtsp_url, values.username, values.password)});
        });
      })
    }
  }

  componentWillReceiveProps(nextProps){
    if (this.props.data.id === nextProps.data.id) {
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
          testLiveView={this.testLiveView}
          fullRtspUrl={this.props.data.reco_camera_url}
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
