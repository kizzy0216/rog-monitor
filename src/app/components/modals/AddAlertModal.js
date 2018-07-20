import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Icon, Modal, Form, Spin, Button, Popover, message, Slider, Row, Col} from 'antd';
import CustomCanvas from '../../components/formitems/CustomCanvas';
import CustomInput from "../formitems/CustomInput";
import {createAlert, fetchPolygonAlert, deletePolygonAlert} from '../../redux/alerts/actions';
import {connect} from 'react-redux';
import moment from 'moment';
import loading from '../../../assets/img/TempCameraImage.jpeg';

const FormItem = Form.Item;
const AddAlertForm = Form.create()(
  (props) => {
    const {
      onCancel, alerts, sliderValue, loiteringSeconds, deleteStatus, deleteButton, alertInProcess, alertExtras, deleteAlert, visible, saveCancel, form, cameraName, alertPointDirection, handleSaveCancel, alertImg, handleVisibility, visibility, showAlert, canvasMode, onImgLoad, imageDimensions, convertToMilitaryFormat, currentAlertDetails, direction, fetchAlertInProcess, newLoiteringAlert
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
          <FormItem style={styles.alertsHideSHow}>
            {alertImg === null ?
              <img src={loading} style={styles.image} onLoad={onImgLoad} onReset={onImgLoad} />:
              <img src={alertImg} style={styles.image} onLoad={onImgLoad} onReset={onImgLoad} />
            }
            {canvasMode &&
            <CustomCanvas width={imageDimensions.width} height={imageDimensions.height}
                          alertPointDirection={alertPointDirection}
                          getAlerts={alerts} direction={direction} alertExtras={alertExtras}
                          alertType={currentAlertDetails.currentAlertType}/>}

            {canvasMode && (currentAlertDetails.currentAlertType === 'LD') &&
            <Row>
              <Col span={4} style={styles.LDtimeLeft}>
                {convertToMilitaryFormat(loiteringSeconds)}
              </Col>
              <Col span={16}>
                {/* TODO put ternary statement to render disabled if importing data */}
                {newLoiteringAlert === true ?
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
              <span style={styles.currentalertDetails}>
                Trigger Type: {(currentAlertDetails.currentAlertType === 'RA') ? 'Restricted Area' : ((currentAlertDetails.currentAlertType === 'LD') ? 'Loitering Detection' : 'Virtual Wall')}
                </span>
              <Button style={styles.deleteButton} onClick={deleteAlert} loading={deleteStatus}>
                Delete
              </Button>
            </div>
            }
          </FormItem>
          <FormItem>
            <Popover title='Select Trigger Type to Add'
                     content=
                       {
                         <div style={styles.alertType}>
                           <a onClick={() => showAlert('RA')}>Restricted Area</a>
                           <br/>
                           <a onClick={() => showAlert('VW')}>Virtual Wall</a>
                           <br/>
                           <a onClick={() => showAlert('LD')}>Loitering</a>
                           <br/>
                         </div>
                       }
                     trigger="click"
                     visible={visibility}
                     onVisibleChange={handleVisibility}
            >
              {
                !saveCancel && <a>
                  <CustomInput alert={true} visibility={visibility} fetchAlertInProcess={fetchAlertInProcess}/>
                </a>
              }
            </Popover>
          </FormItem>
          <FormItem>

            {
              saveCancel &&
              <Button key='add_alert' onClick={() => handleSaveCancel('save')} loading={alertInProcess}
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

class AddAlertModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: false,
      visibility: false,
      canvasMode: true,
      imageDimensions: {},
      saveCancel: false,
      alerts: false,
      deleteButton: false,
      loiteringSeconds: 0,
      alertType: '',
      newLoiteringAlert: false
    }

    this.onImgLoad = this.onImgLoad.bind(this);
    this.alertPointDirection = this.alertPointDirection.bind(this);
    this.alertExtras = this.alertExtras.bind(this);
  }


  alertDetails = {
    currentAlertId: 0,
    currentAlertType: '',
    polygonPoints: [],
    direction: ''
  };

  sliderValue = (value) => {

    this.setState({
      loiteringSeconds: value,
    });
  }

  alertExtras(id, type, duration) {
    this.alertDetails.currentAlertId = id;
    this.alertDetails.currentAlertType = type;
    this.setState({loiteringSeconds: duration});
    this.setState({deleteButton: true});
  }

  alertPointDirection(points, direction) {
    this.alertDetails.polygonPoints.push(points);
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

    this.alertDetails.direction = direction;
  }

  onImgLoad({target: img}) {
    this.setState({
      imageDimensions: {
        height: img.offsetHeight,
        width: img.offsetWidth
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const nThis = this;
    if (this.props.polygonData !== undefined) {
      if (nextProps.fetchAlertSuccess === true) {
        this.setState({canvasMode: true});
      }
      if (nextProps.createAlertSuccess !== this.props.createAlertSuccess && this.alertDetails['id'] !== undefined) {
        this.setState({canvasMode: false});
        this.props.fetchPolygonAlert(this.alertDetails['id']);
        this.alertDetails['id'] = undefined;
        this.setState({saveCancel: false});
      }
      if (nextProps.deleteAlertSuccess !== this.props.deleteAlertSuccess && this.alertDetails['id'] !== undefined) {
        this.setState({canvasMode: false});
        this.props.fetchPolygonAlert(this.alertDetails['id']);
        this.alertDetails['id'] = undefined;
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
      alert('Sorry, alert trigger creation not currently supported on mobile devices.');
    } else {
      this.setState({visible: true});
      this.alertDetails['id'] = this.props.data.id;
      this.setState({saveCancel: false});
      this.setState({canvasMode: !this.state.canvasMode});
      this.fetchAlerts(true);
    }
  };

  handleCancel = () => {
    this.setState({canvasMode: false});
    this.setState({visible: false});
    this.alertDetails.currentAlertType = '';
  };

  handleVisibleChange = (visibility) => {
    if (visibility === true) {
      this.setState({visibility});
      this.setState({canvasMode: false});
      this.setState({alerts: false});
      this.setState({deleteButton: false});
      this.alertDetails.currentAlertType = '';
    }
    else {
      this.setState({deleteButton: false});
      this.setState({visibility});
      this.setState({canvasMode: true});
      this.setState({alerts: true});
    }
  };

  showAlert = (event) => {
    switch (event) {
      case 'RA':
        this.setState({canvasMode: true});
        this.setState({visibility: !this.state.visibility});
        this.setState({saveCancel: !this.state.saveCancel});
        this.setState({alertType: 'RA'});
        this.alertDetails.currentAlertType = 'RA';
        break;

      case 'LD':
        this.setState({canvasMode: true});
        this.setState({visibility: !this.state.visibility});
        this.setState({saveCancel: !this.state.saveCancel});
        this.alertDetails.currentAlertType = 'LD';
        this.setState({alertType: 'LD'});
        this.setState({newLoiteringAlert: true});
        this.setState({loiteringSeconds: 0});
        break;

      case 'VW':
        this.setState({canvasMode: true});
        this.setState({visibility: !this.state.visibility});
        this.setState({saveCancel: !this.state.saveCancel});
        this.alertDetails.currentAlertType = 'VW';
        this.setState({alertType: 'VW'});
        break;

    }
  };

  handleSaveCancel = (event) => {
    if (event === 'cancel') {
      this.setState({saveCancel: !this.state.saveCancel});
      this.fetchAlerts(true);
      this.alertDetails.currentAlertType = '';
    }
    if (event === 'save') {
      if (this.alertDetails.polygonPoints.length !== 0) {
        this.alertDetails.currentAlertType = '';
        this.alertDetails['id'] = this.props.data.id;

        switch (this.state.alertType) {
          case 'RA':
            this.props.createAlert(this.alertDetails.polygonPoints[0], this.state.alertType, this.props.data.id);
            break;

          case 'LD':
            this.props.createAlert(this.alertDetails.polygonPoints[0], this.state.alertType, this.props.data.id, this.state.loiteringSeconds);
            this.setState({loiteringSeconds: 0});
            break;

          case 'VW':
            this.props.createAlert(this.alertDetails.polygonPoints[0], this.state.alertType, this.props.data.id, undefined, this.alertDetails.direction);
            break;

        }
        this.fetchAlerts(true);
      }
      else {
        message.error('please draw a trigger to save');
      }
    }
    this.alertDetails.polygonPoints.length = 0;
    this.setState({canvasMode: false});
    this.setState({newLoiteringAlert: false});
  };

  fetchAlerts = (checked) => {
    if (checked === true) {
      this.setState({alerts: true});
      this.setState({deleteButton: false});
      this.props.fetchPolygonAlert(this.props.data.id);
    }
    else {
      this.setState({canvasMode: false});
      this.setState({alerts: false});
      this.setState({deleteButton: false});
    }
  };

  deleteAlert = () => {
    if (this.alertDetails.currentAlertId !== 0 && this.alertDetails.currentAlertType !== '') {
      this.alertDetails['id'] = this.props.data.id;
      this.props.deletePolygonAlert(this.props.data.id, this.alertDetails.currentAlertId);
      this.alertDetails.currentAlertId = 0;
      this.alertDetails.currentAlertType = '';
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

  render() {
    return (
      <div style={styles.form}>
        <Icon type='eye' onClick={this.showModal}/>
        <AddAlertForm
          ref={(form) => this.form = form}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          error={this.state.error}
          cameraName={this.props.data.name}
          alertImg={this.props.data.image.original}
          visibility={this.state.visibility}
          handleVisibility={this.handleVisibleChange}
          showAlert={this.showAlert}
          canvasMode={this.state.canvasMode}
          onImgLoad={this.onImgLoad}
          imageDimensions={this.state.imageDimensions}
          saveCancel={this.state.saveCancel}
          handleSaveCancel={this.handleSaveCancel}
          alerts={this.state.alerts}
          alertPointDirection={this.alertPointDirection}
          fetchAlerts={this.fetchAlerts}
          alertExtras={this.alertExtras}
          deleteAlert={this.deleteAlert}
          deleteButton={this.state.deleteButton}
          alertInProcess={this.props.createAlertInProcess}
          deleteStatus={this.props.deleteAlertInProcess}
          sliderValue={this.sliderValue}
          loiteringSeconds={this.state.loiteringSeconds}
          convertToMilitaryFormat={this.convertToMilitaryFormat}
          currentAlertDetails={this.alertDetails}
          direction={this.direction}
          fetchAlertInProcess={this.props.fetchPolygonAlertInProcess}
          newLoiteringAlert={this.state.newLoiteringAlert}
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
  alertType: {
    textAlign: 'center'
  },
  saveBtn: {
    color: '#108ee9'
  },
  cancelBtn: {
    color: 'red',
    marginLeft: 2
  },
  alertsHideSHow: {
    textAlign: 'right'
  },
  deleteButton: {
    float: 'right',
    color: 'red',
    marginLeft: 2
  },
  currentalertDetails: {
    float: 'left'
  },
  LDtimeLeft: {
    paddingRight: 5
  },
  LDtimeRight: {
    float: 'left',
    paddingLeft: 5
  }
};

const mapStateToProps = (state) => {
  return {
    createAlertSuccess: state.alerts.createAlertSuccess,
    createAlertError: state.alerts.createAlertError,
    createAlertInProcess: state.alerts.createAlertInProcess,
    polygonData: state.alerts.polygonData,
    deleteAlertSuccess: state.alerts.deleteAlertSuccess,
    deleteAlertInProcess: state.alerts.deleteAlertInProcess,
    fetchPolygonAlertInProcess: state.alerts.fetchPolygonAlertInProcess,
    fetchAlertSuccess: state.alerts.fetchAlertSuccess
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    createAlert: (alertCoordinates, alertType, cameraId, duration, direction) => dispatch(createAlert(alertCoordinates, alertType, cameraId, duration, direction)),
    fetchPolygonAlert: (cameraId) => dispatch(fetchPolygonAlert(cameraId)),
    deletePolygonAlert: (cameraId, alertId) => dispatch(deletePolygonAlert(cameraId, alertId))

  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AddAlertModal);
