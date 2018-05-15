import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { Icon, Modal, Form, Input, Button, message } from 'antd';
const FormItem = Form.Item;

import { updateUser } from '../../redux/users/actions';

import CustomInput from '../../components/formitems/CustomInput';

const UserSettingsForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, updateUser, form, userData, updateUserSuccess} = props;
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
      <Modal title='User Settings'
             visible={visible}
             style={styles.modal}
             onCancel={onCancel}
             footer={[null, null]}
      >
        <Form>
          <FormItem label='First Name' {...formItemLayout}>
            {getFieldDecorator('firstName')(
              <CustomInput style={styles.input} handleSave={onCreate} value1={userData.firstName} closeEditMode={updateUserSuccess} />
            )}
          </FormItem>
          <FormItem label='Last Name' {...formItemLayout}>
            {getFieldDecorator('lastName')(
              <CustomInput style={styles.input} handleSave={onCreate} value1={userData.lastName} closeEditMode={updateUserSuccess} />
            )}
          </FormItem>
          <FormItem label='Phone' {...formItemLayout}>
            {getFieldDecorator('phone')(
              <CustomInput style={styles.input} handleSave={onCreate} value1={userData.phone} closeEditMode={updateUserSuccess} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class UserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    }
  }

  userData = {
    firstName: this.props.user.firstName,
    lastName: this.props.user.lastName,
    phone: this.props.user.phone,
    email: this.props.user.phone
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
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      let userData = {};

      switch (e.target.id) {
        case 'firstName':
          this.setState({first_name: e.target.value.trim()});
          userData.first_name = e.target.value.trim();
          break;

        case 'lastName':
          this.setState({last_name: e.target.value.trim()});
          userData.last_name = e.target.value.trim();
          break;

        case 'phone':
          this.setState({phone: e.target.value.trim()});
          userData.phone = e.target.value.trim();
          break;

        case 'email':
          this.setState({email: e.target.value.trim()});
          userData.email = e.target.value.trim();
          break;

      }
      this.props.updateUser(this.props.user, userData);
    });
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.updateUserError && this.props.updateUserError !== nextProps.updateUserError) {
      message.error(nextProps.updateUserError);
    }
    if (nextProps.updateUserSuccess && this.props.updateUserSuccess !== nextProps.updateUserSuccess) {
      message.success('Settings Saved.');
      this.userData = nextProps.userData
    }
    if (nextProps.updateUserInProgress && this.props.updateUserInProgress !== nextProps.updateUserInProgress) {
      message.warning('Updating Settings.');
    }
  }

  render() {
    return (
      <div>
        <div onClick={this.showModal}>
          <Icon type='user'/>
          &nbsp;&nbsp;
          <span>User Settings</span>
        </div>
        <UserSettingsForm
          ref={(form) => this.form = form}
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
