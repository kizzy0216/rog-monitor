import React, { useContext, useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as camerasActions from '../../redux/cameras/actions';
import { Table, Input, Button, Popconfirm, Form, InputNumber, message, Radio, Modal, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { isEmpty } from '../../redux/helperFunctions';
import Highlighter from 'react-highlight-words';
import moment from 'moment-timezone';

const UsersForm = ({handleSubmit, form}) => {
  return (
    <Form layout={'inline'} onFinish={handleSubmit} style={styles.formstyles} ref={form}>
      <Form.Item label="Camera Group uuid" name="camera_groups_uuid" rules={[{type: 'string', message: 'Please enter a valid integer'}]} hasFeedback>
        <Input placeholder="Enter uuid" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
  );
};

const AddCameraForm = ({visible, onCancel, onCreate, form, addCameraInProcess, createSelectItems, updateTimeZone, currentTimeZone}) => {
  const layout = {
    wrapperCol: {
      span: 16,
      offset: 4
    }
  };
  return (
    <Modal title='Add a Camera'
      visible={visible}
      onCancel={onCancel}
      onOk={onCreate}
      okText='Add'
      cancelText='Cancel'
      confirmLoading={addCameraInProcess}
    >
      <Form ref={form} initialValues={{time_zone: currentTimeZone}} {...layout}>
        <Form.Item name="camera_name" rules={[{required: true, message: 'Please input the camera name'}]} hasFeedback>
          <Input placeholder='Enter camera name'/>
        </Form.Item>
        <Form.Item name="camera_url" rules={[{required: true, message: 'Please enter the camera URL'}]} hasFeedback>
          <Input placeholder='Enter Camera URL'/>
        </Form.Item>
        <Form.Item name="time_zone" rules={[{required: true, message: 'Please enter your time zone'}]} hasFeedback>
          <Select
            showSearch
            placeholder="Enter Time Zone"
            optionFilterProp="children"
            onChange={updateTimeZone}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {createSelectItems()}
          </Select>
        </Form.Item>
        <Form.Item name="username" rules={[{required: false, message: 'Please enter the camera username'}]} hasFeedback>
          <Input placeholder='Enter camera username'/>
        </Form.Item>
        <Form.Item name="password" rules={[{required: false, message: 'Please enter the camera password'}]} hasFeedback>
          <Input type='password' placeholder='Enter camera password'/>
        </Form.Item>
      </Form>
    </Modal>
  );
};

class CamerasAdmin extends React.Component {
  constructor(props) {
    super(props);

    this.state={
      visible: false,
      time_zone: moment.tz.guess()
    }
  }

  static getDerivedStateFromProps(nextProps, prevState){
    if (nextProps.editCameraError !== '') {
      message.error(nextProps.editCameraError, 10);
    }
    if (nextProps.addCameraError !== '') {
      message.error(nextProps.addCameraError, 10);
    }
    return null;
  }

  handleSubmit = (e) => {
    this.form.validateFields().then(values => {
      this.setState({camera_groups_uuid: values.camera_groups_uuid});
      this.props.actions.readCamerasInGroupAdmin(this.props.user, values);
    });
  }

  cameraGroupFormRef = (form) => {
    this.form = form;
  };

  addCameraFormRef = formRef => {
    this.formRef = formRef;
  };

  showModal = () => {
    if (typeof this.state.camera_groups_uuid !== "undefined") {
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
      form.validateFields(['camera_url', 'username', 'password']).then(values => {
        this.setState({fullRtspUrl: null}, () => {
          this.setState({fullRtspUrl: this.getFullRtspUrl(values.camera_url, values.username, values.password)});
        });
      })
    }
  }

  handleCreate = () => {
    if (typeof this.state.camera_groups_uuid !== "undefined") {
      const form = this.formRef;
      form.validateFields().then(values => {
        values.camera_groups_uuid = this.state.camera_groups_uuid;
        this.props.actions.createCameraAdmin(this.props.user, values);
        this.setState({ visible: false });
        form.resetFields();
      });
    }
  };

  handleCreateSelectItems = () => {
    if (this.state.visible == true) {
      let timezoneNames = moment.tz.names();
      let items = [];
      for (var i = 0; i < timezoneNames.length; i++) {
        if (!items.includes(timezoneNames[i])) {
          if (timezoneNames[i] !== "US/Pacific-New") {
            items.push(<Select.Option key={timezoneNames[i]} value={timezoneNames[i]}>{timezoneNames[i]}</Select.Option>);
          }
        }
      }
      return items;
    }
  }

  handleUpdateTimeZone = (fieldValue) => {
    this.setState({time_zone: fieldValue});
  }

  render(){
    const data = [];
    if (!isEmpty(this.props.cameras)) {
      for (var i = 0; i < this.props.cameras.length; i++) {
        data[i] = {
          key: this.props.cameras[i]['uuid'],
          uuid: this.props.cameras[i]['uuid'],
          camera_groups_uuid: this.props.cameras[i]['camera_groups_uuid'],
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
          away_mode: this.props.cameras[i]['away_mode'].toString(),
          enabled: this.props.cameras[i]['enabled'].toString(),
          magic_camera_box: this.props.cameras[i]['magic_camera_box'].toString(),
          s3_keywords: this.props.cameras[i]['s3_keywords'].toString()
        }
      }

      return(
        <div>
          <UsersForm
            form={this.cameraGroupFormRef}
            handleSubmit={this.handleSubmit}
          />
          <Button onClick={this.showModal} type="primary" style={{ marginBottom: 16 }}>
            Add a Camera
          </Button>
          <AddCameraForm
            form={this.addCameraFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
            testLiveView={this.testLiveView}
            fullRtspUrl={this.state.fullRtspUrl}
            addCameraError={this.props.addCameraError}
            addCameraInProcess={this.props.addCameraInProcess}
            createSelectItems={this.handleCreateSelectItems}
            updateTimeZone={this.handleUpdateTimeZone}
            currentTimeZone={this.state.time_zone}
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
            form={this.cameraGroupFormRef}
            handleSubmit={this.handleSubmit}
          />
          <Button onClick={this.showModal} type="primary" style={{ marginBottom: 16 }}>
            Add a Camera
          </Button>
          <AddCameraForm
            form={this.addCameraFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
            testLiveView={this.testLiveView}
            fullRtspUrl={this.state.fullRtspUrl}
            addCameraError={this.props.addCameraError}
            addCameraInProcess={this.props.addCameraInProcess}
            createSelectItems={this.handleCreateSelectItems}
            updateTimeZone={this.handleUpdateTimeZone}
            currentTimeZone={this.state.time_zone}
          />
        </div>
      )
    }
  }
}

const EditableContext = React.createContext();

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef();
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async e => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  const handleCreateSelectItems = () => {
    let timezoneNames = moment.tz.names();
    let items = [];
    for (var i = 0; i < timezoneNames.length; i++) {
      if (!items.includes(timezoneNames[i])) {
        if (timezoneNames[i] !== "US/Pacific-New") {
          items.push(<Select.Option key={timezoneNames[i]} value={timezoneNames[i]}>{timezoneNames[i]}</Select.Option>);
        }
      }
    }
    return items;
  }

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      dataIndex == 'time_zone' ?
        <Form.Item name="time_zone" rules={[{required: true, message: 'Please enter your time zone'}]} style={{ margin: 0 }} hasFeedback>
          <Select
            ref={inputRef}
            showSearch
            placeholder="Enter Time Zone"
            optionFilterProp="children"
            onChange={save}
            defaultOpen={true}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {handleCreateSelectItems()}
          </Select>
        </Form.Item>
      :
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'Uuid',
        dataIndex: 'uuid',
        width: 200,
        editable: false,
        defaultSortOrder: 'descend',
        sorter:(a, b) => a.uuid - b.uuid,
        sortDirections: ['descend', 'ascend']
      },
      {
        title: 'Camera Group Uuid',
        dataIndex: 'camera_groups_uuid',
        width: 200,
        editable: false,
        defaultSortOrder: 'descend',
        sorter:(a, b) => a.uuid - b.uuid,
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
        title: 'Away Mode',
        dataIndex: 'away_mode',
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
        title: 'S3 Keywords',
        dataIndex: 's3_keywords',
        width: 300,
        editable: true
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        width: 200,
        fixed: 'right',
        render: (text, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
              <Button type="secondary">Delete</Button>
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
          icon={<SearchOutlined />}
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
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
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

  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableRow,
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
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
        scroll={{ x:5500, y: 500 }}
      />
    );
  }
}

const styles={
  formstyles: {
    width: 500,
    margin: '0 auto'
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
  },
  timeZone: {
    width: '80%'
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
