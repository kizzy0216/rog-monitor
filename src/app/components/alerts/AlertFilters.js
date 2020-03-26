import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col, Button, DatePicker, Select, Form, Input } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import * as alertActions from '../../redux/alerts/actions';

const { RangePicker } = DatePicker;

const rangeConfig = {
  rules: [
    {
      type: 'array',
      required: true,
      message: 'Please select a time!',
    },
  ],
};

class AlertFilters extends Component {
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    switch (this.props.selectedFilterType) {
      case 0:
        return (
          <Form.Item
            hasFeedback
            name="filter_parameter"
            rules={[
              {required: true, message: "This field is required"}
            ]}
          >
            <Input placeholder="Camera Name" />
          </Form.Item>
        )
        break;
      case 1:
        return (
          <Form.Item
            hasFeedback
            name="filter_parameter"
            rules={[
              {required: true, message: "This field is required"}
            ]}
          >
            <Input placeholder="Camera Group Name" />
          </Form.Item>
        )
        break;
      case 2:
        return (
          <Form.Item
            hasFeedback
            name="filter_parameter"
            rules={[
              {required: true, message: "This field is required"}
            ]}
          >
            <Select
              placeholder="Select Trigger Type"
              allowClear={false}
              dropdownMatchSelectWidth={true}
              style={{ width: 150 }}
            >
              <Select.Option value="RA">Restricted Area</Select.Option>
              <Select.Option value="VW">Virtual Wall</Select.Option>
              <Select.Option value="LD">Loitering Detection</Select.Option>
            </Select>
          </Form.Item>
        )
        break;
      case 3:
        return (
          <Form.Item
            {...rangeConfig}
            hasFeedback
            name="filter_parameter"
            rules={[
              {required: true, message: "This field is required"}
            ]}
          >
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
        )
        break;
      default:
        return (
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Most Recent Alerts
            </ Button>
          </Form.Item>
        )
    }
  }
}

const styles = {};

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(alertActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AlertFilters);
