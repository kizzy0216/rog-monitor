import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Icon, Modal, Form, Spin, Button, Popover, message, Slider, Row, Col, TimePicker, Select} from 'antd';
import CustomCanvas from '../../components/formitems/CustomCanvas';
import CustomInput from "../formitems/CustomInput";
import {createTrigger, fetchTriggers, deleteTrigger, updateTimeWindowData, clearTimeWindowData, addNewTriggerTimeWindow, getTriggerSpecificTimeWindows, setTriggerSpecificTimeWindows, createTriggerTimeWindow, updateTriggerTimeWindow, deleteTriggerTimeWindow} from '../../redux/triggers/actions';
import {connect} from 'react-redux';
import {isEmpty} from '../../redux/helperFunctions';
import moment from 'moment';
import loading from '../../../assets/img/TempCameraImage.jpeg';

const Option = Select.Option;
const FormItem = Form.Item;
const AddTriggerForm = Form.create()(
  (props) => {
    const {
      onCancel, triggers, sliderValue, loiteringSeconds, deleteStatus, deleteButton, triggerInProcess, triggerExtras, deleteTrigger, visible, saveCancel, form, cameraName, triggerPointDirection, handleSaveCancel, triggerImg, handleVisibility, visibility, showTrigger, canvasMode, onImgLoad, imageDimensions, convertToMilitaryFormat, currentTriggerDetails, direction, fetchTriggerInProcess, newLoiteringTrigger, updateDataStart, updateDataStop, updateDataDaysOfWeek, changeTimeWindow, resetData, checkForWindow, time_zone, saveData, timeWindows, cameraGroupOwner, showShareOption, addNewTimeWindow, getTriggerSpecificTimeWindows, setTriggerTimeWindows, deleteTriggerTimeWindow
    } = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {
        xs: {span: 8},
      },
      wrapperCol: {
        xs: {span: 16},
      },
    };

    return (
      <Modal title={`${cameraName} Trigger Settings`}
             visible={visible}
             style={styles.modal}
             onCancel={onCancel}
             footer={[null, null]}
             width="50%"
      >
        <Form>
          <FormItem style={styles.triggersHideShow}>
            {triggerImg === null ?
              <img src={loading} style={styles.image} onLoad={onImgLoad} onReset={onImgLoad} />:
              <img src={triggerImg} style={styles.image} onLoad={onImgLoad} onReset={onImgLoad} />
            }
            {canvasMode && imageDimensions &&
              <CustomCanvas width={imageDimensions.width} height={imageDimensions.height}
                          triggerPointDirection={triggerPointDirection}
                          getTriggers={triggers} direction={direction} triggerExtras={triggerExtras}
                          triggerType={currentTriggerDetails.currentTriggerType} setTriggerTimeWindows={setTriggerTimeWindows} />
            }
            {canvasMode && (currentTriggerDetails.currentTriggerType === 'LD') &&
              <Row>
                <Col span={4} style={styles.LDtimeLeft}>
                  {convertToMilitaryFormat(loiteringSeconds)}
                </Col>
                <Col span={16}>
                  {newLoiteringTrigger === true ?
                    <Slider tipFormatter={(value) => convertToMilitaryFormat(loiteringSeconds)} min={0} max={1800}
                          step={1} onChange={sliderValue} value={loiteringSeconds}/>
                    :
                    <Slider tipFormatter={(value) => convertToMilitaryFormat(loiteringSeconds)} min={0} max={1800}
                            step={1} onChange={sliderValue} value={loiteringSeconds} disabled />
                    }
                </Col>
                <Col span={4}>
                  <p style={styles.LDtimeRight}>30:00 Min</p>
                </Col>
              </Row>
            }
            {deleteButton && canvasMode &&
              <div>
                <div>
                  <span style={styles.currenttriggerDetails}>
                    Trigger Type: {(currentTriggerDetails.currentTriggerType === 'RA') ? 'Restricted Area' : ((currentTriggerDetails.currentTriggerType === 'LD') ? 'Loitering Detection' : 'Virtual Wall')}
                  </span>
                  <Button style={styles.deleteButton} onClick={deleteTrigger} loading={deleteStatus}>
                    Delete
                  </Button>
                </div>
                <div>&nbsp;</div>
                <div style={styles.borderBox}>
                  <div className="ant-form-item-label">
                    <label>Trigger Silence Windows</label>
                  </div>
                  <FormItem label="Select Silence Window" {...formItemLayout}>
                    <div>
                      {getFieldDecorator('time_window_select', {})(
                        <Select
                          placeholder="Select Silence Window"
                          style={styles.triggerTimeWindowSelect}
                          onChange={changeTimeWindow}
                          notFoundContent="Click/Tap the plus button to add a silence window."
                        >
                        {timeWindows.map((timeWindow, key) => {
                          return <Option key={key} value={key}>Time Window: {key + 1}</Option>;
                        })}
                        </Select>
                      )}
                      <Button type="primary" icon="plus" onClick={addNewTimeWindow}></Button>
                    </div>
                  </FormItem>
                  {cameraGroupOwner && showShareOption &&
                    <FormItem label="Make Private or Shared" {...formItemLayout}>
                      {getFieldDecorator('shared', {})(
                        <Select
                          placeholder="Shared or Private"
                          initialValue={false}
                          style={styles.triggerTimeWindowSelect}
                        >
                          <Option key={0}>Private</Option>
                          <Option key={1}>Shared</Option>
                        </Select>
                      )}
                    </FormItem>
                  }
                  <FormItem label="Select Silence Window Days">
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
                    <label>Set Silence Window Time {time_zone ? "("+time_zone+")" : ''}</label>
                  </div>
                  <Row>
                    <FormItem span={12} style={{float: 'left', width: '50%'}}>
                      {getFieldDecorator('start_at', {})(
                        <TimePicker
                          span={8}
                          style={{margin: '0 auto'}}
                          onChange={updateDataStart}
                          onOpenChange={(open: false), checkForWindow}
                          defaultOpenValue={moment('00:00', 'HH:mm')}
                          allowClear={true}
                          placeholder="Start Time"
                          format={'HH:mm'} />
                      )}
                    </FormItem>
                    <FormItem span={12} style={{float: 'right', width: '50%'}}>
                      {getFieldDecorator('end_at', {})(
                        <TimePicker
                          span={8}
                          style={{margin: '0 auto'}}
                          onChange={updateDataStop}
                          onOpenChange={(open: false), checkForWindow}
                          defaultOpenValue={moment('00:00', 'HH:mm')}
                          allowClear={true}
                          placeholder="End Time"
                          format={'HH:mm'} />
                      )}
                    </FormItem>
                  </Row>
                  <Row>
                  <Col span={8}>
                    <Button type="danger" icon="delete" onClick={deleteTriggerTimeWindow}>Delete Silence Window</Button>
                  </Col>
                    <Col span={8}>
                      <Button type="danger" icon="close" onClick={resetData}>Clear Form</Button>
                    </Col>
                    <Col span={8}>
                      <Button type="primary" icon="save" onClick={saveData}>Save Silence Window</Button>
                    </Col>
                  </Row>
                  <div>&nbsp;</div>
                </div>
              </div>
            }
          </FormItem>
          <FormItem>
            <Popover
              title='Select Trigger Type to Add'
              content={
                <div style={styles.triggerType}>
                  <a onClick={() => showTrigger('RA')}>Restricted Area</a>
                  <br/>
                  <a onClick={() => showTrigger('VW')}>Virtual Wall</a>
                  <br/>
                  <a onClick={() => showTrigger('LD')}>Loitering</a>
                  <br/>
                </div>
              }
              trigger="click"
              visible={visibility}
              onVisibleChange={handleVisibility}
            >
              {!saveCancel &&
                <a>
                  <CustomInput trigger={true} visibility={visibility} handleSaveCancel={handleSaveCancel} fetchTriggerInProcess={fetchTriggerInProcess}/>
                </a>
              }
            </Popover>
          </FormItem>
          <FormItem>
            {saveCancel &&
              <div>
                <div>
                  <div style={styles.borderBox}>
                    <div className="ant-form-item-label">
                      <label>Trigger Silence Windows</label>
                    </div>
                    <FormItem label="Select Silence Window" {...formItemLayout}>
                    <div>
                      {getFieldDecorator('time_window_select', {})(
                        <Select
                          placeholder="Select Silence Window"
                          style={styles.triggerTimeWindowSelect}
                          onChange={changeTimeWindow}
                        >
                        {timeWindows.map((polygon, key) => {
                          return <Option key={key} value={key}>Time Window: {key + 1}</Option>;
                        })}
                        </Select>
                      )}
                      <Button type="primary" icon="plus" onClick={addNewTimeWindow}></Button>
                    </div>
                    </FormItem>
                    {cameraGroupOwner &&
                      <FormItem label="Make Private or Shared" {...formItemLayout}>
                        {getFieldDecorator('shared', {})(
                          <Select
                            placeholder="Shared or Private"
                            initialValue={false}
                            style={styles.triggerTimeWindowSelect}
                          >
                            <Option key={0}>Private</Option>
                            <Option key={1}>Shared</Option>
                          </Select>
                        )}
                      </FormItem>
                    }
                    <FormItem label="Select Silence Window Days">
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
                      <label>Set Silence Window Time {time_zone ? "("+time_zone+")" : ''}</label>
                    </div>
                    <Row>
                      <FormItem span={12} style={{float: 'left', width: '50%'}}>
                        {getFieldDecorator('start_at', {})(
                          <TimePicker
                            span={8}
                            style={{margin: '0 auto'}}
                            onChange={updateDataStart}
                            onOpenChange={(open: false), checkForWindow}
                            defaultOpenValue={moment('00:00', 'HH:mm')}
                            allowClear={true}
                            placeholder="Start Time"
                            format={'HH:mm'} />
                        )}
                      </FormItem>
                      <FormItem span={12} style={{float: 'right', width: '50%'}}>
                        {getFieldDecorator('end_at', {})(
                          <TimePicker
                            span={8}
                            style={{margin: '0 auto'}}
                            onChange={updateDataStop}
                            onOpenChange={(open: false), checkForWindow}
                            defaultOpenValue={moment('00:00', 'HH:mm')}
                            allowClear={true}
                            placeholder="End Time"
                            format={'HH:mm'} />
                        )}
                      </FormItem>
                    </Row>
                    <Row>
                      <Button type="danger" icon="close" onClick={resetData}>Clear Silence Window</Button>
                    </Row>
                    <div>&nbsp;</div>
                  </div>
                </div>
                <Button key='add_trigger' onClick={() => handleSaveCancel('save')} loading={triggerInProcess}
                        style={styles.saveBtn} size='small'>
                  Save
                </Button>
                <Button key='cancel' onClick={() => handleSaveCancel('cancel')} style={styles.cancelBtn} size='small'>
                  Cancel
                </Button>
              </div>
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class AddTriggerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: false,
      visibility: false,
      canvasMode: true,
      imageDimensions: false,
      saveCancel: false,
      triggers: false,
      deleteButton: false,
      loiteringSeconds: 0,
      triggerType: '',
      newLoiteringTrigger: false,
      time_zone: this.props.data.time_zone,
      cameraGroupOwner: false,
      showShareOption: false,
      image: null
    }

    this.onImgLoad = this.onImgLoad.bind(this);
    this.triggerPointDirection = this.triggerPointDirection.bind(this);
    this.triggerExtras = this.triggerExtras.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.polygonData !== undefined && !isEmpty(this.props.polygonData)) {
      if (nextProps.fetchTriggerSuccess === true && !isEmpty(nextProps.polygonData)) {
        this.setState({canvasMode: true});
        if (this.triggerDetails.currentTriggerId !== null) {
          this.setTriggerTimeWindows(nextProps.polygonData, this.triggerDetails.currentTriggerId);
        }
      }
      if (nextProps.createTriggerSuccess !== this.props.createTriggerSuccess && this.triggerDetails['id'] !== undefined) {
        this.setState({canvasMode: false});
        this.setState({triggers: true});
        this.setState({deleteButton: false});
        this.props.fetchTriggers(this.props.data.user, this.props.data.cameraGroup, this.triggerDetails['id']);
        this.triggerDetails['id'] = undefined;
        this.setState({saveCancel: false});
      }
      if (nextProps.deleteTriggerSuccess !== this.props.deleteTriggerSuccess && this.triggerDetails['id'] !== undefined) {
        this.setState({canvasMode: false});
        this.props.fetchTriggers(this.props.data.user, this.props.data.cameraGroup, this.triggerDetails['id']);
        this.triggerDetails['id'] = undefined;
        this.setState({deleteButton: false});
        this.setState({saveCancel: false});
      }
    }
    else if (this.props.polygonData !== nextProps.polygonData && !isEmpty(nextProps.polygonData) && !isEmpty(this.props.polygonData)) {
      this.setState({canvasMode: true});
    }
    for (var i = 0; i < this.props.data.cameraGroup.userCameraGroupPrivileges.length; i++) {
      if (nextProps.data.cameraGroup.userCameraGroupPrivileges[i].users_id === nextProps.data.user.id) {
        if (nextProps.data.cameraGroup.userCameraGroupPrivileges[i].user_privileges_ids.includes(0)) {
          this.setState({cameraGroupOwner: true});
        }
      }
    }
    for (var i = 0; i < nextProps.data.cameraGroup.cameras.length; i++) {
      if (nextProps.data.id == nextProps.data.cameraGroup.cameras[i].id) {
        this.setState({image: nextProps.data.cameraGroup.cameras[i].thumbnail_url});
      }
    }
  }

  triggerDetails = {
    currentTriggerId: null,
    currentTriggerType: '',
    polygonPoints: [],
    direction: ''
  };

  sliderValue = (value) => {

    this.setState({
      loiteringSeconds: value,
    });
  }

  triggerExtras(id, type, duration) {
    this.triggerDetails.currentTriggerId = id;
    this.triggerDetails.currentTriggerType = type;
    this.setState({loiteringSeconds: duration});
    this.setState({deleteButton: true});
  }

  triggerPointDirection(points, direction) {
    this.triggerDetails.polygonPoints.push(points);
    switch (direction) {
      case 'right':
        direction = 'R';
        break;
      case 'left':
        direction = 'L';
        break;
      case 'rightLeft':
        direction = 'B';
        break;
    }

    this.triggerDetails.direction = direction;
  }

  onImgLoad({target: img}) {
    this.setState({
      imageDimensions: {
        height: img.offsetHeight,
        width: img.offsetWidth
      }
    });
  }

  showModal = () => {
    if (typeof window.orientation !== 'undefined') {
      trigger('Sorry, trigger creation not currently supported on mobile devices.');
    } else {
      this.setState({visible: true});
      this.triggerDetails['id'] = this.props.data.id;
      this.setState({saveCancel: false});
      this.setState({canvasMode: false});
      this.triggerDetails.currentTriggerId = null;
      this.fetchTriggers(true);
    }
  };

  handleCancel = () => {
    this.setState({canvasMode: false});
    this.setState({visible: false});
    this.triggerDetails.currentTriggerType = '';
    this.triggerDetails.currentTriggerId = null;
  };

  handleVisibleChange = (visibility) => {
    if (visibility === true) {
      this.triggerDetails.currentTriggerId = null;
      this.setState({visibility});
      this.setState({canvasMode: false});
      this.setState({triggers: false});
      this.setState({deleteButton: false});
      this.triggerDetails.currentTriggerType = '';
    } else {
      this.triggerDetails.currentTriggerId = null;
      this.setState({deleteButton: false});
      this.setState({visibility});
      this.setState({canvasMode: false});
      this.setState({triggers: true});
      this.setState({cameraGroupOwner: false});
      this.setState({showShareOption: false});
      this.triggerDetails.currentTriggerType = '';
    }
  };

  showTrigger = (event) => {
    switch (event) {
      case 'RA':
        this.setState({canvasMode: true});
        this.setState({visibility: !this.state.visibility});
        this.setState({saveCancel: !this.state.saveCancel});
        this.setState({triggerType: 'RA'});
        this.triggerDetails.currentTriggerType = 'RA';
        break;

      case 'LD':
        this.setState({canvasMode: true});
        this.setState({visibility: !this.state.visibility});
        this.setState({saveCancel: !this.state.saveCancel});
        this.triggerDetails.currentTriggerType = 'LD';
        this.setState({triggerType: 'LD'});
        this.setState({newLoiteringTrigger: true});
        this.setState({loiteringSeconds: 0});
        break;

      case 'VW':
        this.setState({canvasMode: true});
        this.setState({visibility: !this.state.visibility});
        this.setState({saveCancel: !this.state.saveCancel});
        this.triggerDetails.currentTriggerType = 'VW';
        this.setState({triggerType: 'VW'});
        break;

    }
  };

  handleSaveCancel = (event) => {
    if (event === 'cancel') {
      this.setState({saveCancel: false});
      this.setState({canvasMode: false});
      this.triggerDetails.currentTriggerType = '';
    }
    if (event === 'save') {
      if (this.triggerDetails.polygonPoints.length !== 0) {
        this.triggerDetails.currentTriggerType = '';
        this.triggerDetails['id'] = this.props.data.id;
        this.form.validateFields((err, values) => {
          if (err) {
            return;
          }
          delete values.start_at;
          delete values.end_at;
          delete values.days_of_week;
          delete values.time_window_select;
          values.trigger_windows = [];
          this.props.triggerTimeWindows.forEach(function(trigger_window) {
            if (trigger_window.hasOwnProperty('start_at') && trigger_window.hasOwnProperty('end_at') && trigger_window.hasOwnProperty('days_of_week')) {
              values.trigger_windows.push(trigger_window);
            }
          });
          if (this.state.cameraGroupOwner == false || typeof values.shared == 'undefined') {
            values.shared = false;
          } else if (values.shared == 0) {
            values.shared = false;
          } else if (values.shared == 1) {
            values.shared = true;
          }
          switch (this.state.triggerType) {
            case 'RA':
              this.props.createTrigger(this.props.data.user, this.triggerDetails.polygonPoints[0], this.state.triggerType, this.props.data.cameraGroup, this.triggerDetails['id'], null, null, values.trigger_windows, values.shared);
              break;

            case 'LD':
              this.props.createTrigger(this.props.data.user, this.triggerDetails.polygonPoints[0], this.state.triggerType, this.props.data.cameraGroup, this.triggerDetails['id'], this.state.loiteringSeconds, null, values.trigger_windows, values.shared);
              this.setState({loiteringSeconds: 0});
              break;

            case 'VW':
              this.props.createTrigger(this.props.data.user, this.triggerDetails.polygonPoints[0], this.state.triggerType, this.props.data.cameraGroup, this.triggerDetails['id'], null, this.triggerDetails.direction, values.trigger_windows, values.shared);
              break;
          }
        });
        this.triggerDetails.polygonPoints.length = 0;
        this.setState({saveCancel: false});
        this.setState({canvasMode: false});
        this.setState({newLoiteringTrigger: false});
      } else {
        message.error('please draw a trigger to save');
      }
    }
    this.triggerDetails.currentTriggerId = null;
    this.setState({showShareOption: false});
    this.fetchTriggers(true);
  };

  fetchTriggers = (checked) => {
    if (checked === true) {
      this.setState({triggers: true});
      this.setState({deleteButton: false});
      this.props.fetchTriggers(this.props.data.user, this.props.data.cameraGroup, this.triggerDetails['id']);
    } else {
      this.setState({canvasMode: false});
      this.setState({triggers: false});
      this.setState({deleteButton: false});
    }
  };

  deleteTrigger = () => {
    if (this.triggerDetails.currentTriggerId !== 0 && this.triggerDetails.currentTriggerType !== '') {
      this.triggerDetails['id'] = this.props.data.id;
      this.props.deleteTrigger(this.props.data.user, this.props.data.camera_groups_id, this.triggerDetails['id'], this.triggerDetails.currentTriggerId);
      this.triggerDetails.currentTriggerId = null;
      this.triggerDetails.currentTriggerType = '';
    }
  };

  formatNumberLength = (num, length) => {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
  }

  convertToMilitaryFormat = (time) => {
    time = parseInt(time);
    if ((isNaN(time)) || (time === undefined)) {
      return '00:00';
    } else {
      let minutes = moment.duration(time, 'seconds').minutes();
      let seconds = moment.duration(time, 'seconds').seconds();
      let format = this.formatNumberLength(minutes, 2) + ':' + this.formatNumberLength(seconds, 2);

      return format;
    }
  }

  handleChangeTimeWindow = (fieldValue) => {
    let triggerTimeWindow = this.props.triggerTimeWindows[fieldValue];
    if (typeof triggerTimeWindow !== 'undefined'){
      let start_at = triggerTimeWindow.start_at;
      let end_at = triggerTimeWindow.end_at;
      if (start_at !== null) {
        start_at = moment.parseZone(start_at, "HH:mm");
      }
      if (end_at !== null) {
        end_at = moment.parseZone(end_at, "HH:mm");
      }
      if (isEmpty(triggerTimeWindow['start_at']) && isEmpty(triggerTimeWindow['end_at']) && isEmpty(triggerTimeWindow['days_of_week'])) {
        this.setState({showShareOption: true});
      } else {
        this.setState({showShareOption: false});
      }
      this.form.setFieldsValue({days_of_week: triggerTimeWindow.days_of_week});
      this.form.setFieldsValue({start_at: start_at});
      this.form.setFieldsValue({end_at: end_at});
    }
  }

  handleAddNewTimeWindow = () => {
    this.form.resetFields('time_window_select');
    this.form.resetFields('days_of_week');
    this.form.setFieldsValue({start_at: null});
    this.form.setFieldsValue({end_at: null});
    this.props.addNewTriggerTimeWindow(this.props.triggerTimeWindows);
  }

  handleUpdateStart = (fieldValue) => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      this.props.updateTimeWindowData(timeWindowSelect, this.props.triggerTimeWindows, moment.parseZone(fieldValue).format('HH:mm'), 'start_at');
    }
  }

  handleUpdateStop = (fieldValue) => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      let startTime = this.props.triggerTimeWindows[timeWindowSelect].start_at;
      if (startTime !== null) {
        if (moment.parseZone(startTime, 'HH:mm').isBefore(fieldValue, 'minute')) {
          this.props.updateTimeWindowData(timeWindowSelect, this.props.triggerTimeWindows, moment.parseZone(fieldValue).format('HH:mm'), 'end_at');
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
      this.props.updateTimeWindowData(timeWindowSelect, this.props.triggerTimeWindows, fieldValue, 'days_of_week');
    }
  }

  handleResetData = () => {
    this.form.resetFields('days_of_week');
    this.form.setFieldsValue({start_at: null});
    this.form.setFieldsValue({end_at: null});
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      this.props.clearTimeWindowData(timeWindowSelect, this.props.triggerTimeWindows);
    }
  }

  setTriggerTimeWindows = (polygonData, selectedPolygonId) => {
    for (var i = 0; i < polygonData.length; i++) {
      if (polygonData[i].id == selectedPolygonId) {
        this.form.resetFields('time_window_select');
        this.form.resetFields('days_of_week');
        this.form.setFieldsValue({start_at: null});
        this.form.setFieldsValue({end_at: null});
        this.props.setTriggerSpecificTimeWindows(polygonData[i].time_windows);
      }
    }
  }

  handleSaveData = () => {
    this.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      if (typeof values.time_window_select != 'undefined') {
        let trigger_windows = {};
        trigger_windows.start_at = values.start_at.format('HH:mmZ').toString();
        trigger_windows.end_at = values.end_at.format('HH:mmZ').toString();
        trigger_windows.days_of_week = values.days_of_week;
        if (this.state.showShareOption) {
          this.props.createTriggerTimeWindow(this.props.data.user, this.props.data.camera_groups_id, this.triggerDetails.id, this.triggerDetails.currentTriggerId, trigger_windows);
          this.setState({showShareOption: false});
        } else {
          trigger_windows.id = this.props.triggerTimeWindows[values.time_window_select].id;
          this.props.updateTriggerTimeWindow(this.props.data.user, this.props.data.camera_groups_id, this.triggerDetails.id, this.triggerDetails.currentTriggerId, trigger_windows);
        }
      }
    });
  }

  handleDeleteTriggerTimeWindow = () => {
    this.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      if (typeof values.time_window_select != 'undefined') {
        let trigger_windows = {};
        trigger_windows.id = this.props.triggerTimeWindows[values.time_window_select].id;
        this.props.deleteTriggerTimeWindow(this.props.data.user, this.props.data.camera_groups_id, this.triggerDetails.id, this.triggerDetails.currentTriggerId, trigger_windows);
      }
    });
  }

  handleCheckForWindow = () => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    let days_of_week = this.form.getFieldProps('days_of_week').value;
    if (typeof timeWindowSelect == 'undefined') {
      message.error('Please select which Trigger Silence Window you want to store this in. Your changes will not be saved!');
      this.handleResetData();
    } else if (days_of_week === undefined || days_of_week.length == 0) {
      message.error('Please select the days you would like the trigger time to be active. Your changes will not be saved!');
      this.handleResetData();
    }
  }

  render() {
    return (
      <div style={styles.form}>
        <Icon type='eye' onClick={this.showModal}/>
        <AddTriggerForm
          ref={(form) => this.form = form}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          error={this.state.error}
          cameraName={this.props.data.name}
          triggerImg={this.state.image}
          visibility={this.state.visibility}
          handleVisibility={this.handleVisibleChange}
          showTrigger={this.showTrigger}
          canvasMode={this.state.canvasMode}
          onImgLoad={this.onImgLoad}
          imageDimensions={this.state.imageDimensions}
          saveCancel={this.state.saveCancel}
          handleSaveCancel={this.handleSaveCancel}
          triggers={this.state.triggers}
          triggerPointDirection={this.triggerPointDirection}
          fetchTriggers={this.fetchTriggers}
          triggerExtras={this.triggerExtras}
          deleteTrigger={this.deleteTrigger}
          deleteButton={this.state.deleteButton}
          triggerInProcess={this.props.createTriggerInProcess}
          deleteStatus={this.props.deleteTriggerInProcess}
          sliderValue={this.sliderValue}
          loiteringSeconds={this.state.loiteringSeconds}
          convertToMilitaryFormat={this.convertToMilitaryFormat}
          currentTriggerDetails={this.triggerDetails}
          direction={this.direction}
          fetchTriggerInProcess={this.props.fetchTriggerInProcess}
          newLoiteringTrigger={this.state.newLoiteringTrigger}
          resetData={this.handleResetData}
          changeTimeWindow={this.handleChangeTimeWindow}
          updateDataStart={this.handleUpdateStart}
          updateDataStop={this.handleUpdateStop}
          checkForWindow={this.handleCheckForWindow}
          updateDataDaysOfWeek={this.handleUpdateDaysOfWeek}
          time_zone={this.state.time_zone}
          saveData={this.handleSaveData}
          timeWindows={this.props.triggerTimeWindows}
          cameraGroupOwner={this.state.cameraGroupOwner}
          showShareOption={this.state.showShareOption}
          addNewTimeWindow={this.handleAddNewTimeWindow}
          getTriggerSpecificTimeWindows={this.getTriggerSpecificTimeWindows}
          setTriggerTimeWindows={this.setTriggerTimeWindows}
          deleteTriggerTimeWindow={this.handleDeleteTriggerTimeWindow}
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
    float: 'left',
    fontSize: 18
  },
  image: {
    width: '100%',
    float: 'left'
  },
  form: {
    position: 'relative',
    float: 'left'
  },
  triggerType: {
    textAlign: 'center'
  },
  saveBtn: {
    color: '#108ee9'
  },
  cancelBtn: {
    color: 'red',
    marginLeft: 2
  },
  triggersHideShow: {
    textAlign: 'center'
  },
  deleteButton: {
    float: 'right',
    color: 'red',
    marginLeft: 2
  },
  currenttriggerDetails: {
    float: 'left'
  },
  LDtimeLeft: {
    paddingRight: 5
  },
  LDtimeRight: {
    float: 'left',
    paddingLeft: 5
  },
  borderBox: {
    border: 'solid 1px #bfbfbf'
  },
  dayPicker: {
    width: '80%',
  },
  triggerTimeWindowSelect: {
    width: '60%'
  },
};

