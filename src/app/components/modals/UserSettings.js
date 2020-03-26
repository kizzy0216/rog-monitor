import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
const FormItem = Form.Item;

import { updateUser } from '../../redux/users/actions';

import CustomInput from '../../components/formitems/CustomInput';

const UserSettingsForm = ({onCancel, visible, onCreate, updateUser, form, userData, updateUserSuccess}) => {
  const formItemLayout = {
    labelCol: {
      xs: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 16 },
    },
  };
  return (
    <Modal title='User Settings'
           visible={visible}
           style={styles.modal}
           onCancel={onCancel}
           onOk={onCreate}
           okText='Save'
           cancelText='Cancel'
    >
      <Form
        initialValues={{
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        }}
        ref={form}
      >
        <FormItem label='First Name' name="firstName" {...formItemLayout}>
          <Input placeholder="First Name" style={styles.input} />
        </FormItem>
        <FormItem label='Last Name' name="lastName" {...formItemLayout}>
          <Input placeholder="Last Name" style={styles.input}  />
        </FormItem>
        <FormItem label='Email' name="email" {...formItemLayout}>
          <Input placeholder="Email" style={styles.input} disabled />
        </FormItem>
      </Form>
    </Modal>
  );
};

class UserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    }
  }

  userData = {
    firstName: this.props.user.first_name,
    lastName: this.props.user.last_name,
    email: this.props.user.email
  };

  cancelSaveButton = () => {
    this.setState({hidden: !this.state.hidden})
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
      this.props.updateUser(this.props.user, values);
    });
  };

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (nextProps.updateUserError && this.props.updateUserError !== nextProps.updateUserError) {
      message.error(nextProps.updateUserError);
    }
    if (nextProps.updateUserSuccess && this.props.updateUserSuccess !== nextProps.updateUserSuccess) {
      message.success('Settings Saved.');
      this.userData = nextProps.userData
    }
  }

  render() {
    return (
      <div>
        <div onClick={this.showModal}>
          <UserOutlined />
          &nbsp;&nbsp;
          <span>User Settings</span>
        </div>
        <UserSettingsForm
          form={(form) => this.form = form}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          cancelSaveButton={this.cancelSaveButton}
          cancelSave={this.state.hidden}
          error={this.state.error}
          userData={this.userData}
          updateUserInProcess={this.props.updateUserInProcess}
          updateUserSuccess={this.props.updateUserSuccess}
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
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    userData: state.users.userData.data,
    updateUserInProgress: state.users.updateUserInProgress,
    updateUserError: state.users.updateUserError,
    updateUserSuccess: state.users.updateUserSuccess,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateUser: (user, userData) => dispatch(updateUser(user, userData)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings);
