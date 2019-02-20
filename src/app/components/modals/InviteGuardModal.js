import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Input, Icon, message } from 'antd';
const FormItem = Form.Item;

import { shareCameraGroup } from '../../redux/cameraGroups/actions';

const InviteGuardForm = Form.create()(
  (props) => {
    const {visible, onCancel, onCreate, form, selectedCameraGroup, shareCameraGroupInProcess} = props;
    const {getFieldDecorator} = form;
    
    return (
      <Modal title={`Invite Guard to View ${selectedCameraGroup.name}'s Cameras`}
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
            <Button key='submit' type='primary' size='large' onClick={onCreate} disabled={shareCameraGroupInProcess}>
              <Icon type={shareCameraGroupInProcess ? 'loading' : 'share-alt'} />Invite
            </Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class InviteGuardModal extends Component {
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.shareCameraGroupError && this.props.shareCameraGroupError !== nextProps.shareCameraGroupError) {
      message.error(nextProps.shareCameraGroupError);
    }
    else if (nextProps.shareCameraGroupSuccess && this.props.shareCameraGroupSuccess !== nextProps.shareCameraGroupSuccess) {
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

      this.props.shareCameraGroup(this.props.user, this.props.selectedCameraGroup.id, values.email);
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
          selectedCameraGroup={this.props.selectedCameraGroup}
          shareCameraGroupInProcess={this.props.shareCameraGroupInProcess}
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
    user: state.auth.user,
    shareCameraGroupInProcess: state.cameraGroups.shareCameraGroupInProcess,
    shareCameraGroupError: state.cameraGroups.shareCameraGroupError,
    shareCameraGroupSuccess: state.cameraGroups.shareCameraGroupSuccess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    shareCameraGroup: (user, cameraGroupId, email) => dispatch(shareCameraGroup(user, cameraGroupId, email))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteGuardModal);
