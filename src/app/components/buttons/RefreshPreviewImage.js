import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon, Button } from 'antd';
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
    if (nextProps.data.id === nextProps.imageUpdateInProgressId) {
      if (nextProps.imageUpdateInProgress) {
        this.setState({disabledFlag: true});
      } else {
        this.setState({disabledFlag: false});
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
