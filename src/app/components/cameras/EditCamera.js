import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Icon, Modal, Form, Input, Button } from 'antd';
import CustomInput from '../../components/formitems/CustomInput';

const FormItem = Form.Item;
const CameraLicensesForm = Form.create()(
  (props) => {
    const {onCancel, visible, onCreate, form, cameraData} = props;
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
      <Modal title={`Edit ${props.cameraData.name}`}
             visible={visible}
             style={styles.modal}
             onCancel={onCancel}
             footer={[null, null]}
      >
        <Form>
          <FormItem>
            <img src={cameraData.image} style={styles.image}/>
          </FormItem>
          <FormItem>
            <Button key='submit' type='primary' size='large' onClick={props.testLiveView}>
              <Icon type='reload'></Icon>Test Live View
            </Button>
          </FormItem>
          <FormItem label='Name' {...formItemLayout}>
            {getFieldDecorator('name')(
              <CustomInput style={styles.input} type='text' handleSave={onCreate} value1={cameraData.name}/>
            )}
          </FormItem>
          <FormItem label='RSTP URL' {...formItemLayout}>
            {getFieldDecorator('rtspUrl')(
              <CustomInput style={styles.input} type='text' handleSave={onCreate} value1={cameraData.rtspUrl}/>
            )}
          </FormItem>
          <FormItem label='Username' {...formItemLayout}>
            {getFieldDecorator('username')(
              <CustomInput style={styles.input} type='text' handleSave={onCreate} value1={cameraData.username}/>
            )}
          </FormItem>
          <FormItem label='Password' {...formItemLayout}>
            {getFieldDecorator('password')(
              <CustomInput style={styles.input} type='password' handleSave={onCreate} value1={cameraData.password}/>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

class EditCamera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: false
    }
  }

  cameraData = {
    image: this.props.data.image.original,
    name: this.props.data.name,
    rtspUrl: this.props.data.rtspUrl,
    username: this.props.data.username,
    password: '****'
  }
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

      switch (e.target.id) {
        case 'name':
          this.setState({name: e.target.value});
          this.cameraData.name = e.target.value;
          break;

        case 'rtspUrl':
          this.setState({rtspUrl: e.target.value});
          this.cameraData.rtspUrl = e.target.value;
          break;

        case 'username':
          this.setState({username: e.target.value});
          this.cameraData.username = e.target.value;
          break;

        case 'password':
          this.setState({password: e.target.value});
          this.cameraData.password = e.target.value;
          break;
      }


      // console.log('Received values of form: ', this.cameraData);
      // form.resetFields();
      this.setState({visible: true});
    });
  };

  render() {
    return (
      <div>
        <Icon type='tool' onClick={this.showModal} style={styles.editCamera}/>
        <CameraLicensesForm
          ref={(form) => this.form = form}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          error={this.state.error}
          cameraData={this.cameraData}
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
  editCamera: {
    float: 'right',
    fontSize: 18
  },
  image: {
    width: '50%'
  }
};
export default withRouter(EditCamera);
