import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Card, Row, Col, Icon } from 'antd';
import moment, { lang } from 'moment';
import axios from 'axios';

import { deleteAlert } from '../../redux/alerts/actions';

class _AlertCard extends Component {
  constructor(props) {
    super(props);
  }

  formatDatetime = (timestamp) => {
    const dt = moment(timestamp);
    return `${dt.format('L')} ${dt.format('LT')}`;
  }

  playAlertVideo = () => {
    //this.props.history.push('/video', {videoSource: this.props.video})
  }

  deleteAlert = () => {
    if (!this.props.deleteInProcess) {
      console.log("hello");
      console.log(this.props);
      this.props.deleteAlert(this.props.user, this.props.id);
    }
  }

  render() {
    console.log("hello this is the render");
    return (
      <Card>
        <div style={styles.alertCardImgContainer} onClick={() => this.playAlertVideo()}>
          <img src={this.props.image.original} style={styles.alertCardImg} />
        </div>
        <Row type='flex' justify='space-between'>
          <Col style={styles.alertType} xs={24} sm={24} md={12} lg={12} xl={12}>{this.props.type}</Col>
          <Col style={styles.alertType} xs={24} sm={24} md={12} lg={12} xl={12}>{this.props.camera.name} at {this.props.camera.location.name}</Col>
          <Col style={styles.alertDateTime} xs={24} sm={24} md={12} lg={12} xl={12}>{this.formatDatetime(this.props.timestamp)}</Col>
          <Col style={styles.alertDelete} xs={24} sm={24} md={12} lg={12} xl={12} onClick={this.deleteAlert}><Icon type='close-square' /></Col>
        </Row>
      </Card>
    )
  }
}

const styles = {
  alertType: {
    fontSize: 10,
    paddingTop: 5
  },
  alertDateTime: {
    fontSize: 10,
    paddingTop: 5
  },
  alertDelete: {
    fontSize: 12,
    paddingTop: 5
  },
  alertCardImgContainer: {
    backgroundColor: 'white',
    height: 170,
    position: 'relative',
    margin: '0 auto',
    paddingLeft: 0,
    paddingRight: 0
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
    deleteAlert: (user, alertId) => dispatch(deleteAlert(user, alertId))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(_AlertCard));
