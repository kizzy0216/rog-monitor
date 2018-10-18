import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Icon, Modal, Form, Input, Button, message, TimePicker, Select } from 'antd';
import moment from 'moment-timezone';

import { editCamera, updateTimeWindowData, clearTimeWindowData } from '../../redux/cameras/actions';
import loading from '../../../assets/img/TempCameraImage.jpeg';
import RtspStream from '../video/RtspStream';

const Option = Select.Option;
const FormItem = Form.Item;
const CameraLicensesForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, form, cameraData, updateDataStart, updateDataStop, updateDataDaysOfWeek, changeTimeWindow, resetData, checkForWindow, updateTimeZone, time_zone, createSelectItems} = props;
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
          <FormItem>
            <Button key='submit' type='primary' size='large' onClick={props.testLiveView}>
              <Icon type='reload'></Icon>Test Live View
            </Button>
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
              'initialValue': cameraData.rtspUrl
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
          <div style={styles.borderBox}>
            <div className="ant-form-item-label">
              <label>Set Custom Alert Silence Windows</label>
            </div>
            <FormItem label="Custom Time Window" {...formItemLayout}>
              {getFieldDecorator('time_window_select', {})(
                <Select
                  placeholder="Select Time Window"
                  style={styles.alertTimeWindowSelect}
                  onChange={changeTimeWindow}
                  >
                  <Option value={0}>Window 1</Option>
                  <Option value={1}>Window 2</Option>
                  <Option value={2}>Window 3</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="Select Alert Days">
              {getFieldDecorator('days_of_week', {})(
                <Select
                  mode="multiple"
                  onChange={updateDataDaysOfWeek}
                  onBlur={checkForWindow}
                  placeholder="Select Days"
                  style={styles.dayPicker}
                >
                  <Option key="monday" value="monday">Monday</Option>
                  <Option key="tuesday" value="tuesday">Tuesday</Option>
                  <Option key="wednesday" value="wednesday">Wednesday</Option>
                  <Option key="thursday" value="thursday">Thursday</Option>
                  <Option key="friday" value="friday">Friday</Option>
                  <Option key="saturday" value="saturday">Saturday</Option>
                  <Option key="sunday" value="sunday">Sunday</Option>
                </Select>
              )}
            </FormItem>
            <div span={24} className="ant-form-item-label">
              <label>Set Time Window {time_zone ? "("+time_zone+")" : ''}</label>
            </div>
            <Row>
              <FormItem span={12} style={{float: 'left', width: '50%'}}>
                {getFieldDecorator('start', {})(
                  <TimePicker
                    span={8}
                    style={{margin: '0 auto'}}
                    onChange={updateDataStart}
                    onOpenChange={(open: false), checkForWindow}
                    defaultOpenValue={moment('00:00', 'HH:mm')}
                    allowEmpty={true}
                    placeholder="Start Time"
                    format={'HH:mm'} />
                )}
              </FormItem>
              <FormItem span={12} style={{float: 'right', width: '50%'}}>
                {getFieldDecorator('stop', {})(
                  <TimePicker
                    span={8}
                    style={{margin: '0 auto'}}
                    onChange={updateDataStop}
                    onOpenChange={(open: false), checkForWindow}
                    defaultOpenValue={moment('00:00', 'HH:mm')}
                    allowEmpty={true}
                    placeholder="End Time"
                    format={'HH:mm'} />
                )}</FormItem>
            </Row>
            <Row>
              <Button type="danger" icon="close" onClick={resetData}>Clear Silence Window</Button>
            </Row>
            <div>&nbsp;</div>
          </div>
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
      delete values.start;
      delete values.stop;
      delete values.days_of_week;
      delete values.time_window_select;
      values.alert_windows = this.props.data.alert_windows;
      values.location_id = this.props.data.cameraLocation.id;
      values.rtsp_url = this.props.data.rtspUrl.trim();
      this.props.editCamera(this.props.user, this.props.data.id, values);
      this.setState({visible: false});
      this.setState({flag: true});
      this.setState({fullRtspUrl: null});
    });
  };

  handleUpdateTimeZone = (fieldValue) => {
    this.setState({time_zone: fieldValue});
  }

  handleChangeTimeWindow = (fieldValue) => {
    let alertTimeWindow = this.props.data.alert_windows[fieldValue];
    let start = alertTimeWindow.start;
    let stop = alertTimeWindow.stop;
    if (start !== null) {
      start = moment(alertTimeWindow.start, "HH:mm");
    }
    if (stop !== null) {
      stop = moment(alertTimeWindow.stop, "HH:mm");
    }

    this.form.setFieldsValue({days_of_week: alertTimeWindow.daysOfWeek});
    this.form.setFieldsValue({start: start});
    this.form.setFieldsValue({stop: stop});
  }

  handleUpdateStart = (fieldValue) => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      this.props.updateTimeWindowData(timeWindowSelect, this.props.data.alert_windows, moment(fieldValue).format('HH:mm').toString(), 'start');
    }
  }

  handleUpdateStop = (fieldValue) => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      let startTime = this.props.data.alert_windows[timeWindowSelect].start;
      if (startTime !== null) {
        if (moment(startTime, 'HH:mm').isBefore(fieldValue, 'minute')) {
          this.props.updateTimeWindowData(timeWindowSelect, this.props.data.alert_windows, moment(fieldValue).format('HH:mm').toString(), 'stop');
        } else {
          message.error('Please select a time that is after the start time.');
        }
      } else {
        message.error('Please select a start time before selecting a stop time.');
      }
    }
  }

  handleUpdateDaysOfWeek = (fieldValue) => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      this.props.updateTimeWindowData(timeWindowSelect, this.props.data.alert_windows, fieldValue, 'daysOfWeek');
    }
  }

  handleResetData = () => {
    this.form.resetFields('days_of_week');
    this.form.setFieldsValue({start: null});
    this.form.setFieldsValue({stop: null});
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      this.props.clearTimeWindowData(timeWindowSelect, this.props.data.alert_windows);
    }
  }

  handleCheckForWindow = () => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    let daysOfWeek = this.form.getFieldProps('days_of_week').value;
    if (typeof timeWindowSelect == 'undefined') {
      message.error('Please select which Alert Time Window you want to store this in. Your changes will not be saved!');
      this.handleResetData();
    } else if (daysOfWeek === undefined || daysOfWeek.length == 0) {
      message.error('Please select the days you would like the alert time to be active. Your changes will not be saved!');
      this.handleResetData();
    }
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
        <CameraLicensesForm
          ref={(form) => this.form = form}
          visible={this.state.visible}
          time_zone={this.state.time_zone}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          resetData={this.handleResetData}
          changeTimeWindow={this.handleChangeTimeWindow}
          updateDataStart={this.handleUpdateStart}
          updateDataStop={this.handleUpdateStop}
          checkForWindow={this.handleCheckForWindow}
          updateDataDaysOfWeek={this.handleUpdateDaysOfWeek}
          createSelectItems={this.handleCreateSelectItems}
          updateTimeZone={this.handleUpdateTimeZone}
          error={this.state.error}
          cameraData={this.props.data}
          testLiveView={this.testLiveView}
          fullRtspUrl={this.state.fullRtspUrl}
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
  borderBox: {
    border: 'solid 1px #bfbfbf'
  },
  dayPicker: {
    width: '80%',
  },
  alertTimeWindowSelect: {
    width: '60%'
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
    editCamera: (user, camera, cameraData) => dispatch(editCamera(user, camera, cameraData)),
    updateTimeWindowData: (timeWindowSelect, values, fieldValue, fieldName) => dispatch(updateTimeWindowData(timeWindowSelect, values, fieldValue, fieldName)),
    clearTimeWindowData: (timeWindowSelect, values) => dispatch(clearTimeWindowData(timeWindowSelect, values))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCamera);
