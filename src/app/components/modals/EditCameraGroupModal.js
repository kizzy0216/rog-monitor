import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Form, Input, Button, Popconfirm, message } from 'antd';
import CustomInput from '../../components/formitems/CustomInput';

import { editCameraGroup } from '../../redux/cameraGroups/actions';
import { removeCameraGroup } from '../../redux/cameraGroups/actions';

const FormItem = Form.Item;
const EditCameraGroupForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, removeCameraGroup, form, cameraGroup, editCameraGroupInProcess, editCameraGroupSuccess, removeCameraGroupInProcess, removeCameraGroupSuccess} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 16 },
      },
    };
    return (
      <Modal title={`Edit ${props.cameraGroup.name}`}
             visible={visible}
             style={styles.modal}
             onCancel={onCancel}
             onOk={onCreate}
             okText='Save'
             cancelText='Cancel'
      >
        <Form>
          <FormItem label='Name' {...formItemLayout}>
            {getFieldDecorator('name', {
              'initialValue': props.cameraGroup.name
            })(
              <Input
                style={styles.input}
                placeholder="CameraGroup Name"
              />
            )}
          </FormItem>
          <Popconfirm title="Are you sure you want to remove this cameraGroup? This action cannot be undone." onConfirm={removeCameraGroup} okText="Yes, remove cameraGroup" cancelText="Nevermind">
            <Button type="danger" icon="close" loading={removeCameraGroupInProcess} disabled={removeCameraGroupInProcess}>Remove CameraGroup</Button>
          </Popconfirm>
        </Form>
      </Modal>
    );
  }
);

class EditCameraGroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: false
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
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.props.editCameraGroup(this.props.user, this.props.selectedCameraGroup, values);
    });
  };

  handleDelete = (e) => {
    this.props.removeCameraGroup(this.props.user, this.props.selectedCameraGroup);
  };

  render() {
    return (
      <div>
        <div onClick={this.showModal}>
          <Icon type='environment-o' onClick={this.showModal} />
          &nbsp;
          CameraGroup Settings
        </div>
        <EditCameraGroupForm
          ref={(form) => this.form = form}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          removeCameraGroup={this.handleDelete}
          error={this.state.error}
          cameraGroup={this.props.selectedCameraGroup}
          editCameraGroupInProcess={this.props.editCameraGroupInProcess}
          editCameraGroupSuccess={this.props.editCameraGroupSuccess}
          removeCameraGroupInProcess={this.props.removeCameraGroupInProcess}
          removeCameraGroupSuccess={this.props.removeCameraGroupSuccess}
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
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    editCameraGroup: (user, cameraGroup, cameraGroupData) => dispatch(editCameraGroup(user, cameraGroup, cameraGroupData)),
    removeCameraGroup: (user, cameraGroup) => dispatch(removeCameraGroup(user, cameraGroup))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCameraGroupModal);
