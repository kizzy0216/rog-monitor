import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as InvitationsAdminActions from '../../redux/invites/actions';
import { Form, Input, Button, Table, InputNumber, Popconfirm, Icon, Select, message } from 'antd';
import Highlighter from 'react-highlight-words';

const InvitationsForm = Form.create()(
  (props) => {
    const {handleSubmit, form} = props;
    const {getFieldDecorator} = props.form;

    return (
      <Form layout={'inline'} onSubmit={handleSubmit} style={styles.formstyles}>
        <Form.Item label="User uuid" hasFeedback>
          {getFieldDecorator('user_uuid', {
            rules: [
              {type: 'integer', message: 'Please enter a valid integer'}
            ]
          })(
            <InputNumber placeholder="Enter uuid" />
          )}
        </Form.Item>
        <Form.Item label="Invitation uuid" hasFeedback>
          {getFieldDecorator('invitation_uuid', {
            rules: [
              {type: 'integer', message: 'Please enter a valid integer'}
            ]
          })(
            <InputNumber placeholder="Enter uuid" />
          )}
        </Form.Item>
        <Form.Item label="Email" hasFeedback>
          {getFieldDecorator('email', {
            rules: [
              {type: 'email', message: 'Please enter a valid email.'}
            ]
          })(
            <Input placeholder="Enter Email" />
          )}
        </Form.Item>
        <Form.Item label="Type">
          {getFieldDecorator('type', {
            rules: []
          })(
            <Select
              placeholder="Select Type"
              allowClear={true}
              dropdownMatchSelectWidth={true}
              style={{ width: 150 }}
            >
              <Select.Option value="share_group">Share Group</Select.Option>
              <Select.Option value="forgot_password">Forgot Password</Select.Option>
              <Select.Option value="register">Register</Select.Option>
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    );
  }
);

class InvitationsAdmin extends Component {
  constructor(props){
    super(props);

    this.state={}
  }

  static getDerivedStateFromProps(nextProps, prevState){
    if (nextProps.fetchReceivedError !== '') {
      message.error(nextProps.fetchReceivedError);
    }
    if (nextProps.updateInvitationError !== '') {
      message.error(nextProps.updateInvitationError);
    }
    if (nextProps.deleteInvitationError !== '') {
      message.error(nextProps.deleteInvitationError);
    }
    return null;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.form.validateFields((err, values) => {
      if (!err) {
        this.props.actions.fetchUserInvites(values);
      }
    });

  };

  saveFormRef = (form) => {
    this.form = form;
  };

  render(){
    const data = [];
    if (this.props.invites !== null) {
      for (var i = 0; i < this.props.invites.length; i++) {
        data[i] = {
          key: this.props.invites[i]['uuid'],
          uuid: this.props.invites[i]['uuid'],
          users_uuid: this.props.invites[i]['users_uuid'],
          email: this.props.invites[i]['email'],
          type: this.props.invites[i]['type'],
          action: this.props.invites[i]['action'],
          status: this.props.invites[i]['status']
        }
      }
      return(
        <div>
          <InvitationsForm
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
        <InvitationsForm
          ref={this.saveFormRef}
          handleSubmit={this.handleSubmit}
        />
      )
    }
  }
}

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.dataIndex === 'type'){
      return <Select placeholder="Select Type" allowClear={true} dropdownMatchSelectWidth={true} style={{ width: 150 }}><Select.Option value="share_group">Share Group</Select.Option><Select.Option value="forgot_password">Forgot Password</Select.Option><Select.Option value="register">Register</Select.Option></Select>;
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
        title: 'Invitation Uuid',
        dataIndex: 'uuid',
        editable: false,
        sorter: (a, b) => a.uuid - b.uuid,
        sortDirections: ['descend', 'ascend'],
        width: 150
      },
      {
        title: 'User uuid',
        dataIndex: 'user_uuid',
        editable: false,
        sorter: (a, b) => a.user_uuid - b.user_uuid,
        sortDirections: ['descend', 'ascend'],
        width: 100
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
        title: 'Type',
        dataIndex: 'type',
        editable: true,
        ...this.getColumnSearchProps('type'),
        sorter: (a, b) => { return a.type.localeCompare(b.type)},
        sortDirections: ['descend', 'ascend'],
        width: 200
      },
      {
        title: 'Action',
        dataIndex: 'action',
        editable: true,
        sorter: (a, b) => { return a.action.localeCompare(b.action)},
        sortDirections: ['descend', 'ascend'],
        width: 300
      },
      {
        title: 'Status',
        dataIndex: 'status',
        editable: false,
        ...this.getColumnSearchProps('status'),
        sorter: (a, b) => { return a.status.localeCompare(b.status)},
        sortDirections: ['descend', 'ascend'],
        width: 200
      },
      {
        title: 'operation',
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
        this.props.actions.updateInvitation(newItem);
      }
    });
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  delete(key) {
    const dataSource = [...this.state.data];
    this.setState({ data: dataSource.filter(item => item.key !== key) });
    this.props.actions.deleteInvitation(key);
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
    invites: state.invites.invites,
    fetchReceivedError: state.invites.fetchReceivedError,
    updateInvitationError: state.invites.updateInvitationError,
    deleteInvitationError: state.invites.deleteInvitationError
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(InvitationsAdminActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(InvitationsAdmin);
