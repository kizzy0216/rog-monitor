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
    timeout[this.props.data.id] = setTimeout(() => {
      this.setState({disabledFlag: false});
      message.error('Timeout for fetching image.');
    }, 90000);
  }

  removeTimeout = () => {
    clearTimeout(timeout[this.props.data.id]);
  }

  updatePreviewImage = () => {
    this.props.updatePreviewImage(this.props.data.user, this.props.data.cameraGroup, this.props.data.id);
    this.setState({disabledFlag: true});
    this.flagTimeout();
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.id === nextProps.imageUpdateInProgressId) {
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
    imageUpdateInProgressId: state.cameras.imageUpdateInProgressId,
  }
}

const mapDispatchToProps = (dispatch) => {
  return{
    updatePreviewImage: (user, cameraGroupsId, cameraId) => dispatch(updatePreviewImage(user, cameraGroupsId, cameraId))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RefreshPreviewImage));
