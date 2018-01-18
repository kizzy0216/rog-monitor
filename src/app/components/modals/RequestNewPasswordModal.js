import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, Icon, message } from 'antd';
const FormItem = Form.Item;

import { sendNewPasswordRequestEmail } from '../../redux/auth/actions';

const NewPasswordForm = Form.create()(
  (props) => {
    const {visible, onCancel, onCreate, form, sendNewPasswordInProcess} = props;
    const {getFieldDecorator} = form;

    return (
      <Modal title='Request a New Password'
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
            <Button key='submit' type='primary' size='large' onClick={onCreate} disabled={sendNewPasswordInProcess}>
              Request
            </Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class RequestNewPasswordModal extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.sendNewPasswordSuccess && this.props.sendNewPasswordSuccess !== nextProps.sendNewPasswordSuccess) {
      message.success('New password request sent. Please check your email.');
      this.form.resetFields();
      this.props.toggleRequestNewPasswordModalVisibility();
    }

    if (nextProps.sendNewPasswordError && this.props.sendNewPasswordError !== nextProps.sendNewPasswordError) {
      message.error(nextProps.sendNewPasswordError);
    }
  }

  handleCancel = () => {
    this.form.resetFields();
    this.props.toggleRequestNewPasswordModalVisibility();
  };

  handleCreate = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.sendNewPasswordRequestEmail(values.email);
    });
  };

  saveFormRef = (form) => {
    this.form = form;
  };

  render() {
    return (
      <div>
        <NewPasswordForm
          ref={this.saveFormRef}
          visible={this.props.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          sendNewPasswordRequestInProcess={this.props.sendNewPasswordRequestInProcess}
        />
      </div>
    );
  }
}

const styles = {
  selectedLocationText: {
    fontSize: 18,
    fontWeight: 600,
    marginTop: -20
  }
};

const mapStateToProps = (state) => {
  return {
    sendNewPasswordInProcess: state.auth.sendNewPasswordInProcess,
    sendNewPasswordError: state.auth.sendNewPasswordError,
    sendNewPasswordSuccess: state.auth.sendNewPasswordSuccess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendNewPasswordRequestEmail: (email) => dispatch(sendNewPasswordRequestEmail(email))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RequestNewPasswordModal);
