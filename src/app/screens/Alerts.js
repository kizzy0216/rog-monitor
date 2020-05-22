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
import { fetchCameraGroups } from '../redux/cameraGroups/actions';
import {isEmpty} from '../redux/helperFunctions';

const AlertSortingForm = ({AlertFilterChange, FilterTypeChange, ComponentProperties, selectedFilterType, form}) => {
  return (
    <Form
      layout="inline"
      onFinish={AlertFilterChange}
      style={styles.formstyles}
      initialValues={{filter_type: 4}}
      ref={form}
    >
      <Form.Item
        name="filter_type"
        rules={[{required: true, message: "This field is required"}]}
        hasFeedback
      >
        <Select
          placeholder="Select Filter Type"
          allowClear={false}
          dropdownMatchSelectWidth={true}
          style={{ width: 185 }}
          onChange={FilterTypeChange}
        >
          <Select.Option value={0}>Camera Name</Select.Option>
          <Select.Option value={1}>Camera Group Name</Select.Option>
          <Select.Option value={2}>Trigger Type</Select.Option>
          <Select.Option value={3}>Date/Time Range</Select.Option>
          <Select.Option value={4}>Most Recent</Select.Option>
        </Select>
      </Form.Item>
      <AlertFilters
        data = {ComponentProperties}
        selectedFilterType = {selectedFilterType}
      />
      {selectedFilterType !== 4 ?
        <Form.Item>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      :
        <div></div>
      }
    </Form>
  );
};

// TODO: get existing camera group and camera information and use it to populate a dropdown for the user to select

class Alerts extends Component {
  constructor(props) {
    super(props);

    props.actions.markUserAlertsViewed(props.user);
    this.props.fetchCameraGroups(props.user);

    this.state = {
      videoSource: null,
      open: true,
      selectedFilterType: 4
    }
  }

  clearAlerts = () => {
    this.props.actions.clearAlerts();
    this.props.alerts.forEach(alert => {
      this.props.actions.deleteAlert(this.props.user, alert.id);
    });
  }

  handlePaginationChange = (page, pageSize) => {
    if (page > this.props.pagination.current_page) {
      this.props.actions.fetchAlertsWithPaginationAndFilters(this.props.user, this.props.alerts[0].next_page, page, pageSize, this.state.selectedFilterType, this.form.getFieldsValue()['filter_parameter']);
    } else {
      this.props.actions.fetchAlertsWithPaginationAndFilters(this.props.user, this.props.alerts[0].previous_page, page, pageSize, this.state.selectedFilterType, this.form.getFieldsValue()['filter_parameter']);
    }
  }

  handleOnPageSizeChange = (current, size) => {
    var current_page = (isEmpty(this.props.alerts[0])) ? ">" : this.props.alerts[0].current_page;
    this.props.actions.fetchAlertsWithPaginationAndFilters(this.props.user, current_page, current, size, this.state.selectedFilterType, this.form.getFieldsValue()['filter_parameter']);
  }

  handleFilterTypeChange = (e) => {
    if (this.form.getFieldsValue().hasOwnProperty('filter_parameter') && typeof this.form.getFieldsValue()['filter_parameter'] !== 'undefined') {
      this.form.resetFields(['filter_parameter']);
    }
    this.setState({selectedFilterType: parseInt(e)})
  }

  handleAlertFilterChange = (e) => {
    var current_page = (isEmpty(this.props.alerts[0])) ? ">" : this.props.alerts[0].current_page;
    this.form.validateFields().then(values => {
      this.props.actions.fetchAlertsWithPaginationAndFilters(this.props.user, current_page, this.props.pagination.current_page, this.props.pagination.per_page, this.state.selectedFilterType, values.filter_parameter);
    });
  }

  alertSortingFormRef = (form) => {
    this.form = form;
  };

  render() {
    if (this.props.alerts.length) {
      var alerts = this.props.alerts.sort((a,b)=>{
        return moment(a.time) - moment(b.time)
      }).reverse();
      return (
        <div>
        <Row type='flex' justify='center'>
        <Col xs={{span: 12}}>
          <AlertSortingForm
            form={this.alertSortingFormRef}
            AlertFilterChange={this.handleAlertFilterChange}
            FilterTypeChange={this.handleFilterTypeChange}
            cameraGroups={this.props.cameraGroups}
            selectedFilterType={this.state.selectedFilterType}
          />
        </Col>
        <Col xs={{span: 12}}>
          <Pagination
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            hideOnSinglePage={true}
            showSizeChanger={true}
            onShowSizeChange={this.handleOnPageSizeChange}
            pageSize={this.props.pagination.per_page}
            defaultCurrent={this.props.pagination.current_page}
            total={this.props.pagination.total}
            onChange={this.handlePaginationChange}
            style={styles.pagination}
          />
        </Col>
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
        <div>
          <Row type='flex' justify='center'>
          <AlertSortingForm
            form={this.alertSortingFormRef}
            AlertFilterChange={this.handleAlertFilterChange}
            FilterTypeChange={this.handleFilterTypeChange}
            cameraGroups={this.props.cameraGroups}
            selectedFilterType={this.state.selectedFilterType}
          />
          </Row>
          <Row type='flex' justify='start' style={styles.alertListContainer}>
            <p style={styles.noAlertsText}>
              Things are looking good!
              <br />
              You have no alerts.
            </p>
          </Row>
        </div>
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
  },
  formstyles: {
    textAlign: 'center',
    float: 'left',
    marginLeft: 10
  },
  pagination: {
    float: 'right',
    marginRight: 2
  }
};

const mapStateToProps = (state) => {
  return {
    cameraGroups: state.cameraGroups.cameraGroups,
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
    actions: bindActionCreators(alertActions, dispatch),
    fetchCameraGroups: (user) => dispatch(fetchCameraGroups(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Alerts);
