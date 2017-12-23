import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Modal, Button, Row, Col, message } from 'antd';

import { rescindInvite } from '../../redux/invites/actions';
import { removeGuard } from '../../redux/locations/actions';

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
          <Row key={invite.id}>
            <Col span={6}>{invite.inviteeEmail}</Col>
            <Col span={6}>Invited</Col>
            <Col span={12}>
              <Button
                disabled={props.rescindInviteInProcess}
                onClick={() => props.rescindInvite(props.user, invite)}>
                Rescind
              </Button>
            </Col>
          </Row>
        ))}

        {props.guards.map(guard => (
          <Row key={guard.id}>
            <Col span={6}>{guard.user.firstName} {guard.user.lastName}</Col>
            <Col span={6}>Role: {guard.role}</Col>
            <Col span={12}>
              <Button
                disabled={props.removeGuardInProcess}
                onClick={() => props.removeGuard(props.user, guard)}>
                Remove
              </Button>
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
          guards={this.props.selectedLocation.guards.filter(guard => guard.user.id !== this.props.user.id)}
          removeGuard={this.props.removeGuard}
          removeGuardInProcess={this.props.removeGuardInProcess}
          invites={this.props.selectedLocation.locationGuardInvitations}
          rescindInvite={this.props.rescindInvite}
          rescindInviteInProcess={this.props.rescindInviteInProcess}
        />
      </div>
    );
  }
}

const styles = {
  modal: {
    textAlign: 'center',
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    removeGuardInProcess: state.locations.removeGuardInProcess,
    removeGuardError: state.locations.removeGuardError,
    rescindInviteInProcess: state.invites.rescindInviteInProcess,
    rescindInviteError: state.invites.rescindInviteError,
    selectedLocation: state.locations.selectedLocation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeGuard: (user, guard) => dispatch(removeGuard(user, guard)),
    rescindInvite: (user, invite) => dispatch(rescindInvite(user, invite))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GuardSettingsModal);
