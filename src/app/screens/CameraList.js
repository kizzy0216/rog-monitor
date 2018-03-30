import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, Select, Row, Col, Icon, Modal, Button, Input, Form, Tooltip, message, Popconfirm } from 'antd';
const Option = Select.Option;

import CameraTiles from '../components/cameras/CameraTiles';
import AddLocationModal from '../components/modals/AddLocationModal';
import CameraOptionButtons from '../components/cameras/CameraOptionButtons';

import { listenForNewImageThumbnails } from '../redux/cameras/actions';
import * as locationActions from '../redux/locations/actions';
import { trackEventAnalytics } from '../redux/auth/actions';
import { removeGuard } from '../redux/locations/actions';

class CameraList extends Component {
  constructor(props) {
    super(props);
    let currentGuard = '';
    this.state = {
      rtspUrl: '',
      liveView: true,
      locationButtonsVisible: false,
      addLocationModalVisible: false
    }
  }

  componentWillMount = () => {
    this.props.actions.fetchLocations(this.props.user, this.props.rummage, true);
    this.props.listenForNewImageThumbnails(this.props.user);
  }
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.locations.length && !nextProps.selectedLocation.name) {
      this.selectLocation(nextProps.locations[0]);
    }

    if (this.props.selectedLocation.cameras.length > 0) {
      const locationOwnedEvent = {
        email: this.props.user.email,
        name: this.props.user.firstName+ ' ' +this.props.user.lastName,
        location_owned: this.props.locations.length,
        camera_owned: this.props.selectedLocation.cameras.length
      };

      this.props.trackEventAnalytics('location owned', locationOwnedEvent);
    }

    if (nextProps.deleteCameraSuccess && nextProps.deleteCameraSuccess !== this.props.deleteCameraSuccess) {
      message.success('Camera deleted.');
    }

    if (nextProps.deleteCameraError && nextProps.deleteCameraError !== this.props.deleteCameraError) {
      message.error(nextProps.deleteCameraError);
    }

    if (nextProps.rescindInviteError && nextProps.rescindInviteError !== this.props.rescindInviteError) {
      message.error(nextProps.rescindInviteError);
    }

    if (nextProps.removeGuardError && nextProps.removeGuardError !== this.props.removeGuardError) {
      message.error(nextProps.removeGuardError);
    }
  }

  selectLocation = (location) => {
    this.props.actions.selectLocation(location);
  }

  toggleLocationButtonsVisability = () => {
    this.setState({locationButtonsVisible: !this.state.locationButtonsVisible})
  }

  toggleAddLocationModalVisibility = () => {
    this.setState({addLocationModalVisible: !this.state.addLocationModalVisible})
  }

  render() {
    if (this.props.locations.length) {
      return (
        <div>
          <Row type='flex' justify='center' align='middle' style={styles.cameraOptions}>
            <Col xs={{span: 2}} sm={{span: 1}}>
              {this.props.selectedLocation.myRole}
            </Col>
            <Col xs={{span: 12}} sm={{span: 6}}>
              <Select style={styles.select} value={this.props.selectedLocation.name}
                      onSelect={(value, option) => this.selectLocation(option.props.location)}>
                {this.props.locations.map(location => (
                  <Option key={`location-${location.id}`} location={location}>{location.name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={{span: 2}} sm={{span: 1}} style={styles.toggleLocationOptionsContainer}>
              {this.props.selectedLocation.myRole === 'viewer' ?
                (
                  this.props.selectedLocation.guards.map(guard => (
                    guard.user.id == this.props.user.id ?
                      <Tooltip key={guard.id} title='Remove Location' placement='bottom'>
                        <Popconfirm title="Are you sure you want to stop viewing this location? This action cannot be undone." onConfirm={() => this.props.removeGuardInProcess ? '' : this.props.removeGuard(this.props.user, guard)} okText="Yes, remove location" cancelText="Nevermind">
                          <Button type="danger" icon="close" className="removeLocationButton" style={styles.removeLocationButton} loading={this.props.removeGuardInProcess} disabled={this.props.removeGuardInProcess}></Button>
                        </Popconfirm>
                      </Tooltip>
                    :
                    ''
                  ))
                ) :
                (
                  <Tooltip title='Toggle Location Options' placement='bottom'>
                    <Icon style={styles.toggleLocationOptions} type='ellipsis' onClick={this.toggleLocationButtonsVisability} />
                  </Tooltip>
                )
              }
            </Col>
            {this.props.selectedLocation.myRole === 'viewer' ?
              (<span></span>) :
              (
                <CameraOptionButtons
                  user={this.props.user}
                  selectedLocation={this.props.selectedLocation}
                  visible={this.state.locationButtonsVisible} />
              )
            }
          </Row>

          <CameraTiles user={this.props.user} location={this.props.selectedLocation} liveView={this.state.liveView} />
        </div>
      )
    }
    else {
      return (
        <Row type='flex' justify='start' style={styles.locationContainer}>
          <Button style={styles.noLocationsBtn}>
            <AddLocationModal linkText='Create a location to onboard cameras.' />
          </Button>
        </Row>
      )
    }
  }
}

const styles = {
  cameraOptions: {
    marginBottom: 10
  },
  select: {
    width: '100%'
  },
  toggleLocationOptionsContainer: {
    width: 28
  },
  toggleLocationOptions: {
    transform: 'rotate(90deg)',
    fontSize: 18,
    paddingBottom: 10
  },
  locationContainer: {
    height: 'calc(100vh - 65px)'
  },
  noLocationsBtn: {
    margin: '0 auto',
    marginTop: 100,
    fontSize: 24,
    backgroundColor: 'transparent'
  }
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    newAlerts: state.auth.newAlerts,
    locations: state.locations.locations,
    selectedLocation: state.locations.selectedLocation,
    fetchError: state.locations.fetchError,
    fetchInProcess: state.locations.fetchInProcess,
    deleteCameraSuccess: state.cameras.deleteCameraSuccess,
    deleteCameraError: state.cameras.deleteCameraError,
    removeGuardInProcess: state.locations.removeGuardInProcess,
    removeGuardError: state.locations.removeGuardError
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(locationActions, dispatch),
    addLocationCamera: (user, location, name, rtspUrl, username, password) => dispatch(addLocationCamera(user, location, name, rtspUrl, username, password)),
    trackEventAnalytics: (event, data) => dispatch(trackEventAnalytics(event, data)),
    listenForNewImageThumbnails: (user) => dispatch(listenForNewImageThumbnails(user)),
    removeGuard: (user, guard) => dispatch(removeGuard(user, guard)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraList);
