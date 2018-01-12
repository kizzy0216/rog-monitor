import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layout, Row, Col, Form, Icon, Button, Input, Checkbox } from 'antd';
const { Header, Content } = Layout;

import logoFull from '../../assets/img/logo-full.png';

import { login } from '../redux/auth/actions';
import RegisterBtn from '../components/navigation/RegisterBtn';
import RequestInviteModal from '../components/modals/RequestInviteModal';

const FormItem = Form.Item;

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inviteModalVisible: false
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.login(values.email, values.password);
      }

    });
  }

  toggleInviteModalVisibility = () => {
    this.setState({inviteModalVisible: !this.state.inviteModalVisible});
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
            <Row type='flex' justify='center' align='top'>
              <Col xs={{span: 0}} sm={{span: 12}}>
                <Row type='flex' justify='center' align='middle'>
                  <Col sm={{span: 24}} style={styles.titleText}>
                    <h1>Add Threat Detection to Any IP Camera</h1>
                    <h2>As easy as drawing a box</h2>
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='middle'>
                  <Col sm={{span: 24}}>
                    {/* insert image here */}
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='bottom'>
                  <Col sm={{span: 24}} style={styles.downloadBtnContainer}>
                    <Button type='primary' size={'large'} style={styles.downloadBtn}>
                      <a href='https://www.gorog.co/download.html' target='_blank' style={{textDecoration: 'none'}}>Download it free</a>
                    </Button>
                    <div style={styles.howItWorksLink}>
                      <a href=''>Learn how it works.</a>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col xs={{span: 24}} sm={{span: 12}} style={styles.backgroundWhite}>
                <Row type='flex' justify='center' align='middle'>
                  <Col xs={{span: 24}} style={styles.textCenter}>
                    <p style={styles.signUpText}>New to ROG?</p>
                    {/* <RegisterBtn /> */}
                    <Button onClick={this.toggleInviteModalVisibility} key='submit' type='primary' size='large' style={styles.inviteBtn}>
                      Request Invite
                    </Button>
                    <RequestInviteModal visible={this.state.inviteModalVisible} toggleInviteModalVisibility={this.toggleInviteModalVisibility.bind(this)} />
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='middle'>
                  <Col xs={{span: 18}} sm={{span: 12}}>
                    <div style={styles.dividerContainer}>
                      <span style={styles.dividerLine}>
                        or
                      </span>
                    </div>
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='middle'>
                  <Col xs={{span: 24}} style={styles.signInText}>
                    <p>Existing ROG Account? <br /> Sign In</p>
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='middle'>
                  <Col xs={{span: 24}} style={styles.loginError}>
                    <p>{this.props.loginError}</p>
                  </Col>
                </Row>
                <Row type='flex' justify='center' align='middle'>
                  <Col xs={{span: 18}} sm={{span: 12}}>
                    <Form onSubmit={this.handleSubmit} className='login-form'>
                      <FormItem label='Email' hasFeedback>
                        {getFieldDecorator('email', {
                          rules: [
                            { type: 'email', message: 'This is not a valid email' },
                            { required: true, message: 'Please enter your email' }],
                        })(
                          <Input />
                        )}
                      </FormItem>
                      <FormItem label='Password' hasFeedback>
                        {getFieldDecorator('password', {
                          rules: [
                            { required: true, message: 'Please enter your password' }
                          ],
                        })(
                          <Input type='password' />
                        )}
                      </FormItem>
                      <FormItem>
                        {getFieldDecorator('remember', {
                          valuePropName: 'checked',
                          initialValue: true,
                        })(
                          <Checkbox style={styles.rememberUserId}>Remember my user ID</Checkbox>
                        )}
                      </FormItem>
                      <FormItem>
                        <Button style={styles.signInBtn} type='primary' htmlType='submit' disabled={this.props.loginInProcess}>
                          <Icon type={this.props.loginInProcess ? 'loading' : 'lock'} style={styles.font13} />&nbsp;Sign In
                        </Button>
                      </FormItem>
                    </Form>
                    <div style={styles.licenseAgreement}>
                      <p>
                        By clicking Sign In, you agree to our <br />
                        <a target='_blank' href='https://www.gorog.co/license.html'>License Agreement</a>
                      </p>
                    </div>
                    <div style={styles.forgotPassword}>
                      <a href=''>I forgot my user ID or Password</a>
                    </div>
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
    zIndex: 0 // Required for Content to scroll under Header
  },
  signUpBtn: {
    backgroundColor: 'orange',
    border: 'none',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 500,
    padding: '10px 20px 35px'
  },
  signInBtn: {},
  inviteBtn: {
    backgroundColor: 'orange',
    border: 'none',
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 500,
  },
  dividerContainer: {
    width: '100%',
    height: '20px',
    borderBottom: '1px solid black',
    textAlign: 'center',
    margin: '0 auto',
    marginBottom: 20
  },
  textCenter: {
    textAlign: 'center'
  },
  font13: {
    fontSize: 13
  },
  dividerLine: {
    display: 'inline-block',
    paddingTop: 8,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: '13px',
    backgroundColor: '#fff'
  },
  backgroundWhite: {
    backgroundColor: '#fff',
    height: 'calc(100vh - 65px)'
  },
  signUpText: {
    paddingTop: 40,
    paddingBottom: 20,
    fontWeight: 600,
    fontSize: 16
  },
  signInText: {
    fontWeight: 600,
    textAlign: 'center',
    paddingTop: 0,
    paddingBottom: 20,
    fontSize: 16
  },
  loginError: {
    fontWeight: 600,
    textAlign: 'center',
    color: 'red'
  },
  rememberUserId: {
    fontWeight: 700
  },
  forgotPassword: {
    marginTop: 20
  },
  titleText: {
    textAlign: 'center',
    marginTop: 40
  },
  downloadBtnContainer: {
    textAlign: 'center'
  },
  downloadBtn: {
    backgroundColor: 'orange',
    border: 'none',
    fontSize: 20,
    fontWeight: 500,
    padding: '10px 20px 35px',
    marginTop: 20
  },
  howItWorksLink: {
    fontSize: 18,
    fontWeight: 600,
    marginTop: 20
  }
}

const mapStateToProps = (state) => {
  return {
    loginInProcess: state.auth.loginInProcess,
    loginError: state.auth.loginError
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    login: (email, password) => dispatch(login(email, password))
  }
}

const WrappedLoginForm = Form.create()(Login);
export default connect(mapStateToProps, mapDispatchToProps)(WrappedLoginForm);