const mapStateToProps = (state) => {
  return {
    createTriggerSuccess: state.triggers.createTriggerSuccess,
    createTriggerError: state.triggers.createTriggerError,
    createTriggerInProcess: state.triggers.createTriggerInProcess,
    polygonData: state.triggers.polygonData,
    deleteTriggerSuccess: state.triggers.deleteTriggerSuccess,
    deleteTriggerInProcess: state.triggers.deleteTriggerInProcess,
    fetchTriggerInProcess: state.triggers.fetchTriggerInProcess,
    fetchTriggerSuccess: state.triggers.fetchTriggerSuccess,
    triggerTimeWindows: state.triggers.triggerTimeWindows,
    createTriggerTimeWindowSuccess: state.triggers.createTriggerTimeWindowSuccess,
    createTriggerTimeWindowInProcess: state.triggers.createTriggerTimeWindowInProcess,
    updateTriggerTimeWindowSuccess: state.triggers.updateTriggerTimeWindowSuccess,
    updateTriggerTimeWindowInProcess: state.triggers.updateTriggerTimeWindowInProcess,
    deleteTriggerTimeWindowSuccess: state.triggers.deleteTriggerTimeWindowSuccess,
    deleteTriggerTimeWindowInProcess: state.triggers.deleteTriggerTimeWindowInProcess
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    createTrigger: (user, triggerCoordinates, triggerType, cameraGroupId, cameraId, triggerDuration, direction, timeWindows, shared) => dispatch(createTrigger(user, triggerCoordinates, triggerType, cameraGroupId, cameraId, triggerDuration, direction, timeWindows, shared)),
    fetchTriggers: (user, cameraGroup, cameraId) => dispatch(fetchTriggers(user, cameraGroup, cameraId)),
    deleteTrigger: (user, cameraGroupId, cameraId, baseTriggersId) => dispatch(deleteTrigger(user, cameraGroupId, cameraId, baseTriggersId)),
    updateTimeWindowData: (timeWindowSelect, values, fieldValue, fieldName) => dispatch(updateTimeWindowData(timeWindowSelect, values, fieldValue, fieldName)),
    clearTimeWindowData: (timeWindowSelect, values) => dispatch(clearTimeWindowData(timeWindowSelect, values)),
    setTriggerSpecificTimeWindows: (triggers, triggerId) => dispatch(setTriggerSpecificTimeWindows(triggers, triggerId)),
    addNewTriggerTimeWindow: (values) => dispatch(addNewTriggerTimeWindow(values)),
    createTriggerTimeWindow: (user, cameraGroupId, cameraId, triggersId, timeWindow) => dispatch(createTriggerTimeWindow(user, cameraGroupId, cameraId, triggersId, timeWindow)),
    updateTriggerTimeWindow: (user, cameraGroupId, cameraId, triggersId, timeWindow) => dispatch(updateTriggerTimeWindow(user, cameraGroupId, cameraId, triggersId, timeWindow)),
    deleteTriggerTimeWindow: (user, cameraGroupId, cameraId, baseTriggersId, timeWindow) => dispatch(deleteTriggerTimeWindow(user, cameraGroupId, cameraId, baseTriggersId, timeWindow))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AddTriggerModal);
