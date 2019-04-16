import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, Icon, message } from 'antd';
const FormItem = Form.Item;

import { sendPasswordResetRequestEmail } from '../../redux/auth/actions';

const PasswordResetForm = Form.create()(
  (props) => {
    const {visible, onCancel, onCreate, form, sendPasswordResetInProcess} = props;
    const {getFieldDecorator} = form;

    return (
      <Modal title='Request to Reset Password'
        visible={visible}
        okText='Send'
        onCancel={onCancel}
        footer={[null, null]}
      >
        <Form>
          <FormItem hasFeedback>
            {getFieldDecorator('email', {
              rules: [{
                type: 'email', message: 'This is not a valid email',
              }, {
                required: true, message: 'Please enter your email address',
              }],
            })(
              <Input prefix={<Icon type='mail' />} placeholder='Enter email address'/>
            )}
          </FormItem>
          <FormItem>
            <Button key='submit' type='primary' size='large' onClick={onCreate} disabled={sendPasswordResetInProcess}>
              Request
            </Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class RequestPasswordResetModal extends Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.sendPasswordResetRequestSuccess && this.props.sendPasswordResetRequestSuccess !== nextProps.sendPasswordResetRequestSuccess) {
      message.success('Password reset request sent. Please check your email.');
      this.form.resetFields();
      this.props.toggleRequestPasswordResetModalVisibility();
    }

    if (nextProps.sendPasswordResetRequestError && this.props.sendPasswordResetRequestError !== nextProps.sendPasswordResetRequestError) {
      message.error(nextProps.sendPasswordResetRequestError);
    }
  }

  handleCancel = () => {
    this.form.resetFields();
    this.props.toggleRequestPasswordResetModalVisibility();
  };

  handleCreate = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.sendPasswordResetRequestEmail(values.email);
    });
  };

  saveFormRef = (form) => {
    this.form = form;
  };

  render() {
    return (
      <div>
        <PasswordResetForm
          ref={this.saveFormRef}
          visible={this.props.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          sendPasswordResetRequestInProcess={this.props.sendPasswordResetRequestInProcess}
        />
      </div>
    );
  }
}

const styles = {
  selectedCameraGroupText: {
    fontSize: 18,
    fontWeight: 600,
    marginTop: -20
  }
};

const mapStateToProps = (state) => {
  return {
    sendPasswordResetInProcess: state.auth.sendPasswordResetInProcess,
    sendPasswordResetRequestError: state.auth.sendPasswordResetRequestError,
    sendPasswordResetRequestSuccess: state.auth.sendPasswordResetRequestSuccess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendPasswordResetRequestEmail: (email) => dispatch(sendPasswordResetRequestEmail(email))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RequestPasswordResetModal);
