import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon, Button, message } from 'antd';
import { updatePreviewImage } from '../../redux/cameras/actions';

let timeout = false;

class RefreshPreviewImage extends Component {

  constructor() {
    super();
    this.state = {
      disabledFlag: false
    };
  }

  flagTimeout = () => {
    if (!timeout) {
      timeout = setTimeout(() => {
        this.setState({disabledFlag: false});
        message.error('Timeout for fetching image.');
        clearTimeout(timeout);
      }, 90000);
    }
  }

  removeTimeout = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  }

  updatePreviewImage = () => {
    this.props.updatePreviewImage(this.props.data.id);
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
    backgroundColor: 'white'
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
    updatePreviewImage: (cameraId) => dispatch(updatePreviewImage(cameraId))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RefreshPreviewImage));
