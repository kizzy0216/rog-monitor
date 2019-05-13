import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col, Button, Pagination } from 'antd';

import AlertCard from '../components/alerts/AlertCard';

import * as alertActions from '../redux/alerts/actions';

class Alerts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videoSource: null,
      open: true
    }
  }

  UNSAFE_componentWillMount = () => {
    this.props.actions.markUserAlertsViewed(this.props.user);
  }

  // selectAlert = (alert) => {
  //   this.setState({videoSource: alert.video});
  // }

  clearAlerts = () => {
    this.props.actions.clearAlerts();
    this.props.alerts.forEach(alert => {
      this.props.actions.deleteAlert(this.props.user, alert.id);
    });
  }

  handlePaginationChange = (page, pageSize) => {
    // TODO: change this to handle the display of the next page of alerts
    this.props.actions.fetchAlertsWithPagination(this.props.user, page, pageSize);
  }

  handleOnPageSizeChange = (current, size) => {
    this.props.actions.fetchAlertsWithPagination(this.props.user, current, size);
  }

  render() {
    if (this.props.alerts.length) {
      return (
        <div>
          {/* <Row type='flex' justify='center'>
            <Col>
              <Button onClick={this.clearAlerts}>Clear All</Button>
            </Col>
          </Row> */}
          <Row type='flex' justify='center'>
            <Pagination
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              hideOnSinglePage={true}
              showSizeChanger={true}
              onShowSizeChange={this.handleOnPageSizeChange}
              pageSize={this.props.pagination.per_page}
              defaultCurrent={this.props.pagination.current_page}
              total={this.props.pagination.total}
              onChange={this.handlePaginationChange}
            />
          </Row>
          <Row><Col>&nbsp;</Col></Row>
          <Row type='flex' justify='start'>
            {this.props.alerts.map(alert => (
              <Col key={`alert-${alert.id}`} xs={24} sm={12} md={8} lg={6}>
                <AlertCard {...alert} />
              </Col>
            ))}
          </Row>
        </div>
      )
    } else {
      return (
        <Row type='flex' justify='start' style={styles.alertListContainer}>
          <p style={styles.noAlertsText}>
            Things are looking good!
            <br />
            You have no alerts.
          </p>
        </Row>
      )
    }
  }
}

const styles = {
  noAlertsText: {
    margin: '0 auto',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 24
  },
  alertListContainer: {
    height: 'calc(100vh - 65px)'
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    alerts: state.alerts.alerts,
    fetchError: state.alerts.fetchError,
    fetchInProcess: state.alerts.fetchInProcess,
    deleteInProcess: state.alerts.deleteInProcess,
    pagination: state.alerts.pagination
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(alertActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Alerts);
