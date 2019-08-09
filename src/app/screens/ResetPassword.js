import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Layout, Row, Col, Form, Icon, Button, Input, Checkbox, message } from 'antd';
const { Header, Content } = Layout;

import axios from 'axios';

import logoFull from '../../assets/img/logo-full.png';

import { getPasswordResetRequest, resetPassword } from '../redux/auth/actions';
import SignInLink from '../components/navigation/SignInLink';

const FormItem = Form.Item;

class ResetPassword extends Component {
  constructor(props) {
    console.log("HIT!");
    super(props);

    this.state = {
      confirmDirty: false
    }
  }

  UNSAFE_componentWillMount = () => {
    this.props.getPasswordResetRequest(this.props.match.params.token);
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (nextProps.resetPasswordSuccess && this.props.resetPasswordSuccess !== nextProps.resetPasswordSuccess) {
      message.success('Password reset complete! Please log in.');
      this.props.history.push('/login');
    }

    if (nextProps.resetPasswordError && this.props.resetPasswordError !== nextProps.resetPasswordError) {
      message.error(nextProps.resetPasswordError);
      if (nextProps.resetPasswordError === 'Invalid request') {
        this.props.history.push('/login');
      }
    }

    if (nextProps.getPasswordResetRequestError && this.props.getPasswordResetRequestError !== nextProps.getPasswordResetRequestError) {
      message.error(nextProps.getPasswordResetRequestError);
      this.props.history.push('/login');
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.resetPassword(values.password, values.confirmPassword, this.props.match.params.token);
      }

    });
  }

  checkPasswordLength = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value.length < 8) {
      callback('Password must be at least 8 characters long');
    } else {
      callback();
    }
  }

  checkConfirmPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('The passwords must match');
    } else {
      callback();
    }
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Layout>
        <Header style={styles.header}>
          <img style={styles.headerLogo} src={logoFull} height='50px'/>
        </Header>
        <Layout>
          <Content style={styles.content}>
            <Row type='flex' justify='center' align='middle'>
              <Col xs={{span: 24}} sm={{span: 12}} style={styles.leftContainer}>
                <Row type='flex' justify='center' align='top'>
                  <Col xs={{span: 22}} sm={{span: 18}} md={{span: 14}} lg={{span: 10}} style={styles.resetPasswordFormHeadText}>
                    <h1>Reset Your Password</h1>
                    {/* <p style={styles.signInLinkCaption}>Already have an account?&nbsp;<SignInLink /></p> */}
                    <p style={{color: 'red'}}>{this.props.resetPasswordError}</p>
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='middle'>
                  <Col xs={{span: 22}} sm={{span: 18}} md={{span: 14}} lg={{span: 10}}>
                    <Form onSubmit={this.handleSubmit} className='resetPassword-form'>
                      <FormItem label='New Password' hasFeedback>
                        {getFieldDecorator('password', {
                          rules: [
                            {required: true, message: 'Please choose a password'},
                            {validator: this.checkPasswordLength}
                          ],
                        })(
                          <Input type='password' onBlur={this.validateStatus} />
                        )}
                      </FormItem>
                      <FormItem label="Confirm New Password" hasFeedback>
                        {getFieldDecorator('confirmPassword', {
                          rules: [
                            {required: true, message: 'Please confirm your password'},
                            {validator: this.checkConfirmPassword}
                          ],
                        })(
                          <Input type="password" onBlur={this.handleConfirmBlur} />
                        )}
                      </FormItem>
                      <FormItem>
                        <Button style={styles.signUpBtn} type='primary' htmlType='submit' disabled={this.props.resetPasswordInProcess}>
                          <Icon type={this.props.resetPasswordInProcess ? 'loading' : 'lock'} style={styles.font13} />
                          &nbsp;Reset Password
                        </Button>
                      </FormItem>
                    </Form>
                  </Col>
                </Row>
              </Col>
              <Col xs={{span: 0}} sm={{span: 12}} style={styles.rightContainer}>
                <Row type='flex' justify='center' align='top'>
                  <Col sm={{span: 18}} style={styles.rightHeadTitle}>
                    <h2>Welcome to ROG</h2>
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='top'>
                  <Col sm={{span: 18}} style={styles.rightHeadCaption}>
                    <h3>Where guards are alerted to potential threats.</h3>
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='middle'>
                  <Col sm={{span: 18}}>
                    {/* IMAGES GO HERE */}
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='middle'>
                  <Col sm={{span: 18}} style={styles.promotionText}>
                    <h3>Just for you: Setup your first camera on us for the first 30 days.</h3>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    )
  }
}

const styles = {
  header: {
    position: 'fixed',
    width: '100%',
    height: '65px',
    color: 'white',
    backgroundColor: 'black',
    zIndex: 1 // Required for Content to scroll under Header
  },
  headerLogo: {
    float: 'right',
    marginTop: 8
  },
  content: {
    marginTop: 65,
    zIndex: 0, // Required for Content to scroll under Header
  },
  leftContainer: {
    backgroundColor: '#fff'
  },
  signUpBtn: {
    backgroundColor: 'green'
  },
  resetPasswordFormHeadText: {
    marginTop: 30,
    marginBottom: 10
  },
  phoneCaption: {
    fontSize: 10,
    marginTop: -10
  },
  signInLinkCaption: {
    fontSize: 16
  },
  rightContainer: {
    textAlign: 'center'
  },
  rightHeadTitle: {
    fontSize: 16
  },
  rightHeadCaption: {
    fontSize: 16
  },
  promotionText: {
    textAlign: 'left',
    fontSize: 16
  },
  termsOfServiceText: {
    marginBottom: 20
  }
}

const mapStateToProps = (state) => {
  return {
    resetPassword: state.auth.resetPassword,
    getPasswordResetRequestInProcess: state.auth.getPasswordResetRequestInProcess,
    getPasswordResetRequestError: state.auth.getPasswordResetRequestError,
    resetPasswordInProcess: state.auth.resetPasswordInProcess,
    resetPasswordError: state.auth.resetPasswordError,
    resetPasswordSuccess: state.auth.resetPasswordSuccess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getPasswordResetRequest: (token) => dispatch(getPasswordResetRequest(token)),
    resetPassword: (password, passwordConfirm, token) => dispatch(resetPassword(password, passwordConfirm, token))
  }
}

const WrappedResetPasswordForm = Form.create()(ResetPassword);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WrappedResetPasswordForm));
