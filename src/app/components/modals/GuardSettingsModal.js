import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Button, Row, Col, message } from 'antd';

import { rescindInvite } from '../../redux/invites/actions';
import { removeGuard } from '../../redux/cameraGroups/actions';

const GuardSettings = (props) => {
  if (props.invites.length || props.guards.length) {
    return (
      <Modal
        title='Guard Settings'
        visible={props.visible}
        style={styles.modal}
        onCancel={props.onCancel}
        footer={[null, null]}
      >
        {props.invites.map(invite => (
          <Row key={invite.id} style={styles.inviteContainer}>
            <Col xs={{span: 11, offset: 1}} style={styles.guardNameContainer}>
              <Col xs={{span: 24}} style={styles.guardName}>
                {invite.inviteeEmail}
              </Col>
              <Col xs={{span: 24}} style={styles.guardAction}>
                Invited
              </Col>
            </Col>
            <Col xs={{span: 6, offset: 3}} style={styles.rescindRemoveButtons} onClick={() => props.rescindInviteInProcess ? '' : props.rescindInvite(props.user, invite)}>
              <Col xs={{span: 24}}>
                <Button style={styles.button}>Rescind</Button>
              </Col>
              <Col xs={{span: 24}}>
                <Icon type='close' />
              </Col>
            </Col>
          </Row>
        ))}

        {props.guards.map(guard => (
          <Row key={guard.id} style={styles.inviteContainer}>
            <Col xs={{span: 11, offset: 1}} style={styles.guardNameContainer}>
              <Col xs={{span: 24}} style={styles.guardName}>
                {guard.user.firstName} {guard.user.lastName}
              </Col>
              <Col xs={{span: 24}} style={styles.guardAction}>
                Role: {guard.role}
              </Col>
            </Col>
            <Col xs={{span: 6, offset: 3}} style={styles.rescindRemoveButtons} onClick={() => props.removeGuardInProcess ? '' : props.removeGuard(props.user, guard)}>
              <Col xs={{span: 24}}>
                <Button style={styles.button}>Remove</Button>
              </Col>
              <Col xs={{span: 24}}>
                <Icon type='close' />
              </Col>
            </Col>
          </Row>
        ))}
      </Modal>
    )
  }
  else {
    return (
      <Modal
        title='Guard Settings'
        visible={props.visible}
        style={styles.modal}
        onCancel={props.onCancel}
        footer={[null, null]}
      >
        <div>You have not invited any guards.</div>
      </Modal>
    )
  }
}

class GuardSettingsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.rescindInviteError && nextProps.rescindInviteError !== this.props.rescindInviteError) {
      message.error(nextProps.rescindInviteError);
    }

    if (nextProps.removeGuardError && nextProps.removeGuardError !== this.props.removeGuardError) {
      message.error(nextProps.removeGuardError);
    }
  };

  showModal = () => {
    this.setState({visible: true});
  };

  handleCancel = () => {
    this.setState({visible: false});
  };

  render() {
    return (
      <div>
        <div onClick={this.showModal}>
          <Icon type='team'/>
          &nbsp;
          Guard Settings
        </div>
        <GuardSettings
          visible={this.state.visible}
          onCancel={this.handleCancel}
          user={this.props.user}
          guards={this.props.selectedCameraGroup.guards.filter(guard => guard.user.id !== this.props.user.id)}
          removeGuard={this.props.removeGuard}
          removeGuardInProcess={this.props.removeGuardInProcess}
          invites={this.props.selectedCameraGroup.cameraGroupGuardInvitations}
          rescindInvite={this.props.rescindInvite}
          rescindInviteInProcess={this.props.rescindInviteInProcess}
        />
      </div>
    );
  }
}

const styles = {
  modal: {
    textAlign: 'center'
  },
  inviteContainer: {
    marginTop: 10,
    marginBottom: 10
  },
  button: {
    fontSize: 16,
    fontWeight: 400,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  rescindRemoveButtons: {
    backgroundColor: 'grey',
    color: '#fff',
    fontSize: 24,
  },
  guardNameContainer: {
    textAlign: 'left',
    borderLeft: '5px solid blue',
    paddingLeft: 15,
    color: 'grey'
  },
  guardName: {
    color: 'grey',
    fontSize: 18
  },
  guardAction: {
    marginTop: 15,
    marginBottom: 10
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    removeGuardInProcess: state.cameraGroups.removeGuardInProcess,
    removeGuardError: state.cameraGroups.removeGuardError,
    rescindInviteInProcess: state.invites.rescindInviteInProcess,
    rescindInviteError: state.invites.rescindInviteError,
    selectedCameraGroup: state.cameraGroups.selectedCameraGroup
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeGuard: (user, guard) => dispatch(removeGuard(user, guard)),
    rescindInvite: (user, invite) => dispatch(rescindInvite(user, invite))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GuardSettingsModal);
