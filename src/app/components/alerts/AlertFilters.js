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
            <Select style={{width: 250}} placeholder="select a camera">
              {this.props.cameraGroups.map(cameraGroup => (
                cameraGroup.hasOwnProperty('cameras') ?
                cameraGroup.cameras.map(camera => (
                  <Select.Option key={`camera-${camera.id}`} value={camera.name}>{camera.name}</Select.Option>
                )) : ''
              ))}
            </Select>
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
            <Select style={{width: 250}} placeholder="select a camera group">
              {this.props.cameraGroups.map(cameraGroup => (
                <Select.Option key={`cameragroup-${cameraGroup.id}`} value={cameraGroup.name}>{cameraGroup.name}</Select.Option>
              ))}
            </Select>
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
  return {
    cameraGroups: state.cameraGroups.cameraGroups
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(alertActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AlertFilters);
