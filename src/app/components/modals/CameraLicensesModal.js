import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Form, Input, Button } from 'antd';
const FormItem = Form.Item;

const CameraLicensesForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, form, cancelSave, cancelSaveButton, error, cameraLicenses, locations, updatelicenses} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
      },
      wrapperCol: {
        xs: { span: 12 },
      },
    };

    const getUsedLicenses = () => {
      if (locations.length) {
        return  locations
                  .map(location => location.cameras && location.myRole === 'owner' ? location.cameras : [])
                  .reduce((a, b) => a.concat(b))
                  .length;
      }
      else {
        return 0;
      }
    }

    return (
      <Modal title='Camera License Settings'
             visible={visible}
             style={styles.modal}
             onCancel={onCancel}
             footer={[
               error &&
               <span style={styles.error}>Number of licenses may not be less than number of Used Licenses</span>
             ]}
             className='cameraLicensesModal'
      >
        <Form>
          <FormItem label='Licenses:' {...formItemLayout}>
            {getFieldDecorator('licenses', {
              initialValue: cameraLicenses
            })(
              <Input id='1' disabled={true/*!cancelSave*/} type='text' style={styles.input} onChange={updatelicenses} className='cameraLicensesFormInput' />
            )}
          </FormItem>
          <FormItem label='Used:' {...formItemLayout}>
            {getFieldDecorator('used', {
              initialValue: getUsedLicenses(),
            })(
              <Input disabled type='text' style={styles.input} className='cameraLicensesFormInput' />
            )}
          </FormItem>
          <FormItem label='Available:' {...formItemLayout}>
            {getFieldDecorator('available', {
              initialValue: cameraLicenses - getUsedLicenses(),
            })(
              <Input disabled type='text' style={styles.input} className='cameraLicensesFormInput' />
            )}
          </FormItem>
        </Form>
        <div style={styles.subscriptionAgreement}>
          <a target='_blank' href='https://www.gorog.co/subscription-agreement'>Subscription Agreement</a>
        </div>
      </Modal>
    );
  }
);

class CameraLicenses extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      hidden: false,
      error: false
    }

  }

  updateInputValue = (e) => {
    if (e.target.id === '1') {
      this.setState({
        LicensesText: e.target.value
      });
    }
  };

  cancelSaveButton = () => {
    // this.setState({hidden: !this.state.hidden})
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

      if (values.licenses < values.used) {
        this.setState({error: true});
      } else {
        this.setState({error: false});
      }

      // console.log('Received values of form: ', values);

      // form.resetFields();
    });
  };

  saveFormRef = (form) => {
    this.form = form;
  };

  render() {
    return (
      <div>
        <div onClick={this.showModal}>
          <Icon type='video-camera'/>
          &nbsp;&nbsp;
          <span>Licenses</span>
        </div>
        <CameraLicensesForm
          ref={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          cancelSaveButton={this.cancelSaveButton}
          cancelSave={this.state.hidden}
          error={this.state.error}
          cameraLicenses={this.props.user.cameraLicenses}
          locations={this.props.locations}
          updatelicenses={this.updateInputValue}
        />
      </div>
    );
  }
}

const styles = {
  input: {
    width: 50,
    textAlign: 'center',
    marginTop: 5,
    float: 'left'
  },
  modal: {
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center'

  },
  editLicenses: {
    fontSize: 20,
    paddingLeft: 10,
    float: 'left',
    paddingTop: 5
  },
  cancelSaveBtn: {
    float: 'left',
  },
  saveLicensesBtn: {
    color: '#108ee9',
  },
  cancelLicensesBtn: {
    color: 'red',
    marginLeft: 2
  },
  subscriptionAgreement: {
    float: 'right',
    marginTop: -10,
    marginRight: 15
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    locations: state.locations.locations
  }
}

export default connect(mapStateToProps, null)(CameraLicenses);
