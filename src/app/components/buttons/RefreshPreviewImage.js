import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon, Button, message } from 'antd';
import { updatePreviewImage } from '../../redux/cameras/actions';



class RefreshPreviewImage extends Component {

  constructor() {
    super();
    this.state = {
      disabledFlag: false
    };
  }

  updatePreviewImage = () => {
    this.props.updatePreviewImage(this.props.data.id);
  };

  componentWillReceiveProps(nextProps) {
    let flagTimeout;
    if (nextProps.data.id === nextProps.imageUpdateInProgressId) {
      if (nextProps.imageUpdateInProgress) {
        this.setState({disabledFlag: true});
        flagTimeout = setTimeout(() => {
          if (nextProps.imageUpdateInProgress && this.props.data.imageUpdateInProgress === nextProps.imageUpdateInProgress){
            if(this.state.disabledFlag){
              message.error('Error fetching image. Please try again later.');
              this.setState({disabledFlag: false});
              clearTimeout(flagTimeout);
            } else {
              clearTimeout(flagTimeout);
            }
          } else {
            clearTimeout(flagTimeout);
          }
        }, 90000, nextProps);
      } else {
        this.setState({disabledFlag: false});
        clearTimeout(flagTimeout);
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
