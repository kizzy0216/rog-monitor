import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as cameraGroupsActions from '../../redux/cameraGroups/actions';
import { Table, Input, Button, Popconfirm, Form, InputNumber, message } from 'antd';
import { isEmpty } from '../../redux/helperFunctions';

const UsersForm = Form.create()(
  (props) => {
    const {handleSubmit, form} = props;
    const {getFieldDecorator} = props.form;

    return (
      <Form layout={'inline'} onSubmit={handleSubmit} style={styles.formstyles}>
        <Form.Item label="User id" hasFeedback>
          {getFieldDecorator('user_id', {
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

class CameraGroupsAdmin extends Component {
  constructor(props) {
    super(props);

    this.state={}
  }

  static getDerivedStateFromProps(nextProps, prevState){
    if (nextProps.editCameraGroupError !== '') {
      message.error(nextProps.editCameraGroupError);
    }
    return null;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.form.validateFields((err, values) => {
      if (!err) {
        this.props.actions.readAllCameraGroupsForUser(values);
      }
    });
  }

  saveFormRef = (form) => {
    this.form = form;
  };

  render(){
    const data = [];
    if (!isEmpty(this.props.cameraGroups)) {
      for (var i = 0; i < this.props.cameraGroups.length; i++) {
        data[i] = {
          key: this.props.cameraGroups[i]['id'],
          id: this.props.cameraGroups[i]['id'],
          name: this.props.cameraGroups[i]['name'],
          vacation_mode: this.props.cameraGroups[i]['vacation_mode'].toString()
        }
      }
      return(
        <div>
          <UsersForm
            ref={this.saveFormRef}
            handleSubmit={this.handleSubmit}
          />
          <EditableTable
            data={data}
            userData={this.props.userData}
            actions={this.props.actions}
          />
        </div>
      )
    } else {
      return(
        <div>
          <UsersForm
            ref={this.saveFormRef}
            handleSubmit={this.handleSubmit}
          />
        </div>
      )
    }
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

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'Id',
        dataIndex: 'id',
        width: 200,
        editable: false,
        defaultSortOrder: 'descend',
        sorter:(a, b) => a.id - b.id,
        sortDirections: ['descend', 'ascend']
      },
      {
        title: 'Name',
        dataIndex: 'name',
        width: 200,
        editable: true
      },
      {
        title: 'Vacation Mode',
        dataIndex: 'vacation_mode',
        width: 300,
        editable: true
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        width: 200,
        render: (text, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
              <a href="javascript:;">Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];

    this.state = {
      dataSource: this.props.data,
      count: this.props.data.length,
    };
  }

  handleDelete = key => {
    const dataSource = [...this.state.dataSource];
    this.props.actions.deleteCameraGroup(this.props.userData, dataSource.filter(item => item.key == key)[0]);
  };

  handleAdd = () => {
    this.props.actions.createCameraGroup(this.props.userData);
  };

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
    this.props.actions.updateCameraGroup(this.props.userData, newData[index]);
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
        <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
          Add a row
        </Button>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
          scroll={{ y: 500 }}
        />
      </div>
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
    userData: state.users.userData,
    cameraGroups: state.cameraGroups.cameraGroupsAdmin,
    editCameraGroupError: state.cameraGroups.editCameraGroupError
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(cameraGroupsActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraGroupsAdmin);
