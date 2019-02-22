import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Icon, Modal, Form, Spin, Button, Popover, message, Slider, Row, Col, TimePicker, Select} from 'antd';
import CustomCanvas from '../../components/formitems/CustomCanvas';
import CustomInput from "../formitems/CustomInput";
import {createTrigger, fetchTrigger, deleteTrigger, updateTimeWindowData, clearTimeWindowData} from '../../redux/triggers/actions';
import {connect} from 'react-redux';
import moment from 'moment';
import loading from '../../../assets/img/TempCameraImage.jpeg';

const Option = Select.Option;
const FormItem = Form.Item;
const AddTriggerForm = Form.create()(
  (props) => {
    const {
      onCancel, triggers, sliderValue, loiteringSeconds, deleteStatus, deleteButton, triggerInProcess, triggerExtras, deleteTrigger, visible, saveCancel, form, cameraName, triggerPointDirection, handleSaveCancel, triggerImg, handleVisibility, visibility, showTrigger, canvasMode, onImgLoad, imageDimensions, convertToMilitaryFormat, currentTriggerDetails, direction, fetchTriggerInProcess, newLoiteringTrigger, updateDataStart, updateDataStop, updateDataDaysOfWeek, changeTimeWindow, resetData, checkForWindow, createSelectItems
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
      <Modal title={`Edit ${cameraName}`}
             visible={visible}
             style={styles.modal}
             onCancel={onCancel}
             footer={[null, null]}
             width="50%"
      >
        <Form>
          <FormItem style={styles.triggersHideSHow}>
            {triggerImg === null ?
              <img src={loading} style={styles.image} onLoad={onImgLoad} onReset={onImgLoad} />:
              <img src={triggerImg} style={styles.image} onLoad={onImgLoad} onReset={onImgLoad} />
            }
            {canvasMode &&
            <CustomCanvas width={imageDimensions.width} height={imageDimensions.height}
                          triggerPointDirection={triggerPointDirection}
                          getTriggers={triggers} direction={direction} triggerExtras={triggerExtras}
                          triggerType={currentTriggerDetails.currentTriggerType}/>}

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
            </Row>}
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
              {/* TODO: build the redux functionality to link to this new set of form elements */}
              <div>
                <div style={styles.borderBox}>
                  <div className="ant-form-item-label">
                    <label>Set Custom Trigger Silence Windows</label>
                  </div>
                  <FormItem label="Custom Time Window" {...formItemLayout}>
                    {getFieldDecorator('time_window_select', {})(
                      <Select
                        placeholder="Select Time Window"
                        style={styles.triggerTimeWindowSelect}
                        onChange={changeTimeWindow}
                      >
                        {/* TODO: dynamically populate this to show the number of time windows the user saved. */}
                        <Option value={0}>Window 1</Option>
                        <Option value={1}>Window 2</Option>
                        <Option value={2}>Window 3</Option>
                      </Select>
                    )}
                  </FormItem>
                  <FormItem>
                    {/* TODO: add button to add a new time window to the time window select and on update, send the data to the API and save it. */}
                  </FormItem>
                  <FormItem label="Select Trigger Days">
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
              </div>
            </div>
            }
          </FormItem>
          <FormItem>
            <Popover title='Select Trigger Type to Add'
                     content=
                       {
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
              {
                !saveCancel && <a>
                  <CustomInput trigger={true} visibility={visibility} fetchTriggerInProcess={fetchTriggerInProcess}/>
                </a>
              }
            </Popover>
          </FormItem>
          <FormItem>

            {
              saveCancel &&
              <Button key='add_trigger' onClick={() => handleSaveCancel('save')} loading={triggerInProcess}
                      style={styles.saveBtn} size='small'>
                Save
              </Button>
            }
            {
              saveCancel &&
              <Button key='cancel' onClick={() => handleSaveCancel('cancel')} style={styles.cancelBtn} size='small'>
                Cancel
              </Button>
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
      imageDimensions: {},
      saveCancel: false,
      triggers: false,
      deleteButton: false,
      loiteringSeconds: 0,
      triggerType: '',
      newLoiteringTrigger: false
    }

    this.onImgLoad = this.onImgLoad.bind(this);
    this.triggerPointDirection = this.triggerPointDirection.bind(this);
    this.triggerExtras = this.triggerExtras.bind(this);
  }


  triggerDetails = {
    currentTriggerId: 0,
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
// TODO: build save function for trigger time windows inside componentWillReceiveProps() and link to trigger_triggers/action.js functions
  componentWillReceiveProps(nextProps) {
    const nThis = this;
    if (this.props.polygonData !== undefined) {
      if (nextProps.fetchTriggerSuccess === true) {
        this.setState({canvasMode: true});
      }
      if (nextProps.createTriggerSuccess !== this.props.createTriggerSuccess && this.triggerDetails['id'] !== undefined) {
        this.setState({canvasMode: false});
        this.props.fetchTrigger(this.triggerDetails['id']);
        this.triggerDetails['id'] = undefined;
        this.setState({saveCancel: false});
      }
      if (nextProps.deleteTriggerSuccess !== this.props.deleteTriggerSuccess && this.triggerDetails['id'] !== undefined) {
        this.setState({canvasMode: false});
        this.props.fetchTrigger(this.triggerDetails['id']);
        this.triggerDetails['id'] = undefined;
        this.setState({deleteButton: false});
        this.setState({saveCancel: false});
      }

    }
    else if (this.props.polygonData !== nextProps.polygonData) {
      this.setState({canvasMode: true});
    }
  }

  showModal = () => {
    if (typeof window.orientation !== 'undefined') {
      trigger('Sorry, trigger trigger creation not currently supported on mobile devices.');
    } else {
      this.setState({visible: true});
      this.triggerDetails['id'] = this.props.data.id;
      this.setState({saveCancel: false});
      this.setState({canvasMode: !this.state.canvasMode});
      this.fetchTriggers(true);
    }
  };

  handleCancel = () => {
    this.setState({canvasMode: false});
    this.setState({visible: false});
    this.triggerDetails.currentTriggerType = '';
  };

  handleVisibleChange = (visibility) => {
    if (visibility === true) {
      this.setState({visibility});
      this.setState({canvasMode: false});
      this.setState({triggers: false});
      this.setState({deleteButton: false});
      this.triggerDetails.currentTriggerType = '';
    }
    else {
      this.setState({deleteButton: false});
      this.setState({visibility});
      this.setState({canvasMode: true});
      this.setState({triggers: true});
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
      this.setState({saveCancel: !this.state.saveCancel});
      this.fetchTriggers(true);
      this.triggerDetails.currentTriggerType = '';
    }
    if (event === 'save') {
      if (this.triggerDetails.polygonPoints.length !== 0) {
        this.triggerDetails.currentTriggerType = '';
        this.triggerDetails['id'] = this.props.data.id;
        delete values.start;
        delete values.stop;
        delete values.days_of_week;
        delete values.time_window_select;
        values.trigger_windows = this.props.data.trigger_windows;

        switch (this.state.triggerType) {
          case 'RA':
            this.props.createTrigger(this.triggerDetails.polygonPoints[0], this.state.triggerType, this.props.data.id);
            break;

          case 'LD':
            this.props.createTrigger(this.triggerDetails.polygonPoints[0], this.state.triggerType, this.props.data.id, this.state.loiteringSeconds);
            this.setState({loiteringSeconds: 0});
            break;

          case 'VW':
            this.props.createTrigger(this.triggerDetails.polygonPoints[0], this.state.triggerType, this.props.data.id, undefined, this.triggerDetails.direction);
            break;

        }
        this.fetchTriggers(true);
      }
      else {
        message.error('please draw a trigger to save');
      }
    }
    this.triggerDetails.polygonPoints.length = 0;
    this.setState({canvasMode: false});
    this.setState({newLoiteringTrigger: false});
  };

  fetchTriggers = (checked) => {
    if (checked === true) {
      this.setState({triggers: true});
      this.setState({deleteButton: false});
      this.props.fetchTrigger(this.props.data.id);
    }
    else {
      this.setState({canvasMode: false});
      this.setState({triggers: false});
      this.setState({deleteButton: false});
    }
  };

  deleteTrigger = () => {
    if (this.triggerDetails.currentTriggerId !== 0 && this.triggerDetails.currentTriggerType !== '') {
      this.triggerDetails['id'] = this.props.data.id;
      this.props.deleteTrigger(this.props.data.id, this.triggerDetails.currentTriggerId);
      this.triggerDetails.currentTriggerId = 0;
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

  handleChangeTimeWindow = (fieldValue) => {
    let triggerTimeWindow = this.props.data.trigger_windows[fieldValue];
    let start = triggerTimeWindow.start;
    let stop = triggerTimeWindow.stop;
    if (start !== null) {
      start = moment(triggerTimeWindow.start, "HH:mm");
    }
    if (stop !== null) {
      stop = moment(triggerTimeWindow.stop, "HH:mm");
    }

    this.form.setFieldsValue({days_of_week: triggerTimeWindow.daysOfWeek});
    this.form.setFieldsValue({start: start});
    this.form.setFieldsValue({stop: stop});
  }

  handleUpdateStart = (fieldValue) => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      this.props.updateTimeWindowData(timeWindowSelect, this.props.data.trigger_windows, moment(fieldValue).format('HH:mm').toString(), 'start');
    }
  }

  handleUpdateStop = (fieldValue) => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      let startTime = this.props.data.trigger_windows[timeWindowSelect].start;
      if (startTime !== null) {
        if (moment(startTime, 'HH:mm').isBefore(fieldValue, 'minute')) {
          this.props.updateTimeWindowData(timeWindowSelect, this.props.data.trigger_windows, moment(fieldValue).format('HH:mm').toString(), 'stop');
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
      this.props.updateTimeWindowData(timeWindowSelect, this.props.data.trigger_windows, fieldValue, 'daysOfWeek');
    }
  }

  handleResetData = () => {
    this.form.resetFields('days_of_week');
    this.form.setFieldsValue({start: null});
    this.form.setFieldsValue({stop: null});
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    if (typeof timeWindowSelect !== 'undefined') {
      this.props.clearTimeWindowData(timeWindowSelect, this.props.data.trigger_windows);
    }
  }

  handleCheckForWindow = () => {
    let timeWindowSelect = this.form.getFieldProps('time_window_select').value;
    let daysOfWeek = this.form.getFieldProps('days_of_week').value;
    if (typeof timeWindowSelect == 'undefined') {
      message.error('Please select which Trigger Time Window you want to store this in. Your changes will not be saved!');
      this.handleResetData();
    } else if (daysOfWeek === undefined || daysOfWeek.length == 0) {
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
          triggerImg={this.props.data.image.original}
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
          createSelectItems={this.handleCreateSelectItems}
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
  triggersHideSHow: {
    textAlign: 'right'
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
    fetchTriggerSuccess: state.triggers.fetchTriggerSuccess
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    createTrigger: (triggerCoordinates, triggerType, cameraId, duration, direction) => dispatch(createTrigger(triggerCoordinates, triggerType, cameraId, duration, direction)),
    fetchTrigger: (cameraId) => dispatch(fetchTrigger(cameraId)),
    deleteTrigger: (cameraId, triggerId) => dispatch(deleteTrigger(cameraId, triggerId)),
    updateTimeWindowData: (timeWindowSelect, values, fieldValue, fieldName) => dispatch(updateTimeWindowData(timeWindowSelect, values, fieldValue, fieldName)),
    clearTimeWindowData: (timeWindowSelect, values) => dispatch(clearTimeWindowData(timeWindowSelect, values))

  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AddTriggerModal);
