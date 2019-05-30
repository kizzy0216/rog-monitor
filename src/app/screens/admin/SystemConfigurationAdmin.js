import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as systemConfigurationActions from '../../redux/systemConfiguration/actions';
import { Table, Input, InputNumber, Popconfirm, Form, Button, Icon } from 'antd';
import Highlighter from 'react-highlight-words';

class SystemConfigurationAdmin extends Component {
  constructor(props) {
    super(props);

    this.props.actions.readSystemConfigurations();

    this.state={}
  }

  render(){
    const data = [];
    if (this.props.systemConfigurations !== null) {
      for (var i = 0; i < this.props.systemConfigurations.length; i++) {
        data[i] = {
          key: this.props.systemConfigurations[i]['id'],
          name: this.props.systemConfigurations[i]['key'],
          value: this.props.systemConfigurations[i]['value']
        }
      }
      return(
        <EditableFormTable data={data} actions={this.props.actions} />
      )
    } else {
      return(
        <EditableFormTable data={""} actions={this.props.actions} />
      )
    }
  }
}

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber />;
    }
    return <Input />;
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
        title: 'name',
        dataIndex: 'name',
        width: '33%',
        editable: false,
        ...this.getColumnSearchProps('name'),
        sorter: (a, b) => { return a.name.localeCompare(b.name)},
        sortDirections: ['descend', 'ascend']
      },
      {
        title: 'value',
        dataIndex: 'value',
        width: '34%',
        editable: true,
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        width: '33%',
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
            <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)}>
              Edit
            </a>
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
        this.props.actions.updateSystemConfiguration(newItem['key'], newItem['name'], newItem['value'])
      }
    });
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

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
          inputType: col.dataIndex === 'text',
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
          scroll={{ y: '90vh' }}
        />
      </EditableContext.Provider>
    );
  }
}

const EditableFormTable = Form.create()(EditableTable);

const styles={};

const mapStateToProps = (state) => {
  return {
    systemConfigurations: state.systemConfigurations.data
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(systemConfigurationActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SystemConfigurationAdmin);
