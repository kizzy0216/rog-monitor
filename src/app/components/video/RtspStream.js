import React, { Component } from 'react';

import KurentoClient from '../../../lib/kurento/kurento-client';
import kurentoUtils from '../../../lib/kurento/kurento-utils';

import loading from '../../../assets/img/loading.gif';

export default class RtspStream extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      webRtcPeer: null,
      pipeline: null
    }
  }

  componentDidMount() {
    this._setIceServers();
    this._startVideo();
  }

  componentWillUnmount() {
    this._stop();
  }

  _stop = () => {
    if (this.state.webRtcPeer) {
      this.state.webRtcPeer.dispose();
      this.setState({webRtcPeer: null});
    }
    if (this.state.pipeline) {
      this.state.pipeline.release();
      this.setState({pipeline: null});
    }
  }

  _onError = (error) => {
    if (error) {
      console.error(error);
      this._stop();
    }
  }

  _onOffer = (error, sdpOffer) => {
    const _this = this;
    const onError = this._onError;
    const rtspUrl = this.props.rtspUrl;
    const webRtcPeer = this.state.webRtcPeer;

    if (error) return onError(error);

    function setIceCandidateCallbacks(webRtcEndpoint, webRtcPeer, onError) {
      webRtcPeer.on('icecandidate', function(candidate) {
        candidate = kurentoClient.register.complexTypes.IceCandidate(candidate);
        webRtcEndpoint.addIceCandidate(candidate, onError);
      });

      webRtcEndpoint.on('OnIceCandidate', function(event) {
        var candidate = event.candidate;
        webRtcPeer.addIceCandidate(candidate, onError);
      });
    }

    kurentoClient(process.env.REACT_APP_KURENTO_WS_URL, function(error, kurentoClient) {
      if(error) return onError(error);

      kurentoClient.create('MediaPipeline', function(error, pipeline) {
        if(error) return onError(error);

        _this.setState({pipeline});
        pipeline.create('PlayerEndpoint', {uri: rtspUrl}, function(error, player) {
          if(error) return onError(error);

          pipeline.create('WebRtcEndpoint', function(error, webRtcEndpoint) {
            if(error) return onError(error);

            setIceCandidateCallbacks(webRtcEndpoint, webRtcPeer, onError);

            webRtcEndpoint.processOffer(sdpOffer, function(error, sdpAnswer) {
              if(error) return onError(error);

              webRtcEndpoint.gatherCandidates(onError);
              webRtcPeer.processAnswer(sdpAnswer);
            });

            player.connect(webRtcEndpoint, function(error) {
              if(error) return onError(error);

              player.play(function(error) {
                if(error) return onError(error);
              });
            });
          });
        });
      });
    });
  }

  _showLoading = (video) => {
    video.poster = loading;
  }

  _hideLoading = (video) => {
    video.poster = '';
  }

  _setIceServers = () => {
    if (process.env.REACT_APP_ICE_SERVERS) {
      kurentoUtils.WebRtcPeer.prototype.server.iceServers = JSON.parse(process.env.REACT_APP_ICE_SERVERS);
    }
  }

  _startVideo = () => {
    const videoOutput = document.getElementById('videoOutput');
    const options = {remoteVideo: videoOutput};
    const onOffer = this._onOffer;

    this._showLoading(videoOutput);

    let webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
      function(error) {
        if (error) {
          return console.error(error);
        }

        webRtcPeer.generateOffer(onOffer);
        webRtcPeer.peerConnection.addEventListener('iceconnectionstatechange', function(event) {
          if(webRtcPeer && webRtcPeer.peerConnection){
            console.log('oniceconnectionstatechange -> ' + webRtcPeer.peerConnection.iceConnectionState);
            console.log('icegatheringstate -> ' + webRtcPeer.peerConnection.iceGatheringState);
          }
        });
    });

    this.setState({webRtcPeer});
  }

  render() {
    return (
      <video id='videoOutput' width='100%' autoPlay onClick={(e) => console.log(e.target.webkitRequestFullscreen())} />
    )
  }
}
