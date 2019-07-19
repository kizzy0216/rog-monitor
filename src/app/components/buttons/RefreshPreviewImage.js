import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon, Button, message } from 'antd';
import { updatePreviewImage } from '../../redux/cameras/actions';

let timeout = {};

class RefreshPreviewImage extends Component {

  constructor() {
    super();
    this.state = {
      disabledFlag: false
    };
  }

  flagTimeout = () => {
    timeout[this.props.data.uuid] = setTimeout(() => {
      this.setState({disabledFlag: false});
      message.error('Timeout for fetching image.');
    }, 90000);
  }

  removeTimeout = () => {
    clearTimeout(timeout[this.props.data.uuid]);
  }

  updatePreviewImage = () => {
    this.props.updatePreviewImage(this.props.data.user, this.props.data.cameraGroup, this.props.data.uuid);
    this.setState({disabledFlag: true});
    this.flagTimeout();
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data.uuid === nextProps.imageUpdateInProgressUuid) {
      if (!nextProps.imageUpdateInProgress) {
        this.setState({disabledFlag: false});
        this.removeTimeout();
      }
    }
  }

  render() {
    return (
        <Button style={styles.getThumbnailBtn} onClick={this.updatePreviewImage} disabled={this.state.disabledFlag}>
          {this.state.disabledFlag ? <Icon  type='loading' /> : <Icon type='reload' />}
        </Button>
    );
  }
}

const styles = {
  getThumbnailBtn: {
    backgroundColor: 'white',
    float: 'right'
  },
}

const mapStateToProps = (state) => {
  return {
    imageUpdateInProgress: state.cameras.imageUpdateInProgress,
    imageUpdateInProgressUuid: state.cameras.imageUpdateInProgressUuid,
  }
}

const mapDispatchToProps = (dispatch) => {
  return{
    updatePreviewImage: (user, cameraGroupsUuid, cameraUuid) => dispatch(updatePreviewImage(user, cameraGroupsUuid, cameraUuid))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RefreshPreviewImage));
