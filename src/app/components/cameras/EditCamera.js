import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Icon, Modal, Form, Input, Button, message, TimePicker, Select, Popconfirm } from 'antd';
import moment from 'moment';

import { editCamera, updateTimeWindowData, clearTimeWindowData } from '../../redux/cameras/actions'
import loading from '../../../assets/img/TempCameraImage.jpeg'

const Option = Select.Option;
const FormItem = Form.Item;
const CameraLicensesForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, form, cameraData, updateDataStart, updateDataStop, updateDataDaysOfWeek, changeTimeWindow, resetData, checkForWindow} = props;
    const {getFieldDecorator} = form;
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
             okText='Save'
             cancelText='Cancel'
      >
        <Form>
          <FormItem>
            {cameraData.image.original ?
              <img src={cameraData.image.original} style={styles.image} /> :
              <img src={loading} style={styles.image} />
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
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                <Option value="UTC">Universal Coordinated Time (UTC)</Option>
                <Option value="ECT">European Central Time (UTC+1:00)</Option>
                <Option value="EET">Eastern European Time (UTC+2:00)</Option>
                <Option value="EAT">Eastern African Time (UTC+3:00)</Option>
                <Option value="MET">Middle East Time (UTC+3:30)</Option>
                <Option value="NET">Near East Time (UTC+4:00)</Option>
                <Option value="PLT">Pakistan Lahore Time (UTC+5:00)</Option>
                <Option value="IST">India Standard Time (UTC:5:30)</Option>
                <Option value="BST">Bangladesh Standard Time (UTC+6:00)</Option>
                <Option value="VST">Vietnam Standard Time (UTC+7:00)</Option>
                <Option value="CTT">China Taiwan Time (UTC+8:00)</Option>
                <Option value="JST">Japan Standard Time (UTC+9:00)</Option>
                <Option value="ACT">Australia Central Time (UTC+9:30)</Option>
                <Option value="AET">Australia Eastern Time (UTC+10:00)</Option>
                <Option value="SST">Solomon Standard Time (UTC+11:00)</Option>
                <Option value="NST">New Zealand Standard Time</Option>
                <Option value="MIT">Midway Islands Time (UTC+12:00)</Option>
                <Option value="HST">Hawaii Standard Time (UTC-11:00)</Option>
                <Option value="AST">Alaska Standard Time (UTC-10:00)</Option>
                <Option value="PST">Pacific Standard Time (UTC-9:00)</Option>
                <Option value="MST">Mountain Standard Time (UTC-7:00)</Option>
                <Option value="CST">Central Standard Time (UTC-6:00)</Option>
                <Option value="EST">Eastern Standard Time (UTC-5:00)</Option>
                <Option value="PRT">Puerto Rico and US Virgin Islands Time (UTC-4:00)</Option>
                <Option value="CNT">Canada Newfoundland Time (UTC-3:30)</Option>
                <Option value="AGT">Argentina Standard Time (UTC-3:00)</Option>
                <Option value="CAT">Central African Time (UTC-1:00)</Option>
              </Select>
            )}
          </FormItem>
          <div style={styles.borderBox}>
            <FormItem label="Alert Time Windows" {...formItemLayout}>
              {getFieldDecorator('time_window_select', {})(
                <Select
                  placeholder="Select Time Window"
                  style={styles.alertTimeWindowSelect}
                  onChange={changeTimeWindow}
                  >
                  <Option value={0}>First</Option>
                  <Option value={1}>Second</Option>
                  <Option value={2}>Third</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="Select Alert Days">
              {getFieldDecorator('days_of_week', {})(
                <Select
                  mode="multiple"
                  onChange={updateDataDaysOfWeek}
                  onBlur={checkForWindow}
                  placeholder="Select Alert Days"
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
              <label>Set Alert Time Window</label>
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
                    format={'HH:mm'} />
                )}</FormItem>
            </Row>
            <Row>
              <Button type="danger" icon="close" onClick={resetData}>Clear Current Alert Time Form</Button>
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
    }
  }

  showModal = () => {
    this.setState({visible: true});
  };
  handleCancel = () => {
    this.setState({visible: false});
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
      values.alert_windows = this.props.alert_windows;
      values.location_id = this.props.data.cameraLocation.id;
      values.rtsp_url = this.props.data.rtspUrl;
      this.props.editCamera(this.props.user, this.props.data.id, values);
      this.setState({visible: true});
      this.setState({flag: true});
    });
  };

  handleChangeTimeWindow = (fieldValue) => {
    let alertTimeWindow = this.props.alert_windows[fieldValue];
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
      this.props.updateTimeWindowData(timeWindowSelect, this.props.alert_windows, moment(fieldValue).format('HH:mm').toString(), 'start');
    }
  }

  handleUpdateStop = (fieldValue) => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      let startTime = this.props.alert_windows[timeWindowSelect].start;
      if (startTime !== null) {
        if (moment(startTime, 'HH:mm').isBefore(fieldValue, 'minute')) {
          this.props.updateTimeWindowData(timeWindowSelect, this.props.alert_windows, moment(fieldValue).format('HH:mm').toString(), 'stop');
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
      this.props.updateTimeWindowData(timeWindowSelect, this.props.alert_windows, fieldValue, 'daysOfWeek');
    }
  }

  handleResetData = () => {
    this.form.resetFields('days_of_week');
    this.form.setFieldsValue({start: null});
    this.form.setFieldsValue({stop: null});
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      this.props.clearTimeWindowData(timeWindowSelect, this.props.alert_windows);
    }
  }

  handleCheckForWindow = () => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect == 'undefined') {
      message.error('Please select which Alert Time Window you want to store this in. Your changes will not be saved!');
      this.handleResetData();
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
          message.success("Camera Updated");
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
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          resetData={this.handleResetData}
          changeTimeWindow={this.handleChangeTimeWindow}
          updateDataStart={this.handleUpdateStart}
          updateDataStop={this.handleUpdateStop}
          checkForWindow={this.handleCheckForWindow}
          updateDataDaysOfWeek={this.handleUpdateDaysOfWeek}
          error={this.state.error}
          cameraData={this.props.data}
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
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    editCameraInProcess: state.cameras.editCameraInProcess,
    editCameraError: state.cameras.editCameraError,
    editCameraSuccess: state.cameras.editCameraSuccess,
    alert_windows: state.cameras.alert_windows
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
