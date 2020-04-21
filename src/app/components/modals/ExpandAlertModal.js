import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import moment from 'moment';
import {Modal, Row, Col, Form} from 'antd';

const ExpandAlertForm = ({onCancel, visible, showAlert, alertImg, alertType, cameraName, cameraGroupName, timestamp, timezone, formatDatetime}) => {
  return (
    <Modal
      visible={visible}
      style={styles.modal}
      onCancel={onCancel}
      footer={[null, null]}
      width="90vw"
    >
      <Row type='flex' justify='space-between'>
        <Col style={styles.alertType} xs={24} sm={24} md={12} lg={8} xl={8}>{alertType}</Col>
        <Col style={styles.alertType} xs={24} sm={24} md={12} lg={8} xl={8}>{cameraName} at {cameraGroupName}</Col>
        <Col style={styles.alertDateTime} xs={24} sm={24} md={24} lg={8} xl={8}>{formatDatetime(timestamp, timezone)}</Col>
      </Row>
      <Row><img src={alertImg} style={styles.expandedImg} /></Row>
      <Row>
        <Col style={styles.alertTimeZone} xs={24}>Time Zone: {timezone}</Col>
      </Row>
    </Modal>
  );
};

class ExpandAlertModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visable: false,
    }
  }

  formatDatetime = (timestamp, timezone) => {
    const dt = moment.tz(timestamp, timezone);
    return `${dt.format('L')} ${dt.format('LTS')}`;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {}

  showModal = () => {
    this.setState({visible: true});
  };

  handleCancel = () => {
    this.setState({visible: false});
  };

  render() {
    let trigger_type = this.props.data.trigger_type;
    if (this.props.data.trigger_type == 'RA') {
      trigger_type = 'Restricted Area';
    } else if (this.props.data.trigger_type == "VW") {
      trigger_type = "Virtual Wall";
    } else if (this.props.data.trigger_type == "LD") {
      trigger_type = "Loitering";
    }
    return (
      <div>
        <img src={this.props.data.alert_image_url +'?auth='+ this.props.data.user.jwt} style={styles.alertCardImg} onClick={this.showModal} />
        <ExpandAlertForm
          onCancel={this.handleCancel}
          alertImg={this.props.data.alert_image_url +'?auth='+ this.props.data.user.jwt}
          visible={this.state.visible}
          alertType={trigger_type}
          cameraName={this.props.data.cameras_name}
          cameraGroupName={this.props.data.camera_groups_name}
          timestamp={this.props.data.time}
          timezone={this.props.data.cameras_time_zone}
          formatDatetime={this.formatDatetime}
        />
      </div>
    );
  }
}

const styles = {
  modal: {
    textAlign: 'center',
    wordBreak: 'break-word',
    top: '25px'
  },
  alertCardImg: {
    position: 'absolute',
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto'
  },
  alertType: {
    fontSize: 14,
    paddingTop: 5
  },
  alertDateTime: {
    fontSize: 14,
    paddingTop: 5
  },
  alertTimeZone: {
    fontSize: 14,
    paddingTop: 5
  },
  expandedImg: {
    maxWidth: '80vw',
    margin: '0 auto'
  }
};

const mapStateToProps = (state) => {
  return {}
};
const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(ExpandAlertModal);
