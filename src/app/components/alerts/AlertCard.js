import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Card, Row, Col } from 'antd';
import moment from 'moment-timezone';
import axios from 'axios';

import { deleteAlert } from '../../redux/alerts/actions';
import ExpandAlertModal from '../modals/ExpandAlertModal';

class _AlertCard extends Component {
  constructor(props) {
    super(props);
  }

  formatDatetime = (timestamp, timezone) => {
    const dt = moment.tz(timestamp, timezone);
    return `${dt.format('L')} ${dt.format('LTS')}`;
  }

  playAlertVideo = () => {
    //this.props.history.push('/video', {videoSource: this.props.video})
  }

  deleteAlert = () => {
    if (!this.props.deleteInProcess) {
      this.props.deleteAlert(this.props.user, this.props.uuid);
    }
  }

  render() {
    let trigger_type = this.props.trigger_type;
    if (this.props.trigger_type == 'RA') {
      trigger_type = 'Restricted Area';
    } else if (this.props.trigger_type == "VW") {
      trigger_type = "Virtual Wall";
    } else if (this.props.trigger_type == "LD") {
      trigger_type = "Loitering";
    }
    return (
      <Card style={styles.alertCard}>
        <div style={styles.alertCardImgContainer}>
          <ExpandAlertModal data={this.props} />
        </div>
        <Row type='flex' justify='space-between'>
          <Col style={styles.alertType} xs={8} sm={8} md={8}>{trigger_type}</Col>
          <Col style={styles.cameraNameCameraGroup} xs={14} sm={14} md={14}>{this.formatDatetime(this.props.time, this.props.cameras_time_zone)} { this.props.cameras_time_zone}</Col>
          <Col style={styles.alertDateTime} xs={24}>{this.props.cameras_name} at {this.props.camera_groups_name}</Col>
        </Row>
      </Card>
    )
  }
}

const styles = {
  alertCard: {
    marginTop: 10,
    marginLeft: 10,
    marginRight:10,
    marginBottom: 0,
    maxWidth: 405
  },
  alertType: {
    paddingTop: 5,
    marginLeft: 10,
    textAlign: 'left'
  },
  cameraNameCameraGroup: {
    paddingTop: 5,
    marginRight: 10,
    textAlign: 'right'
  },
  alertDateTime: {
    paddingTop: 7,
    textAlign: 'center'
  },
  alertTimeZone: {
    fontSize: 10,
    textAlign: 'center'
  },
  alertDelete: {
    fontSize: 12,
    paddingTop: 5
  },
  alertCardImgContainer: {
    backgroundColor: 'black',
    height: 170,
    position: 'relative',
    margin: '0 auto',
    paddingLeft: 0,
    paddingRight: 0
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    deleteError: state.alerts.deleteError,
    deleteInProcess: state.alerts.deleteInProcess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteAlert: (user, alertUuid) => dispatch(deleteAlert(user, alertUuid))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(_AlertCard));
