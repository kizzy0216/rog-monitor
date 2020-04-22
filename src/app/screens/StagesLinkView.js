import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import VideoPlayer from 'react-video-js-player';

class StagesLinkView extends Component {

  constructor() {
    super();
    this.state = {};
    this.key = this.uuidv4;
  }

  uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  render() {
    return (
      <div style={styles.cameraCardImgContainer} key={this.key}>
      <img src={this.props.match.params.image_url} style={styles.cameraCardImg} />
        <VideoPlayer
          controls={true}
          hideControls={['volume', 'seekbar', 'timer', 'playbackrates']}
          preload='auto'
          bigPlayButton={true}
          autoPlay={true}
          height='300'
          poster={this.props.match.params.image_url}
          src={this.props.match.params.live_view_url}
          className="cameraCardImg">
        </VideoPlayer>
      </div>
    );
  }
}

const styles = {
  cameraCardImgContainer: {
    backgroundColor: 'white',
    height: 300,
    width: '100%',
    position: 'relative',
    margin: '0 auto',
    paddingLeft: 0,
    paddingRight: 0
  },
  cameraCardImg: {
    position: 'absolute',
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto'
  }
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return{}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StagesLinkView));
