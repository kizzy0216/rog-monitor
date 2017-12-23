import React, { Component } from 'react';
import store from '../../redux/store';
import { Icon, Modal, Form, Input, Button } from 'antd';
const FormItem = Form.Item;

import CustomInput from '../../components/formitems/CustomInput';

const UserSettingsForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, form, name, email, phone} = props;
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
          <FormItem label='Name' {...formItemLayout}>
            {getFieldDecorator('name')(
              <CustomInput style={styles.input} handleSave={onCreate} value1={name} />
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
      name: user.firstName + ' ' + user.lastName,
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

      const data = {
        name: this.state.name,
        email: this.state.email,
        phone: this.state.phone
      };

      switch (e.target.id) {
        case 'name':
          this.setState({name: e.target.value});
          data.name = e.target.value;
          break;

        case 'phone':
          this.setState({phone: e.target.value});
          data.phone = e.target.value;
          break;

        case 'email':
          this.setState({email: e.target.value});
          data.email = e.target.value;
          break;

      }

      // console.log('Received values of form: ', data);
      this.setState({visible: true});
    });
  };
  saveFormRef = (form) => {
    this.form = form;
  };

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
          name={this.state.name}
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
export default UserSettings;
