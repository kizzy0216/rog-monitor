import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, Button, Popconfirm, message, Switch } from 'antd';
import { EnvironmentOutlined, DeleteOutlined, DisconnectOutlined, LinkOutlined, SafetyOutlined, HomeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import CustomInput from '../../components/formitems/CustomInput';
import { enableCameraGroup, disableCameraGroup, removeCameraGroup, editCameraGroup } from '../../redux/cameraGroups/actions';

const FormItem = Form.Item;
const EditCameraGroupForm = ({onCancel, visible, onCreate, removeCameraGroup, form, cameraGroup, cameraGroupName, editCameraGroupInProcess, editCameraGroupSuccess, removeCameraGroupInProcess, removeCameraGroupSuccess, user, enableCameraGroup, disableCameraGroup, enableCameraGroupInProcess, disableCameraGroupInProcess, cameraGroupAwayMode, toggleCameraGroupAwayMode, cameraGroupArmed, toggleCameraGroupArmed}) => {
  const formItemLayout = {
    labelCol: {
      xs: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 16 },
    },
  };
  return (
    <Modal title={`Edit ${cameraGroupName}`}
           visible={visible}
           style={styles.modal}
           onCancel={onCancel}
           onOk={onCreate}
           okText='Save'
           cancelText='Cancel'
    >
      <Form
        initialValues={{
          name: cameraGroupName
        }}
        ref={form}
      >
        <Form.Item label="Away Mode" name="away_mode" {...formItemLayout}>
          <Switch
            checkedChildren={<SafetyOutlined />}
            unCheckedChildren={<HomeOutlined />}
            onChange={toggleCameraGroupAwayMode}
            checked={cameraGroupAwayMode}
            disabled={!cameraGroupArmed}
          />
        </Form.Item>
        <Form.Item label="Armed" name="armed" {...formItemLayout}>
          <Switch
            checkedChildren={<LockOutlined />}
            unCheckedChildren={<UnlockOutlined />}
            onChange={toggleCameraGroupArmed}
            checked={cameraGroupArmed}
          />
        </Form.Item>
        <FormItem label='Name' name="name" {...formItemLayout}>
          <Input
            style={styles.input}
            placeholder="CameraGroup Name"
          />
        </FormItem>
        <FormItem label="Connect" name="connect" {...formItemLayout}>
          <Button type="primary" icon={<LinkOutlined />} loading={enableCameraGroupInProcess} disabled={enableCameraGroupInProcess} style={{backgroundColor: "#1890ff", width: 197}} onClick={()=>enableCameraGroup(user, cameraGroup)}>Connect Camera Group</Button>
        </FormItem>
        <FormItem label="Disconnect" name="disconnect" {...formItemLayout}>
          <Popconfirm title={<p>Are you sure you want to disconnect this camera group? <br /> <font color='orange'>WARNING: This will disconnect the ROG Security system</font></p>} onConfirm={()=>disableCameraGroup(user, cameraGroup)} okText="Disconnect" cancelText="Nevermind">
            <Button type="primary" icon={<DisconnectOutlined />} loading={disableCameraGroupInProcess} disabled={disableCameraGroupInProcess}>Disconnect Camera Group</Button>
          </Popconfirm>
        </FormItem>
        <FormItem label="Remove" name="remove" {...formItemLayout}>
          <Popconfirm title="Are you sure you want to remove this cameraGroup? This action cannot be undone." onConfirm={removeCameraGroup} okText="Yes, remove cameraGroup" cancelText="Nevermind">
            <Button type="danger" icon={<DeleteOutlined />} loading={removeCameraGroupInProcess} disabled={removeCameraGroupInProcess}>Remove Camera Group</Button>
          </Popconfirm>
        </FormItem>
      </Form>
    </Modal>
  );
};

class EditCameraGroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: false,
      away_mode: this.props.selectedCameraGroup.away_mode,
      armed: this.props.selectedCameraGroup.armed
    }
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (nextProps.editCameraGroupError && this.props.editCameraGroupError !== nextProps.editCameraGroupError) {
      message.error(nextProps.editCameraGroupError);
    }

    if (nextProps.removeCameraGroupError && this.props.removeCameraGroupError !== nextProps.removeCameraGroupError) {
      message.error(nextProps.removeCameraGroupError);
    }
  };

  showModal = () => {
    this.setState({visible: true});
  };

  handleCancel = () => {
    this.setState({visible: false});
  };

  handleCreate = (e) => {
    const form = this.form;
    form.validateFields().then(values => {
      this.props.editCameraGroup(this.props.user, this.props.selectedCameraGroup, {name: values.name, away_mode: this.state.away_mode, armed: this.state.armed});
    });
  };

  handleDelete = (e) => {
    this.props.removeCameraGroup(this.props.user, this.props.selectedCameraGroup);
  };

  handleToggleCameraGroupAwayMode = (fieldValue) => {
    this.setState({away_mode: fieldValue});
  }

  handleToggleCameraGroupArmed = (fieldValue) => {
    this.setState({armed: fieldValue});
  }

  render() {
    return (
      <div>
        <div onClick={this.showModal}>
          <EnvironmentOutlined onClick={this.showModal} />
          &nbsp;
          CameraGroup Settings
        </div>
        <EditCameraGroupForm
          form={(form) => this.form = form}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          removeCameraGroup={this.handleDelete}
          error={this.state.error}
          user={this.props.user}
          cameraGroup={this.props.selectedCameraGroup}
          cameraGroupName={this.props.selectedCameraGroup.name}
          cameraGroupAwayMode={this.state.away_mode}
          cameraGroupArmed={this.state.armed}
          toggleCameraGroupArmed={this.handleToggleCameraGroupArmed}
          toggleCameraGroupAwayMode={this.handleToggleCameraGroupAwayMode}
          editCameraGroupInProcess={this.props.editCameraGroupInProcess}
          editCameraGroupSuccess={this.props.editCameraGroupSuccess}
          removeCameraGroupInProcess={this.props.removeCameraGroupInProcess}
          removeCameraGroupSuccess={this.props.removeCameraGroupSuccess}
          enableCameraGroup={this.props.enableCameraGroup}
          disableCameraGroup={this.props.disableCameraGroup}
          enableCameraGroupInProcess={this.props.enableCameraGroupInProcess}
          disableCameraGroupInProcess={this.props.disableCameraGroupInProcess}
        />
      </div>
    );
  }
}

const styles = {
  modal: {
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center'
  },
  image: {
    width: '50%'
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    editCameraGroupInProcess: state.cameraGroups.editCameraGroupInProcess,
    editCameraGroupError: state.cameraGroups.editCameraGroupError,
    editCameraGroupSuccess: state.cameraGroups.editCameraGroupSuccess,
    removeCameraGroupInProcess: state.cameraGroups.removeCameraGroupInProcess,
    removeCameraGroupError: state.cameraGroups.removeCameraGroupError,
    removeCameraGroupSuccess: state.cameraGroups.removeCameraGroupSuccess,
    enableCameraGroupInProcess: state.cameraGroups.enableCameraGroupInProcess,
    disableCameraGroupInProcess: state.cameraGroups.disableCameraGroupInProcess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    editCameraGroup: (user, cameraGroup, cameraGroupData) => dispatch(editCameraGroup(user, cameraGroup, cameraGroupData)),
    removeCameraGroup: (user, cameraGroup) => dispatch(removeCameraGroup(user, cameraGroup)),
    enableCameraGroup: (user, cameraGroup) => dispatch(enableCameraGroup(user, cameraGroup)),
    disableCameraGroup: (user, cameraGroup) => dispatch(disableCameraGroup(user, cameraGroup))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCameraGroupModal);
