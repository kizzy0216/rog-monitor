import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import VideoPlayer from 'react-video-js-player';
import queryString from 'query-string';

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
    let search = queryString.parse(this.props.location.search);
    let image_url = search.image_url;
    let live_view_url = search.live_view_url;
    if (typeof image_url !== 'undefined' && typeof live_view_url !== 'undefined') {
      return (
        <div style={styles.cameraCardImgContainer} key={this.key}>
          <VideoPlayer
            controls={true}
            hideControls={['volume', 'seekbar', 'timer', 'playbackrates']}
            preload='auto'
            bigPlayButton={true}
            autoPlay={true}
            height='300'
            poster={image_url}
            src={live_view_url}
            style={styles.cameraCardImg}
          >
          </VideoPlayer>
          <img src={image_url} style={styles.cameraCardImg} />
        </div>
      );
    } else {
      this.props.history.push('/login');
      return(<div></div>);
    }
  }
}

const styles = {
  cameraCardImgContainer: {
    backgroundColor: 'white',
    height: '100%',
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
    float: 'right',
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
