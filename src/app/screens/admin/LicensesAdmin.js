import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as usersActions from '../../redux/users/actions';
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

class LicensesAdmin extends Component {
  constructor(props) {
    super(props);

    this.state={}
  }

  static getDerivedStateFromProps(nextProps, prevState){
    if (nextProps.updateUserError !== '') {
      message.error(nextProps.updateUserError);
    }
    return null;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.form.validateFields((err, values) => {
      if (!err) {
        this.props.actions.readUserCameraLicensesAdmin(values);
      }
    });
  }

  saveFormRef = (form) => {
    this.form = form;
  };

  render(){
    const data = [];
    if (!isEmpty(this.props.cameraLicenseData)) {
      for (var i = 0; i < this.props.cameraLicenseData.length; i++) {
        data[i] = {
          key: this.props.cameraLicenseData[i]['id'],
          id: this.props.cameraLicenseData[i]['id'],
          cameras_id: this.props.cameraLicenseData[i]['cameras_id'],
          tier_0: this.props.cameraLicenseData[i]['tier_0'],
          tier_1: this.props.cameraLicenseData[i]['tier_1'],
          tier_2: this.props.cameraLicenseData[i]['tier_2']
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
        })(<InputNumber ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />)}
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
        title: 'Cameras Id',
        dataIndex: 'cameras_id',
        width: 200,
        editable: true,
        defaultSortOrder: 'descend',
        sorter:(a, b) => a.cameras_id - b.cameras_id,
        sortDirections: ['descend', 'ascend']
      },
      {
        title: 'Tier 0',
        dataIndex: 'tier_0',
        width: 200,
        editable: true,
        defaultSortOrder: 'descend',
        sorter:(a, b) => a.tier_0 - b.tier_0,
        sortDirections: ['descend', 'ascend']
      },
      {
        title: 'Tier1',
        dataIndex: 'tier_1',
        width: 200,
        editable: true,
        defaultSortOrder: 'descend',
        sorter:(a, b) => a.tier_1 - b.tier_1,
        sortDirections: ['descend', 'ascend']
      },
      {
        title: 'Tier 2',
        dataIndex: 'tier_2',
        width: 200,
        editable: true,
        defaultSortOrder: 'descend',
        sorter:(a, b) => a.tier_2 - b.tier_2,
        sortDirections: ['descend', 'ascend']
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
    this.props.actions.deleteUserLicenseAdmin(this.props.userData, dataSource.filter(item => item.key == key)[0]);
  };

  handleAdd = () => {
    this.props.actions.createUserLicense(this.props.userData, 1);
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
    this.props.actions.updateUserLicense(this.props.userData, newData[index]);
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
    cameraLicenseData: state.users.cameraLicenseData,
    updateUserError: state.users.updateUserError,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(usersActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(LicensesAdmin);
