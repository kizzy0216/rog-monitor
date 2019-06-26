import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as triggersActions from '../../redux/triggers/actions';
import { Table, Badge, Menu, Dropdown, Icon, Popconfirm, Form, InputNumber, Input, Button, message } from 'antd';
import Highlighter from 'react-highlight-words';
import { isEmpty } from '../../redux/helperFunctions';

const UsersForm = Form.create()(
  (props) => {
    const {handleSubmit, form} = props;
    const {getFieldDecorator} = props.form;

    return (
      <Form layout={'inline'} onSubmit={handleSubmit} style={styles.formstyles}>
        <Form.Item label="Camera Group id" hasFeedback>
          {getFieldDecorator('camera_groups_id', {
            rules: [
              {type: 'integer', message: 'Please enter a valid integer'}
            ]
          })(
            <InputNumber placeholder="Enter id" />
          )}
        </Form.Item>
        <Form.Item label="Camera Id" hasFeedback>
          {getFieldDecorator('cameras_id', {
            rules: [
              {type: 'integer', message: 'Please enter a valid integer'}
            ]
          })(
            <InputNumber placeholder="Enter id" />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    );
  }
);

class TriggersAdmin extends Component {
  constructor(props){
    super(props);

    this.columns = [
      {
        title: 'Trigger Id',
        dataIndex: 'id',
        key: 'id',
        editable: false,
        width: 200
      },
      {
        title: 'Base Triggers Id',
        dataIndex: 'base_triggers_id',
        key: 'base_triggers_id',
        editable: false,
        width: 200
      },
      {
        title: 'Users Id',
        dataIndex: 'users_id',
        key: 'users_id',
        editable: false,
        width: 200
      },
      {
        title: 'Cameras Id',
        dataIndex: 'cameras_id',
        key: 'cameras_id',
        editable: false,
        width: 200
      },
      {
        title: 'Trigger Type',
        dataIndex: 'trigger_type',
        key: 'trigger_type',
        editable: false,
        width: 200
      },
      {
        title: 'Target Type',
        dataIndex: 'target_type',
        key: 'target_type',
        editable: false,
        width: 200
      },
      {
        title: 'Trigger Duration',
        dataIndex: 'trigger_duration',
        key: 'trigger_duration',
        editable: false,
        width: 200
      },
      {
        title: 'Direction',
        dataIndex: 'direction',
        key: 'direction',
        editable: false,
        width: 200
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        width: 200,
        render: (text, record) =>
          <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDeleteTrigger(record.key)}>
            <a href="javascript:;">Delete</a>
          </Popconfirm>
      }
    ];

    this.state = {
      dataSource: []
    };
  }


  static getDerivedStateFromProps(nextProps, prevState){
    if (nextProps.fetchTriggerErrorAdmin) {
      message.error(nextProps.fetchTriggerErrorAdmin);
    }
    const data = [];
    if (!isEmpty(nextProps.triggers)) {
      for (let i = 0; i < nextProps.triggers.length; ++i) {
        data.push({
          key: nextProps.triggers[i]['id'],
          id: nextProps.triggers[i]['id'],
          base_triggers_id: nextProps.triggers[i]['base_trigger']['id'],
          users_id: nextProps.triggers[i]['users_id'],
          cameras_id: nextProps.triggers[i]['cameras_id'],
          trigger_type: nextProps.triggers[i]['base_trigger']['trigger_type'],
          target_type: nextProps.triggers[i]['base_trigger']['target_type'],
          trigger_duration: nextProps.triggers[i]['base_trigger']['trigger_duration'],
          direction: nextProps.triggers[i]['base_trigger']['direction']
        });
      }
    }
    return {
      dataSource: data
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.form.validateFields((err, values) => {
      if (!err) {
        this.setState({camera_groups_id: values.camera_groups_id});
        this.setState({cameras_id: values.cameras_id});
        this.props.actions.fetchTriggersAdmin(this.props.user, values);
      }
    });
  }

  handleDeleteTrigger = key => {
    const dataSource = [...this.state.dataSource];
    this.props.actions.deleteTriggerAdmin(this.props.user, dataSource.filter(item => item.key == key)[0], this.state.cameras_id, this.props.cameraGroupId);
  };

  handleDeleteTriggerTimeWindow = record => {
    this.props.actions.deleteTriggerTimeWindowAdmin(this.props.user, record, this.state.cameras_id, this.props.cameraGroupId);
  };

  formRef = (form) => {
    this.form = form;
  };

  expandedRowRender = (record, index, indent, expanded) => {
    const columns = [
      {
        title: 'Trigger Time Window Id',
        dataIndex: 'id',
        key: 'id',
        editable: false,
        width: 200
      },
      {
        title: 'Trigger Id',
        dataIndex: 'triggers_id',
        key: 'triggers_id',
        editable: false,
        width: 200
      },
      {
        title: 'Days Of Week',
        key: 'days_of_week',
        dataIndex: 'days_of_week',
        editable: true,
        width: 400
      },
      {
        title: 'Start At',
        dataIndex: 'start_at',
        key: 'start_at',
        editable: true,
        width: 200
      },
      {
        title: 'End At',
        dataIndex: 'end_at',
        key: 'end_at',
        editable: true,
        width: 200
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        width: 200,
        render: (text, record) =>
          <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDeleteTriggerTimeWindow(record)}>
            <a href="javascript:;">Delete</a>
          </Popconfirm>
      }
    ];
    const data = [];
    if (typeof this.props.triggers[index].time_windows !== "undefined") {
      for (let i = 0; i < this.props.triggers[index].time_windows.length; ++i) {
        data.push({
          key: this.props.triggers[index].time_windows[i]['id'],
          id: this.props.triggers[index].time_windows[i]['id'],
          triggers_id: this.props.triggers[index].time_windows[i]['triggers_id'],
          days_of_week: this.props.triggers[index].time_windows[i]['days_of_week'],
          start_at: this.props.triggers[index].time_windows[i]['start_at'],
          end_at: this.props.triggers[index].time_windows[i]['end_at']
        });
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
    if (!isEmpty(this.state.dataSource)) {
      return (
        <div>
          <UsersForm
            ref={this.formRef}
            handleSubmit={this.handleSubmit}
          />
          <Table
            columns={this.columns}
            expandedRowRender={this.expandedRowRender}
            dataSource={this.state.dataSource}
          />
        </div>
      );
    } else {
      return (
        <UsersForm
          ref={this.formRef}
          handleSubmit={this.handleSubmit}
        />
      )
    }


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
    this.setState({ dataSource: newData });
    this.props.actions.updateTriggerTimeWindowAdmin(this.props.user, newData[index], this.props.record, this.props.cameraGroupId);
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
    user: state.auth.user,
    triggers: state.triggers.polygonDataAdmin,
    fetchTriggerErrorAdmin: state.triggers.fetchTriggerErrorAdmin
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(triggersActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(TriggersAdmin);
