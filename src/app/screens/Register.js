import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Layout, Row, Col, Form, Icon, Button, Input, Checkbox, message } from 'antd';
const { Header, Content } = Layout;

import axios from 'axios';

import logoFull from '../../assets/img/logo-full.png';

import { getInvitation, register } from '../redux/auth/actions';
import SignInLink from '../components/navigation/SignInLink';

const FormItem = Form.Item;

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmDirty: false,
      phoneError: false
    }
  }

  componentWillMount = () => {
    this.props.getInvitation(this.props.match.params.token);
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.registerSuccess && this.props.registerSuccess !== nextProps.registerSuccess) {
      message.success('Registration complete! Please log in.');
      this.props.history.push('/login');
    }

    if (nextProps.registerError && this.props.registerError !== nextProps.registerError) {
      message.error(nextProps.registerError);
      if (nextProps.registerError === 'Invalid invitation') {
        this.props.history.push('/login');
      }
    }

    if (nextProps.getInvitationError && this.props.getInvitationError !== nextProps.getInvitationError) {
      message.error(nextProps.getInvitationError);
      this.props.history.push('/login');
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.register(values.email, values.firstName, values.lastName, values.phone, values.password, values.confirmPassword, this.props.match.params.token);
      }

    });
  }

  checkAgreement = (rule, value, callback) => {
    const form = this.props.form;
    if (!value) {
      callback('Please agree to our terms of use.');
    } else {
      callback();
    }
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

  checkPhoneNumber = (rule, value, callback) => {
    const form = this.props.form;
    if (!value) {
      this.setState({phoneError: true});
      callback('Please enter your phone number');
    } else {
      this.setState({phoneError: false});
      callback();
    }
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
                  <Col xs={{span: 22}} sm={{span: 18}} md={{span: 14}} lg={{span: 10}} style={styles.registerFormHeadText}>
                    <h1>Sign Up</h1>
                    {/* <p style={styles.signInLinkCaption}>Already have an account?&nbsp;<SignInLink /></p> */}
                    <p style={{color: 'red'}}>{this.props.registerError}</p>
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='middle'>
                  <Col xs={{span: 22}} sm={{span: 18}} md={{span: 14}} lg={{span: 10}}>
                    <Form onSubmit={this.handleSubmit} className='register-form'>
                      <FormItem label='Email Address' hasFeedback>
                        {getFieldDecorator('email', {
                          initialValue: this.props.invitation ? this.props.invitation.email : ''
                        })(
                          <Input onBlur={this.validateStatus} readOnly />
                        )}
                      </FormItem>
                      <FormItem label='First Name' hasFeedback>
                        {getFieldDecorator('firstName', {
                          rules: [
                            {required: true, message: 'Please enter your first name'}
                          ],
                        })(
                          <Input onBlur={this.validateStatus} />
                        )}
                      </FormItem>
                      <FormItem label='Last Name' hasFeedback>
                        {getFieldDecorator('lastName', {
                          rules: [
                            {required: true, message: 'Please enter your last name'}
                          ],
                        })(
                          <Input onBlur={this.validateStatus} />
                        )}
                      </FormItem>
                      <FormItem label='Phone' hasFeedback>
                        {getFieldDecorator('phone', {
                          rules: [
                            {validator: this.checkPhoneNumber}
                          ],
                        })(
                          <Input onBlur={this.validateStatus} />
                        )}
                      </FormItem>
                      {this.state.phoneError ?
                        ''
                      :
                        <div style={styles.phoneCaption} class="ant-form-explain">Standard call, messaging or data rates may apply</div>
                      }
                      <FormItem label='Password' hasFeedback>
                        {getFieldDecorator('password', {
                          rules: [
                            {required: true, message: 'Please choose a password'},
                            {validator: this.checkPasswordLength}
                          ],
                        })(
                          <Input type='password' onBlur={this.validateStatus} />
                        )}
                      </FormItem>
                      <FormItem label="Confirm Password" hasFeedback>
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
                        <Button style={styles.signUpBtn} type='primary' htmlType='submit' disabled={this.props.registerInProcess}>
                          <Icon type={this.props.registerInProcess ? 'loading' : 'lock'} style={styles.font13} />
                          &nbsp;Sign Up
                        </Button>
                      </FormItem>
                      <FormItem>
                        {getFieldDecorator('termsOfUse', {
                          rules: [
                            {validator: this.checkAgreement}
                          ]
                        })(
                        <Checkbox>By clicking Sign Up, you acknowledge you have read and agree to the <a href='https://www.gorog.co/tc.html' target='_blank'>Terms of Use</a>.</Checkbox>
                        )}
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
  registerFormHeadText: {
    marginTop: 30,
    marginBottom: 10
  },
  phoneCaption: {
    marginTop: -20,
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
    invitation: state.auth.invitation,
    getInvitationInProcess: state.auth.getInvitationInProcess,
    getInvitationError: state.auth.getInvitationError,
    registerInProcess: state.auth.registerInProcess,
    registerError: state.auth.registerError,
    registerSuccess: state.auth.registerSuccess
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getInvitation: (token) => dispatch(getInvitation(token)),
    register: (email, firstName, lastName, phone, password, passwordConfirm, token) => dispatch(register(email, firstName, lastName, phone, password, passwordConfirm, token))
  }
}

const WrappedRegisterForm = Form.create()(Register);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WrappedRegisterForm));
