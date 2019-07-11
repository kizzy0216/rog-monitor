import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as recosActions from '../../redux/recos/actions';
import { Table, Badge, Menu, Dropdown, Icon, Popconfirm, Form, InputNumber, Input, Button, message } from 'antd';
import Highlighter from 'react-highlight-words';
import { isEmpty } from '../../redux/helperFunctions';

class RecosAdmin extends Component {
  constructor(props){
    super(props);

    this.props.actions.readAllRecos();

    this.pollingInterval = setInterval(() => {
      this.props.actions.readAllRecos();
    }, 5000);

    this.columns = [
      {
        title: 'Instance Name',
        dataIndex: 'instance_name',
        key: 'instance_name',
        editable: false,
        width: 200
      },
      {
        title: 'Instance IP Address',
        dataIndex: 'instance_ip_address',
        key: 'instance_ip_address',
        editable: false,
        width: 200
      },
      {
        title: 'Instance CPU Usage',
        dataIndex: 'instance_cpu_usage',
        key: 'instance_cpu_usage',
        editable: false,
        width: 200
      },
      {
        title: 'Instance RAM Usage',
        dataIndex: 'instance_ram_usage',
        key: 'instance_ram_usage',
        editable: false,
        width: 200
      },
      {
        title: 'Instance GPU Name',
        dataIndex: 'instance_gpu_name',
        key: 'instance_gpu_name',
        editable: false,
        width: 200
      },
      {
        title: 'Instance HD Usage',
        dataIndex: 'instance_hd_usage',
        key: 'instance_hd_usage',
        editable: false,
        width: 200
      },
      {
        title: 'Alive VPN',
        dataIndex: 'alive_vpn',
        key: 'alive_vpn',
        editable: false,
        width: 200
      }
    ];

    this.state = {
      dataSource: []
    };
  }


  static getDerivedStateFromProps(nextProps, prevState){
    if (nextProps.getRecosError) {
      message.error(nextProps.getRecosError);
    }
    const data = [];
    if (!isEmpty(nextProps.recos)) {
      for (let i = 0; i < nextProps.recos.length; ++i) {
        data.push({
          key: nextProps.recos[i]['id'],
          instance_name: nextProps.recos[i]['instance_name'],
          instance_ip_address: nextProps.recos[i]['instance_ip_address'],
          instance_cpu_usage: nextProps.recos[i]['instance_cpu_usage'],
          instance_ram_usage: nextProps.recos[i]['instance_ram_usage'],
          instance_gpu_name: nextProps.recos[i]['instance_gpu_name'],
          instance_hd_usage: nextProps.recos[i]['instance_hd_usage'],
          alive_vpn: nextProps.recos[i]['alive_vpn'].toString(),
        });
      }
    }
    return {
      dataSource: data
    };
  }

  componentWillUnmount() {
    clearInterval(this.pollingInterval);
  }

  expandedRowRender = (record, index, indent, expanded) => {
    const columns = [
      {
        title: 'Process Name',
        dataIndex: 'process_name',
        key: 'process_name',
        editable: false,
        width: 200
      },
      {
        title: 'Updated At',
        dataIndex: 'updated_at',
        key: 'updated_at',
        editable: false,
        width: 200
      },
      {
        title: 'Camera Id',
        dataIndex: 'camera_id',
        key: 'camera_id',
        editable: false,
        width: 200
      },
      {
        title: 'Camera Name',
        dataIndex: 'camera_name',
        key: 'camera_name',
        editable: false,
        width: 200
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        editable: false,
        width: 200
      },
      {
        title: 'YOLO JSONS/Second',
        dataIndex: 'yolo_jsons_per_sec',
        key: 'yolo_jsons_per_sec',
        editable: false,
        width: 200
      },
      {
        title: 'Capture Worker FPS',
        dataIndex: 'capture_worker_fps',
        key: 'capture_worker_fps',
        editable: false,
        width: 200
      },
      {
        title: 'Frame Worker FPS',
        dataIndex: 'frame_worker_fps',
        key: 'frame_worker_fps',
        editable: false,
        width: 200
      },
      {
        title: 'Tracker FPS',
        dataIndex: 'tracker_fps',
        key: 'tracker_fps',
        editable: false,
        width: 200
      },
      {
        title: 'Alive Alert Threads',
        dataIndex: 'alive_alert_threads',
        key: 'alive_alert_threads',
        editable: false,
        width: 200
      },
      {
        title: 'Number Of Alerts In The Last Hour',
        dataIndex: 'num_alerts_last_hour',
        key: 'num_alerts_last_hour',
        editable: false,
        width: 200
      }
    ];
    const data = [];
    if (!isEmpty(this.props.recos)) {
      for (let i = 0; i < this.props.recos.length; ++i) {
        if (record['instance_ip_address'] = this.props.recos[i]['instance_ip_address']) {
          data.push({
            key: this.props.recos[i]['process_id'],
            process_name: this.props.recos[i]['process_name'],
            updated_at: this.props.recos[i]['updated_at'],
            camera_id: this.props.recos[i]['cameras_id'],
            camera_name: this.props.recos[i]['camera_name'],
            status: this.props.recos[i]['status'],
            yolo_jsons_per_sec: this.props.recos[i]['yolo_jsons_per_sec'],
            capture_worker_fps: this.props.recos[i]['capture_worker_fps'],
            capture_worker_non_proc_msgs: this.props.recos[i]['capture_worker_non_proc_msgs'],
            frame_worker_fps: this.props.recos[i]['frame_worker_fps'],
            tracker_fps: this.props.recos[i]['tracker_fps'],
            alive_alert_threads: this.props.recos[i]['alive_alert_threads'],
            num_alerts_last_hour: this.props.recos[i]['num_alerts_last_hour']
          });
        }
      }
    }
    if (data !== []) {
      return (
        <EditableTable
          columns={columns}
          data={data}
          record={record}
          user={this.props.user}
          cameraGroupId={this.state.camera_groups_id}
          actions={this.props.actions}
        />
      )
    } else {
      return "";
    }
  }

  render(){
    return (
      <div>
        <Table
          columns={this.columns}
          expandedRowRender={this.expandedRowRender}
          expandRowByClick={true}
          defaultExpandAllRows={true}
          dataSource={this.state.dataSource}
        />
      </div>
    );
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = this.props.columns;

    this.state = {
      dataSource: this.props.data,
      count: this.props.data.length
    };
  }

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
  };

  saveFormRef = (form) => {
    this.form = form;
  };

  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </div>
    );
  }
}

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  state = {
    editing: false,
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: false,
              message: `${title} is required.`,
            },
          ],
          initialValue: record[dataIndex],
        })(<Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />)}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

const styles={
  formstyles: {
    textAlign: 'center'
  }
};

const mapStateToProps = (state) => {
  return {
    recos: state.recos.data,
    getRecosError: state.recos.getRecosError
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(recosActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(RecosAdmin);
