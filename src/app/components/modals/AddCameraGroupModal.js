import React, { Component} from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Form, Input, Button, message } from 'antd';
const FormItem = Form.Item;
import { fetchUserCameraLicenses } from '../../redux/users/actions';

import { addNewCameraGroup } from '../../redux/cameraGroups/actions';

const AddCameraGroupForm = Form.create()(
  (props) => {
    const {visible, onCancel, onCreate, form, addCameraGroupInProcess} = props;
    const {getFieldDecorator} = form;

    return (
      <Modal title='Add a CameraGroup'
        visible={visible}
        style={styles.modal}
        onCancel={onCancel}
        onOk={onCreate}
        okText='Submit'
        cancelText='Cancel'
        confirmLoading={addCameraGroupInProcess}
      >
        <div style={styles.error}>{props.addCameraGroupError}</div>
        <Form style={styles.addCameraGroupForm}>
          <FormItem hasFeedback>
            {getFieldDecorator('name', {
              rules: [{required: true, message: 'Please enter a name for the cameraGroup'}],
            })(
              <Input size='large' id='1' placeholder='Name' style={styles.input}/>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class AddCameraGroupModal extends Component {
  state = {
    confirmLoading: false,
    visible: false
  };

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (nextProps.addCameraGroupSuccess && this.props.addCameraGroupSuccess !== nextProps.addCameraGroupSuccess) {
      if (this.props.linkText === "Add CameraGroup") {
        this.resetFields();
        this.setState({visible: false});
      }
    }

    if (nextProps.addCameraGroupError && this.props.addCameraGroupError !== nextProps.addCameraGroupError) {
      message.error(nextProps.addCameraGroupError);
    }
  };

  toggleAddCameraGroupModalVisibility = () => {
    let licensesAvailable = this.countAvailableCameraLicenses();
    if (licensesAvailable >= 1) {
      this.setState({visible: !this.state.visible});
    } else if (this.state.addCameraModalVisible === true) {
      this.setState({visible: false});
    } else {
      message.error("You have reached your license limit. Please send an email requesting additional licenses to help@gorog.co");
    }
  }

  countAvailableCameraLicenses = () => {
    this.props.fetchUserCameraLicenses(this.props.user, this.props.cameraGroups)
    let count = 0;
    this.props.user.cameraLicenses.map(cameraLicense => cameraLicense.cameras_uuid == null ? count++ : count)
    return count;
  }

  resetFields = () => {
    this.form.resetFields();
  };

  handleCancel = () => {
    this.form.resetFields();
    this.setState({visible: false});
  };

  handleCreate = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) return;

      this.props.addNewCameraGroup(this.props.user, values);
    });
  };

  saveFormRef = (form) => {
    this.form = form;
  };

  render() {
    return (
      <div>
        <div onClick={this.toggleAddCameraGroupModalVisibility}>
          <Icon type='environment-o'/>
          &nbsp;&nbsp;
          <span>{this.props.linkText}</span>
        </div>
        <AddCameraGroupForm
          ref={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          addCameraGroupError={this.props.addCameraGroupError}
          addCameraGroupInProcess={this.props.addCameraGroupInProcess}
        />
      </div>
    );
  }
}

const styles = {
  modal: {
    textAlign: 'center'
  },
  addCameraGroup: {
    float: 'left',
    fontSize: 18,
    paddingLeft: 10
  },
  cameraGroupCaption: {
    margin: '0 auto',
    textAlign: 'left',
    width: '60%',
    fontWeight: 600
  },
  optionalFieldsHeadText: {
    margin: '0 auto',
    marginTop: 20,
    marginBottom: 5,
    textAlign: 'left',
    width: '60%',
    fontWeight: 600
  },
  error: {
    color: 'red'
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    addCameraGroupError: state.cameraGroups.addCameraGroupError,
    addCameraGroupSuccess: state.cameraGroups.addCameraGroupSuccess,
    addCameraGroupInProcess: state.cameraGroups.addCameraGroupInProcess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUserCameraLicenses: (user, cameraGroup) => dispatch(fetchUserCameraLicenses(user, cameraGroup)),
    addNewCameraGroup: (user, cameraGroup) => dispatch(addNewCameraGroup(user, cameraGroup))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCameraGroupModal);
