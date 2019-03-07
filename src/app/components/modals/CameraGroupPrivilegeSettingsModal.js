import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Button, Row, Col, message } from 'antd';

import { rescindInvite } from '../../redux/invites/actions';
import { removeUserCameraGroupPrivilege } from '../../redux/cameraGroups/actions';

const UserCameraGroupSettings = (props) => {
  if (props.invites.length > 0 || props.userCameraGroupPrivileges.length > 0) {
    return (
      <Modal
        title='User Camera Group Privileges'
        visible={props.visible}
        style={styles.modal}
        onCancel={props.onCancel}
        footer={[null, null]}
      >
        {props.invites.map(invite => (
          <Row key={invite.id} style={styles.inviteContainer}>
            <Col xs={{span: 11, offset: 1}} style={styles.inviteNameContainer}>
              <Col xs={{span: 24}} style={styles.inviteName}>
                {invite.email}
              </Col>
              <Col xs={{span: 24}} style={styles.inviteAction}>
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
        {/*
          TODO use userCameraGroupPrivileges below to get the required information on each camera group member
        */}
        {props.invites.map(invite => (
          <Row key={invite.id} style={styles.inviteContainer}>
            <Col xs={{span: 11, offset: 1}} style={styles.inviteNameContainer}>
              <Col xs={{span: 24}} style={styles.inviteName}>
                {invite.user.firstName} {invite.user.lastName}
              </Col>
              <Col xs={{span: 24}} style={styles.inviteAction}>
                Role: {invite.role}
              </Col>
            </Col>
            <Col xs={{span: 6, offset: 3}} style={styles.rescindRemoveButtons} onClick={() => props.removeUserCameraGroupPrivilegeInProcess ? '' : props.removeUserCameraGroupPrivilege(props.user, invite)}>
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
        title='User Camera Group Privileges'
        visible={props.visible}
        style={styles.modal}
        onCancel={props.onCancel}
        footer={[null, null]}
      >
        <div>You have not recieved any invitations.</div>
      </Modal>
    )
  }
}

class UserCameraGroupSettingsModal extends Component {
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

    if (nextProps.removeUserCameraGroupPrivilegeError && nextProps.removeUserCameraGroupPrivilegeError !== this.props.removeUserCameraGroupPrivilegeError) {
      message.error(nextProps.removeUserCameraGroupPrivilegeError);
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
          User Camera Group Privileges
        </div>
        <UserCameraGroupSettings
          visible={this.state.visible}
          onCancel={this.handleCancel}
          user={this.props.user}
          userCameraGroupPrivileges={this.props.selectedCameraGroup.userCameraGroupPrivileges.filter(invite => invite.users_id !== this.props.user.id)}
          removeUserCameraGroupPrivilege={this.props.removeUserCameraGroupPrivilege}
          removeUserCameraGroupPrivilegeInProcess={this.props.removeUserCameraGroupPrivilegeInProcess}
          invites={this.props.receivedInvites}
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
  inviteNameContainer: {
    textAlign: 'left',
    borderLeft: '5px solid blue',
    paddingLeft: 15,
    color: 'grey'
  },
  inviteName: {
    color: 'grey',
    fontSize: 18
  },
  inviteAction: {
    marginTop: 15,
    marginBottom: 10
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    removeUserCameraGroupPrivilegeInProcess: state.cameraGroups.removeUserCameraGroupPrivilegeInProcess,
    removeUserCameraGroupPrivilegeError: state.cameraGroups.removeUserCameraGroupPrivilegeError,
    rescindInviteInProcess: state.invites.rescindInviteInProcess,
    rescindInviteError: state.invites.rescindInviteError,
    selectedCameraGroup: state.cameraGroups.selectedCameraGroup,
    receivedInvites: state.invites.receivedInvites
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeUserCameraGroupPrivilege: (user, userCameraGroupPrivilege) => dispatch(removeUserCameraGroupPrivilege(user, userCameraGroupPrivilege)),
    rescindInvite: (user, invite) => dispatch(rescindInvite(user, invite))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCameraGroupSettingsModal);
