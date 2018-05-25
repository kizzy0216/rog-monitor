import React, { Component} from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Form, Input, Button, message } from 'antd';
const FormItem = Form.Item;

import { addNewLocation } from '../../redux/locations/actions';

const AddLocationForm = Form.create()(
  (props) => {
    const {visible, onCancel, onCreate, form, addLocationInProcess} = props;
    const {getFieldDecorator} = form;

    return (
      <Modal title='Add a Location'
        visible={visible}
        style={styles.modal}
        onCancel={onCancel}
        onOk={onCreate}
        okText='Submit'
        cancelText='Cancel'
        confirmLoading={addLocationInProcess}
      >
        <div style={styles.error}>{props.addLocationError}</div>
        <Form style={styles.addLocationForm}>
          <FormItem hasFeedback>
            {getFieldDecorator('name', {
              rules: [{required: true, message: 'Please enter a name for the location'}],
            })(
              <Input size='large' id='1' placeholder='Name' style={styles.input}/>
            )}
          </FormItem>
          <FormItem style={styles.streetAddressField}>
            {getFieldDecorator('address1', {
              rules: [{required: true, message: 'Please enter the location street address'}]
            })(
              <Input size='large' id='2' placeholder='Street address' style={styles.input}/>
            )}

          </FormItem>
          <FormItem>
            {getFieldDecorator('city', {
              rules: [{required: true, message: 'Please enter the location city'}]
            })(
              <Input size='large' placeholder='City' style={styles.input}/>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('state', {
              rules: [{required: true, message: 'Please enter the location state'}]
            })(
              <Input size='large' placeholder='State' style={styles.input}/>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('zip', {
              rules: [{required: true, message: 'Please enter the location zip code'}]
            })(
              <Input size='large' id='3' placeholder='Zip code' style={styles.input}/>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class AddLocationModal extends Component {
  state = {
    confirmLoading: false,
    visible: false
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.addLocationSuccess && this.props.addLocationSuccess !== nextProps.addLocationSuccess) {
      if (this.props.linkText === "Add Location") {
        this.resetFields();
        this.setState({visible: false});
      }
    }

    if (nextProps.addLocationError && this.props.addLocationError !== nextProps.addLocationError) {
      message.error(nextProps.addLocationError);
    }
  };

  showModal = () => {
    this.setState({visible: true});
  };

  resetFields = () => {
    this.form.resetFields();
  };

  handleCancel = () => {
    this.form.resetFields();
    this.setState({visible: false});
  };

  handleCreate = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) return;

      this.props.addNewLocation(this.props.user, values);
    });
  };

  saveFormRef = (form) => {
    this.form = form;
  };

  render() {
    return (
      <div>
        <div onClick={this.showModal}>
          <Icon type='environment-o'/>
          &nbsp;&nbsp;
          <span>{this.props.linkText}</span>
        </div>
        <AddLocationForm
          ref={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          addLocationError={this.props.addLocationError}
          addLocationInProcess={this.props.addLocationInProcess}
        />
      </div>
    );
  }
}

const styles = {
  modal: {
    textAlign: 'center'
  },
  addLocation: {
    float: 'left',
    fontSize: 18,
    paddingLeft: 10
  },
  cameraLocationCaption: {
    margin: '0 auto',
    textAlign: 'left',
    width: '60%',
    fontWeight: 600
  },
  optionalFieldsHeadText: {
    margin: '0 auto',
    marginTop: 20,
    marginBottom: 5,
    textAlign: 'left',
    width: '60%',
    fontWeight: 600
  },
  error: {
    color: 'red'
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    addLocationError: state.locations.addLocationError,
    addLocationSuccess: state.locations.addLocationSuccess,
    addLocationInProcess: state.locations.addLocationInProcess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addNewLocation: (user, location) => dispatch(addNewLocation(user, location))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddLocationModal);
