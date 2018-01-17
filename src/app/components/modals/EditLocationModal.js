import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Form, Input, Button, Popconfirm, message } from 'antd';
import CustomInput from '../../components/formitems/CustomInput';

import { editLocation } from '../../redux/locations/actions';
import { removeLocation } from '../../redux/locations/actions';

const FormItem = Form.Item;
const EditLocationForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, removeLocation, form, location, editLocationInProcess, editLocationSuccess, removeLocationInProcess, removeLocationSuccess} = props;
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
          <Popconfirm title="Are you sure you want to remove this location? This action cannot be undone." onConfirm={removeLocation} okText="Yes, remove location" cancelText="Nevermind">
            <Button type="danger" icon="close" loading={removeLocationInProcess} disabled={removeLocationInProcess}>Remove Location</Button>
          </Popconfirm>
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

  handleDelete = (e) => {
    this.props.removeLocation(this.props.user, this.props.selectedLocation);
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
          removeLocation={this.handleDelete}
          error={this.state.error}
          location={this.props.selectedLocation}
          editLocationInProcess={this.props.editLocationInProcess}
          editLocationSuccess={this.props.editLocationSuccess}
          removeLocationInProcess={this.props.removeLocationInProcess}
          removeLocationSuccess={this.props.removeLocationSuccess}
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
    removeLocationInProcess: state.locations.removeLocationInProcess,
    removeLocationError: state.locations.removeLocationError,
    removeLocationSuccess: state.locations.removeLocationSuccess,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    editLocation: (user, location, locationData) => dispatch(editLocation(user, location, locationData)),
    removeLocation: (user, location) => dispatch(removeLocation(user, location))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditLocationModal);
