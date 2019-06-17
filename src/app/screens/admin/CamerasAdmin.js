import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as camerasActions from '../../redux/cameras/actions';
import { Table, Input, Button, Popconfirm, Form, InputNumber, message, Radio, Modal, Icon } from 'antd';
import { isEmpty } from '../../redux/helperFunctions';
import Highlighter from 'react-highlight-words';
import RtspStream from '../../components/video/RtspStream';

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
        <Form.Item>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    );
  }
);

const AddCameraForm = Form.create()(
  (props) => {
    const {visible, onCancel, onCreate, form} = props;
    const {getFieldDecorator} = form;

    return (
      <Modal title='Add a Camera'
        visible={visible}
        onCancel={onCancel}
        onOk={onCreate}
        okText='Add'
        cancelText='Cancel'
        confirmLoading={props.addCameraInProcess}
      >
        <Form>
          <Form.Item style={styles.videoContainer}>
            {props.fullRtspUrl ?
              (<RtspStream rtspUrl={props.fullRtspUrl} />) :
              (
                <p style={styles.videoContainerText}>
                  {props.addCameraInProcess ? 'Adding camera' : 'No Video Available'}
                </p>
              )
            }
          </Form.Item>
          <Form.Item hasFeedback>
            <Button key='submit' type='primary' size='large' onClick={props.testLiveView}>
              <Icon type='reload'></Icon>Test Live View
            </Button>
            <div style={styles.error}>{props.addCameraError}</div>
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('camera_name', {rules: [
                {required: true, message: 'Please input the camera name'}
              ]
            })(
              <Input placeholder='Enter camera name'/>
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('camera_url', {rules: [
                {required: true, message: 'Please enter the camera URL'}
              ]
            })(
              <Input placeholder='Enter Camera URL'/>
            )}

          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('username', {
              rules: [
                {required: false, message: 'Please enter the camera username'}
              ]
            })(
              <Input placeholder='Enter camera username'/>
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator('password', {
              rules: [
                {required: false, message: 'Please enter the camera password'}
              ]
            })(
              <Input type='password' placeholder='Enter camera password'/>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

class CamerasAdmin extends Component {
  constructor(props) {
    super(props);

    this.state={
      visible: false
    }
  }

  static getDerivedStateFromProps(nextProps, prevState){
    if (nextProps.editCameraError !== '') {
      message.error(nextProps.editCameraError);
    }
    if (nextProps.addCameraError !== '') {
      message.error(nextProps.addCameraError);
    }
    return null;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.form.validateFields((err, values) => {
      if (!err) {
        this.setState({camera_groups_id: values.camera_groups_id});
        this.props.actions.readCamerasInGroupAdmin(this.props.user, values);
      }
    });
  }

  cameraGroupFormRef = (form) => {
    this.form = form;
  };

  addCameraFormRef = formRef => {
    this.formRef = formRef;
  };

  showModal = () => {
    if (typeof this.state.camera_groups_id !== "undefined") {
      this.setState({ visible: true });
    }
  };

  handleCancel = () => {
    this.resetFields();
    this.setState({ visible: false });
  };

  resetFields = () => {
    this.formRef.resetFields();
    this.setState({fullRtspUrl: null});
  };

  getFullRtspUrl = (camera_url, username, password) => {
    let index = camera_url.indexOf(":");
    let protocol = camera_url.substr(0, index + 3).toLowerCase();
    let urlAddress = camera_url.substr(index + 3);
    let lowerCaseUrl = (protocol + `${username}:${password}@` + urlAddress);
    return lowerCaseUrl;
  }

  testLiveView = () => {
    let isChrome = window.chrome || window.chrome.webstore;
    let isFirefox = typeof InstallTrigger !== 'undefined';
    let isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    if (!isChrome && !isFirefox && !isOpera) {
      alert('Sorry, live video requires the desktop Chrome, Firefox, or Opera web browser.');
    } else {
      const form = this.formRef;
      form.validateFields(['camera_url', 'username', 'password'], (err, values) => {
        if (err) return;

        this.setState({fullRtspUrl: null}, () => {
          this.setState({fullRtspUrl: this.getFullRtspUrl(values.camera_url, values.username, values.password)});
        });
      })
    }
  }

  handleCreate = () => {
    if (typeof this.state.camera_groups_id !== "undefined") {
      const form = this.formRef;
      form.validateFields((err, values) => {
        if (err) return;
        values.camera_groups_id = this.state.camera_groups_id;
        this.props.actions.createCameraAdmin(this.props.user, values);
        this.setState({ visible: false });
        form.resetFields();
      });
    }
  };

  render(){
    const data = [];
    if (!isEmpty(this.props.cameras)) {
      for (var i = 0; i < this.props.cameras.length; i++) {
        data[i] = {
          key: this.props.cameras[i]['id'],
          id: this.props.cameras[i]['id'],
          camera_groups_id: this.props.cameras[i]['camera_groups_id'],
          name: this.props.cameras[i]['name'],
          time_zone: this.props.cameras[i]['time_zone'],
          username: this.props.cameras[i]['username'],
          camera_url: this.props.cameras[i]['camera_url'],
          reco_camera_url: this.props.cameras[i]['reco_camera_url'],
          thumbnail_url: this.props.cameras[i]['thumbnail_url'],
          tags: this.props.cameras[i]['tags'],
          address1: this.props.cameras[i]['address1'],
          address2: this.props.cameras[i]['address2'],
          city: this.props.cameras[i]['city'],
          state: this.props.cameras[i]['state'],
          zip: this.props.cameras[i]['zip'],
          longitude: this.props.cameras[i]['longitude'],
          latitude: this.props.cameras[i]['latitude'],
          vacation_mode: this.props.cameras[i]['vacation_mode'].toString(),
          enabled: this.props.cameras[i]['enabled'].toString(),
          magic_camera_box: this.props.cameras[i]['magic_camera_box'].toString()
        }
      }

      return(
        <div>
          <UsersForm
            ref={this.cameraGroupFormRef}
            handleSubmit={this.handleSubmit}
          />
          <Button onClick={this.showModal} type="primary" style={{ marginBottom: 16 }}>
            Add a Camera
          </Button>
          <AddCameraForm
            ref={this.addCameraFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
            testLiveView={this.testLiveView}
            fullRtspUrl={this.state.fullRtspUrl}
            addCameraError={this.props.addCameraError}
            addCameraInProcess={this.props.addCameraInProcess}
          />
          <EditableTable
            data={data}
            user={this.props.user}
            actions={this.props.actions}
          />
        </div>
      )
    } else {
      return(
        <div>
          <UsersForm
            ref={this.cameraGroupFormRef}
            handleSubmit={this.handleSubmit}
          />
          <Button onClick={this.showModal} type="primary" style={{ marginBottom: 16 }}>
            Add a Camera
          </Button>
          <AddCameraForm
            ref={this.addCameraFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
            testLiveView={this.testLiveView}
            fullRtspUrl={this.state.fullRtspUrl}
            addCameraError={this.props.addCameraError}
            addCameraInProcess={this.props.addCameraInProcess}
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
        title: 'Camera Group Id',
        dataIndex: 'camera_groups_id',
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
        editable: true,
        ...this.getColumnSearchProps('name'),
        sorter: (a, b) => { return a.name.localeCompare(b.name)},
        sortDirections: ['descend', 'ascend']
      },
      {
        title: 'Time Zone',
        dataIndex: 'time_zone',
        width: 300,
        editable: true
      },
      {
        title: 'Username',
        dataIndex: 'username',
        width: 200,
        editable: true
      },
      {
        title: 'Camera URL',
        dataIndex: 'camera_url',
        width: 300,
        editable: false
      },
      {
        title: 'Reco Camera URL',
        dataIndex: 'reco_camera_url',
        width: 200,
        editable: false
      },
      {
        title: 'Thumbnail URL',
        dataIndex: 'thumbnail_url',
        width: 200,
        editable: false
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        editable: false
      },
      {
        title: 'Addresss Line 1',
        dataIndex: 'address1',
        width: 300,
        editable: true
      },
      {
        title: 'Address Line 2',
        dataIndex: 'address2',
        width: 300,
        editable: true
      },
      {
        title: 'City',
        dataIndex: 'city',
        width: 300,
        editable: true
      },
      {
        title: 'State',
        dataIndex: 'state',
        width: 300,
        editable: true
      },
      {
        title: 'Zip',
        dataIndex: 'zip',
        width: 300,
        editable: true
      },
      {
        title: 'Longitude',
        dataIndex: 'longitude',
        width: 300,
        editable: true
      },
      {
        title: 'Latitude',
        dataIndex: 'latitude',
        width: 300,
        editable: true
      },
      {
        title: 'Vacation Mode',
        dataIndex: 'vacation_mode',
        width: 300,
        editable: true
      },
      {
        title: 'Enabled',
        dataIndex: 'enabled',
        width: 300,
        editable: true
      },
      {
        title: 'Magic Camera Box',
        dataIndex: 'magic_camera_box',
        width: 300,
        editable: false
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        width: 200,
        fixed: 'right',
        render: (text, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
              <a href="javascript:;">Delete</a>
            </Popconfirm>
          ) : null
      }
    ];

    this.state = {
      dataSource: this.props.data,
      count: this.props.data.length
    };
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

  handleDelete = key => {
    const dataSource = [...this.state.dataSource];
    this.props.actions.deleteCameraAdmin(this.props.user, dataSource.filter(item => item.key == key)[0]);
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
    this.props.actions.updateCameraAdmin(this.props.user, newData[index]);
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
          bordered
          dataSource={dataSource}
          columns={columns}
          scroll={{ x:5200, y: 500 }}
        />
      </div>
    );
  }
}

const styles={
  formstyles: {
    textAlign: 'center'
  },
  videoContainer: {
    backgroundColor: 'black',
    height: 130,
    width: 230,
    color: 'white',
    margin: '0 auto'
  },
  videoContainerText: {
    paddingTop: 50
  },
  error: {
    color: 'red'
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    cameras: state.cameras.camerasAdmin,
    addCameraError: state.cameras.addCameraError,
    addCameraSuccess: state.cameras.addCameraSuccess,
    addCameraInProcess: state.cameras.addCameraInProcess,
    editCameraError: state.cameras.editCameraError
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(camerasActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CamerasAdmin);
