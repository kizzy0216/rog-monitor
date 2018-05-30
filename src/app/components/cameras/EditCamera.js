import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Form, Input, Button, message } from 'antd';
import CustomInput from '../../components/formitems/CustomInput';

import { editCamera } from '../../redux/cameras/actions'
import loading from '../../../assets/img/TempCameraImage.jpeg'

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
      <Modal title={`Edit ${cameraData.name}`}
             visible={visible}
             style={styles.modal}
             onCancel={onCancel}
             footer={[null, null]}
      >
        <Form>
          <FormItem>
            {cameraData.image.original ?
              <img src={cameraData.image.original} style={styles.image} /> :
              <img src={loading} style={styles.image} />
            }
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
          <FormItem label='Username' {...formItemLayout}>
            {getFieldDecorator('username')(
              <CustomInput style={styles.input} type='text' handleSave={onCreate} value1={cameraData.username}/>
            )}
          </FormItem>
          <FormItem label='Password' {...formItemLayout}>
            {getFieldDecorator('password')(
              <CustomInput style={styles.input} type='password' handleSave={onCreate} value1="********" />
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
      error: false,
      flag: false
    }
  }

  cameraData = {
    image: this.props.data.image.original,
    name: this.props.data.name,
    username: this.props.data.username,
    password: '****'
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

      let cameraData = {};
      cameraData[e.target.id] = e.target.value.trim();

      this.props.editCamera(this.props.user, this.props.data.id, cameraData);
      this.setState({visible: true});
      this.setState({flag: true});
    });
  };

  componentWillReceiveProps(nextProps){
    if (this.props.data.id === nextProps.data.id) {
      if (this.state.flag == true) {
        if (nextProps.editCameraError !== '' && this.props.editCameraError !== nextProps.editCameraError) {
          message.error(nextProps.editCameraError);
          this.setState({flag: false});
        }
        if (nextProps.editCameraSuccess === true) {
          this.setState({flag: false});
          this.cameraData = nextProps.data;
        }
      }
    }
  }

  render() {
    return (
      <div>
        <Icon type='setting' onClick={this.showModal} style={styles.editCamera}/>
        <CameraLicensesForm
          ref={(form) => this.form = form}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          error={this.state.error}
          cameraData={this.props.data}
        />
      </div>
    );
  }
}

const styles = {
  modal: {
    textAlign: 'center',
    wordBreak: 'break-word'
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

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    editCameraInProcess: state.cameras.editCameraInProcess,
    editCameraError: state.cameras.editCameraError,
    editCameraSuccess: state.cameras.editCameraSuccess,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    editCamera: (user, camera, cameraData) => dispatch(editCamera(user, camera, cameraData)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCamera);
