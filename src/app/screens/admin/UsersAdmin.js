import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as usersActions from '../../redux/users/actions';
import { isEmpty } from '../../redux/helperFunctions';
import { Form, Input, Button, Table, InputNumber, Popconfirm, Icon, Select, message } from 'antd';
import Highlighter from 'react-highlight-words';

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
        <Form.Item label="Email" hasFeedback>
          {getFieldDecorator('email', {
            rules: [
              {type: 'string', message: 'Please enter a valid string'}
            ]
          })(
            <Input placeholder="Enter Email" />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    );
  }
);

class UsersAdmin extends Component {
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
        if (values.email !== undefined) {
          this.props.actions.readUserByEmailAdmin(values);
        } else {
          this.props.actions.readUserByIdAdmin(values);
        }
      }
    });
    this.form.resetFields();
  };

  saveFormRef = (form) => {
    this.form = form;
  };

  render(){
    const data = [];
    if (!isEmpty(this.props.userData)) {
      for (var i = 0; i < this.props.userData.length; i++) {
        data[i] = {
          key: this.props.userData[i]['id'],
          id: this.props.userData[i]['id'],
          email: this.props.userData[i]['email'],
          first_name: this.props.userData[i]['first_name'],
          last_name: this.props.userData[i]['last_name'],
          enabled: this.props.userData[i]['enabled'].toString(),
          user_privileges_ids: this.props.userData[i]['user_privileges_ids'],
          mute: this.props.userData[i]['mute'].toString()
        }
      }
      return(
        <div>
          <UsersForm
            ref={this.saveFormRef}
            handleSubmit={this.handleSubmit}
          />
          <EditableFormTable
            data={data}
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

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.dataIndex === 'enabled' || this.props.dataIndex === 'mute'){
      return <Select placeholder="true or false" allowClear={true} dropdownMatchSelectWidth={true} style={{ width: 80 }}><Select.Option value={true}>true</Select.Option><Select.Option value={false}>false</Select.Option></Select>;
    }
    if (this.props.dataIndex === 'user_privileges_ids') {
      return <Select placeholder="Select Privilege" allowClear={true} dropdownMatchSelectWidth={true} style={{ width: 80 }}><Select.Option value={0}>admin</Select.Option><Select.Option value={1}>reco</Select.Option><Select.Option value={2}>user</Select.Option></Select>;
    }
    if (this.props.inputType === 'text') {
      return <Input />;
    }
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      editingKey: '',
      searchText: ''
    }

    this.columns = [
      {
        title: 'User id',
        dataIndex: 'id',
        editable: false,
        sorter: (a, b) => a.id - b.id,
        sortDirections: ['descend', 'ascend'],
        width: 150
      },
      {
        title: 'Email',
        dataIndex: 'email',
        editable: true,
        ...this.getColumnSearchProps('email'),
        sorter: (a, b) => { return a.email.localeCompare(b.email)},
        sortDirections: ['descend', 'ascend']
      },
      {
        title: 'First Name',
        dataIndex: 'first_name',
        editable: true,
        ...this.getColumnSearchProps('first_name'),
        sorter: (a, b) => { return a.first_name.localeCompare(b.first_name)},
        sortDirections: ['descend', 'ascend'],
        width: 200
      },
      {
        title: 'Last Name',
        dataIndex: 'last_name',
        editable: true,
        ...this.getColumnSearchProps('last_name'),
        sorter: (a, b) => { return a.last_name.localeCompare(b.last_name)},
        sortDirections: ['descend', 'ascend'],
        width: 200
      },
      {
        title: 'Enabled',
        dataIndex: 'enabled',
        editable: true,
        width: 150
      },
      {
        title: 'User Privileges Id',
        dataIndex: 'user_privileges_ids',
        editable: true,
        width: 150
      },
      {
        title: 'Mute',
        dataIndex: 'mute',
        editable: true,
        width: 150
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        width: 150,
        fixed: 'right',
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <Popconfirm title="Save changes?" onConfirm={() => this.save(form, record.key)}>
                    <a
                      href="javascript:;"
                      style={{ marginRight: 8 }}
                    >
                      Save
                    </a>
                  </Popconfirm>
                )}
              </EditableContext.Consumer>
              <a onClick={() => this.cancel(record.key)}>Cancel</a>
            </span>
          ) : (
            <div>
              <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)} style={{ marginRight: 8 }}>
                Edit
              </a>
              <Popconfirm title="delete record?" onConfirm={() => this.delete(record.key)}>
                <a
                  href="javascript:;"
                  style={{ marginRight: 8 }}
                >
                  Delete
                </a>
              </Popconfirm>
            </div>
          );
        },
      },
    ];
  }

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    ),
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  isEditing = record => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: '' });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        const newItem = newData[index];
        this.setState({ data: newData, editingKey: '' });
        this.props.actions.updateUserAdmin(newItem);
      }
    });
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  delete(key) {
    const dataSource = [...this.state.data];
    this.setState({ data: dataSource.filter(item => item.key !== key) });
    this.props.actions.deleteUserAdmin(key);
  };

  render() {
    const components = {
      body: {
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
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });
    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
          components={components}
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
          scroll={{ x: 1300, y: '90vh' }}
        />
      </EditableContext.Provider>
    );
  }
}

const EditableFormTable = Form.create()(EditableTable);

const styles={
  formstyles: {
    textAlign: 'center'
  }
};

const mapStateToProps = (state) => {
  return {
    userData: state.users.userData,
    updateUserError: state.users.updateUserError,
    updateUserInProgress: state.users.updateUserInProgress,
    updateUserSuccess: state.users.updateUserSuccess
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(usersActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersAdmin);
