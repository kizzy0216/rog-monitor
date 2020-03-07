import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col, Button, Pagination, Select, Menu, Form } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import AlertCard from '../components/alerts/AlertCard';
import AlertFilters from '../components/alerts/AlertFilters';
import * as alertActions from '../redux/alerts/actions';

class Alerts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videoSource: null,
      open: true,
      selectedFilterType: 4
    }
  }

  UNSAFE_componentWillMount = () => {
    this.props.actions.markUserAlertsViewed(this.props.user);
  }

  clearAlerts = () => {
    this.props.actions.clearAlerts();
    this.props.alerts.forEach(alert => {
      this.props.actions.deleteAlert(this.props.user, alert.id);
    });
  }

  handlePaginationChange = (page, pageSize) => {
    this.props.actions.fetchAlertsWithPagination(this.props.user, page, pageSize);
  }

  handleOnPageSizeChange = (current, size) => {
    this.props.actions.fetchAlertsWithPagination(this.props.user, current, size);
  }

  handleFilterTypeChange = (e) => {
    this.setState({selectedFilterType: int(e.key)})
  }

  handleAlertFilterChange = (filter_parameter) => {
    this.props.actions.fetchAlertsWithPaginationAndFilters(this.props.data.user, this.props.data.pagination.current_page, this.props.data.pagination.per_page, this.props.selectedFilterType, filter_parameter);
  }

  render() {
    if (this.props.alerts.length) {
      var alerts = this.props.alerts.sort((a,b)=>{
        return moment(a.time) - moment(b.time)
      }).reverse();
      return (
        <div>
        <Row type='flex' justify='center'>
          <Form layout={"inline"} onFinish={this.handleAlertFilterChange}>
            <Select
              placeholder="Select Filter Type"
              allowClear={true}
              dropdownMatchSelectWidth={true}
              style={{ width: 150 }}
              onChange={this.handleFilterTypeChange}
              defaultValue={4}
            >
              <Select.Option value={0}>Camera Name</Select.Option>
              <Select.Option value={1}>Camera Group Name</Select.Option>
              <Select.Option value={2}>Trigger Type</Select.Option>
              <Select.Option value={3}>Date/Time Range</Select.Option>
              <Select.Option value={4}>Most Recent</Select.Option>
            </Select>
            <AlertFilters
              data = {this.props}
              selectedFilterType = {this.state.selectedFilterType}
            />
          </Form>
        </Row>
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
            {alerts.map(alert=> (
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
