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
          <div>
            <Form.Item>
              <Input placeholder="Camera Name" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
          </div>
        )
        break;
      case 1:
        return (
          <div>
            <Form.Item>
              <Input placeholder="Camera Group Name" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
          </div>
        )
        break;
      case 2:
        return (
          <div>
            <Form.Item>
              <Select
                placeholder="Select Trigger Type"
                allowClear={true}
                dropdownMatchSelectWidth={true}
                style={{ width: 150 }}
              >
                <Select.Option value="RA">Restricted Area</Select.Option>
                <Select.Option value="VW">Virtual Wall</Select.Option>
                <Select.Option value="LD">Loitering Detection</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
          </div>
        )
        break;
      case 3:
        return (
          <div>
            <Form.Item name="range-time-picker" label="RangePicker[showTime]" {...rangeConfig}>
              <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
          </div>
        )
        break;
      default:
        return (
          <div>
            <Form.Item>
              <Button type="primary" htmlType="submit" value={null}>
                Most Recent Alerts
              </ Button>
            </Form.Item>
          </div>
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
