import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, Select, Row, Col, Icon, Modal, Button, Input, Form, Tooltip, message } from 'antd';
const Option = Select.Option;

import CameraTiles from '../components/cameras/CameraTiles';
import AddLocationModal from '../components/modals/AddLocationModal';
import CameraOptionButtons from '../components/cameras/CameraOptionButtons';

import * as locationActions from '../redux/locations/actions';
import { trackEventAnalytics } from '../redux/auth/actions'

class CameraList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rtspUrl: '',
      liveView: true,
      locationButtonsVisible: false,
      addLocationModalVisible: false
    }
  }

  componentWillMount = () => {
    this.props.actions.fetchLocations(this.props.user, this.props.rummage, true);
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
                (<span></span>) :
                (
                  <Tooltip title='Toggle Location Options' placement='bottom'>
                    <Icon style={styles.toggleLocationOptions} type='ellipsis' onClick={this.toggleLocationButtonsVisability} />
                  </Tooltip>
                )
              }
            </Col>
            <CameraOptionButtons
              user={this.props.user}
              selectedLocation={this.props.selectedLocation}
              visible={this.state.locationButtonsVisible} />
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
    deleteCameraError: state.cameras.deleteCameraError
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(locationActions, dispatch),
    addLocationCamera: (user, location, name, rtspUrl, username, password) => dispatch(addLocationCamera(user, location, name, rtspUrl, username, password)),
    trackEventAnalytics: (event, data) => dispatch(trackEventAnalytics(event, data)),

  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraList);
