import React, { Component} from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Form, Input, Button, message } from 'antd';
const FormItem = Form.Item;

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
          <FormItem style={styles.streetAddressField}>
            {getFieldDecorator('address1', {
              rules: [{required: true, message: 'Please enter the cameraGroup street address'}]
            })(
              <Input size='large' id='2' placeholder='Street address' style={styles.input}/>
            )}

          </FormItem>
          <FormItem>
            {getFieldDecorator('city', {
              rules: [{required: true, message: 'Please enter the cameraGroup city'}]
            })(
              <Input size='large' placeholder='City' style={styles.input}/>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('state', {
              rules: [{required: true, message: 'Please enter the cameraGroup state'}]
            })(
              <Input size='large' placeholder='State' style={styles.input}/>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('zip', {
              rules: [{required: true, message: 'Please enter the cameraGroup zip code'}]
            })(
              <Input size='large' id='3' placeholder='Zip code' style={styles.input}/>
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

  componentWillReceiveProps = (nextProps) => {
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

  showModal = () => {
    this.setState({visible: true});
  };

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
        <div onClick={this.showModal}>
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
  cameraCameraGroupCaption: {
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
    addNewCameraGroup: (user, cameraGroup) => dispatch(addNewCameraGroup(user, cameraGroup))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCameraGroupModal);
