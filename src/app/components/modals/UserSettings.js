import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { Icon, Modal, Form, Input, Button } from 'antd';
const FormItem = Form.Item;

import { updateUser } from '../../redux/users/actions';

import CustomInput from '../../components/formitems/CustomInput';

const UserSettingsForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, form, firstName, lastName, email, phone} = props;
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
              <CustomInput style={styles.input} handleSave={onCreate} value1={firstName} />
            )}
          </FormItem>
          <FormItem label='Last Name' {...formItemLayout}>
            {getFieldDecorator('lastName')(
              <CustomInput style={styles.input} handleSave={onCreate} value1={lastName} />
            )}
          </FormItem>
          <FormItem label='Phone' {...formItemLayout}>
            {getFieldDecorator('phone')(
              <CustomInput style={styles.input} handleSave={onCreate} value1={phone} />
            )}
          </FormItem>
          <FormItem label='Email' {...formItemLayout}>
            {getFieldDecorator('email')(
              <CustomInput style={styles.input} handleSave={onCreate} value1={email} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class UserSettings extends Component {
  constructor(props) {
    const {user} = store.getState().auth;
    super(props);
    this.state = {
      visible: false,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone
    }
  }

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
      userData[e.target.id] = e.target.value.trim();

      this.props.updateUser(this.props.user, userData);
    });
  };
  saveFormRef = (form) => {
    this.form = form;
  };

  componentWillReceiveProps = (nextProps) => {
    console.log(nextProps);
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
          ref={this.saveFormRef}
          visible={this.state.visible}
          firstName={this.state.firstName}
          lastName={this.state.lastName}
          email={this.state.email}
          phone={this.state.phone}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          cancelSaveButton={this.cancelSaveButton}
          cancelSave={this.state.hidden}
          error={this.state.error}
          updatelicenses={this.updateInputValue}
        />
      </div>
    );
  }
}

const {user} = store.getState().auth;

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
    updateUserInProgress: state.locations.updateUserInProgress,
    updateUserError: state.locations.updateUserError,
    updateUserSuccess: state.locations.updateUserSuccess,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateUser: (user, userData) => dispatch(updateUser(user, userData)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings);
