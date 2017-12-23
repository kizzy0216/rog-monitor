import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, Icon, message } from 'antd';
const FormItem = Form.Item;

import { shareLocation } from '../../redux/locations/actions';

const InviteGuardForm = Form.create()(
  (props) => {
    const {visible, onCancel, onCreate, form, selectedLocation, shareLocationInProcess} = props;
    const {getFieldDecorator} = form;
    
    return (
      <Modal title={`Invite Guard to View ${selectedLocation.name}'s Cameras`}
        visible={visible}
        okText='Create'
        onCancel={onCancel}
        footer={[null, null]}
      >
        <Form layout='vertical'>
          <FormItem>
            {getFieldDecorator('email', {
              rules: [{
                type: 'email', message: 'This is not a valid email',
              }, {
                required: true, message: 'Please enter an email address',
              }],
            })(
              <Input prefix={<Icon type='mail' />} placeholder='Enter email address'/>
            )}

          </FormItem>
          <FormItem>
            <Button key='submit' type='primary' size='large' onClick={onCreate} disabled={shareLocationInProcess}>
              <Icon type={shareLocationInProcess ? 'loading' : 'share-alt'} />Invite
            </Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class InviteGuardModal extends Component {
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.shareLocationError && this.props.shareLocationError !== nextProps.shareLocationError) {
      message.error(nextProps.shareLocationError);
    }
    else if (nextProps.shareLocationSuccess && this.props.shareLocationSuccess !== nextProps.shareLocationSuccess) {
      message.success('Invitation sent.');
      this.form.resetFields();
    }
  }

  handleCancel = () => {
    this.form.resetFields();
    this.props.toggleInviteGuardModalVisibility();
  };

  handleCreate = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.shareLocation(this.props.user, this.props.selectedLocation.id, values.email);
    });
  };

  saveFormRef = (form) => {
    this.form = form;
  };

  render() {
    return (
      <div>
        <InviteGuardForm
          ref={this.saveFormRef}
          visible={this.props.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          selectedLocation={this.props.selectedLocation}
          shareLocationInProcess={this.props.shareLocationInProcess}
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
    user: state.auth.user,
    shareLocationInProcess: state.locations.shareLocationInProcess,
    shareLocationError: state.locations.shareLocationError,
    shareLocationSuccess: state.locations.shareLocationSuccess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    shareLocation: (user, locationId, email) => dispatch(shareLocation(user, locationId, email))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteGuardModal);
