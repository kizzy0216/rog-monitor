import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Form, Input, Button, message } from 'antd';
import CustomInput from '../../components/formitems/CustomInput';

import { editLocation } from '../../redux/locations/actions';

const FormItem = Form.Item;
const EditLocationForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, form, location, editLocationInProcess, editLocationSuccess} = props;
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
      <Modal title={`Edit ${props.location.name}`}
             visible={visible}
             style={styles.modal}
             onCancel={onCancel}
             footer={[null, null]}
      >
        <Form>
          <FormItem label='Name' {...formItemLayout}>
            {getFieldDecorator('name')(
              <CustomInput
                style={styles.input}
                type='text'
                handleSave={onCreate}
                value1={location.name}
                buttonsDisabled={editLocationInProcess}
                closeEditMode={editLocationSuccess}
              />
            )}
          </FormItem>
          <FormItem label='Address' {...formItemLayout}>
            {getFieldDecorator('address1', {
              rules: [{required: true, message: 'Please enter the location street address'}],
              initialValue: location.address1
            })(
              <CustomInput
                style={styles.input}
                type='text'
                handleSave={onCreate}
                value1={location.address1}
                buttonsDisabled={editLocationInProcess}
                closeEditMode={editLocationSuccess}
              />
            )}
          </FormItem>
          <FormItem label='City' {...formItemLayout}>
            {getFieldDecorator('city', {
              rules: [{required: true, message: 'Please enter the location city'}],
              initialValue: location.city
            })(
              <CustomInput
                style={styles.input}
                type='text'
                handleSave={onCreate}
                value1={location.city}
                buttonsDisabled={editLocationInProcess}
                closeEditMode={editLocationSuccess}
              />
            )}
          </FormItem>
          <FormItem label='State' {...formItemLayout}>
            {getFieldDecorator('state', {
              rules: [{required: true, message: 'Please enter the location state'}],
              initialValue: location.city
            })(
              <CustomInput
                style={styles.input}
                type='text'
                handleSave={onCreate}
                value1={location.state}
                buttonsDisabled={editLocationInProcess}
                closeEditMode={editLocationSuccess}
              />
            )}
          </FormItem>
          <FormItem label='Zip code' {...formItemLayout}>
            {getFieldDecorator('zip', {
              rules: [{required: true, message: 'Please enter the location zip code'}],
              initialValue: location.zip
            })(
              <CustomInput
                style={styles.input}
                type='text'
                handleSave={onCreate}
                value1={location.zip}
                buttonsDisabled={editLocationInProcess}
                closeEditMode={editLocationSuccess}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class EditLocationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: false
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.editLocationError && this.props.editLocationError !== nextProps.editLocationError) {
      message.error(nextProps.editLocationError);
    }
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

      let locationData = {};
      locationData[e.target.id] = e.target.value.trim();

      this.props.editLocation(this.props.user, this.props.selectedLocation, locationData);
    });
  };

  render() {
    return (
      <div>
        <div onClick={this.showModal}>
          <Icon type='environment-o' onClick={this.showModal} />
          &nbsp;
          Location Settings
        </div>
        <EditLocationForm
          ref={(form) => this.form = form}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          error={this.state.error}
          location={this.props.selectedLocation}
          editLocationInProcess={this.props.editLocationInProcess}
          editLocationSuccess={this.props.editLocationSuccess}
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
  },
  image: {
    width: '50%'
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    editLocationInProcess: state.locations.editLocationInProcess,
    editLocationError: state.locations.editLocationError,
    editLocationSuccess: state.locations.editLocationSuccess,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    editLocation: (user, location, locationData) => dispatch(editLocation(user, location, locationData))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditLocationModal);
