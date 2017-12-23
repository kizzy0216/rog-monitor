import React, { Component } from 'react';

import KurentoClient from '../../../lib/kurento/kurento-client';
import kurentoUtils from '../../../lib/kurento/kurento-utils';

import loading from '../../../assets/img/loading.gif';

export default class Recorder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pipeline: null,
      recorder: null,
      recordedFileUri: `file:///tmp/recorded_${this.props.cameraId}_${Date.now()}.webm`
    }
  }

  componentDidMount() {
    this._startRecording();
  }

  componentWillUnmoutn() {
    this._stop();
  }

  _stopRecording = () => {
    this.state.recorder.stop();
    this.state.pipeline.release();
    //this.state.webRtcPeer.dispose();

    this.setState({
      recorder: null,
      pipeline: null
    });
  }

  _startPlayback = () => {
    const onError = this._onError;
    const videoOutput = document.getElementById(`videoOutput-${this.props.cameraId}`);
    const recordedFileUri = this.state.recordedFileUri;
    //this._hideLoading(videoOutput);

    var options = {
      remoteVideo: videoOutput
    };

    let webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(error) {
      if(error) return onError(error)

      this.generateOffer(onPlayOffer)
    });

    function onPlayOffer(error, offer) {
      if (error) return onError(error);

      function setIceCandidateCallbacks(webRtcPeer, webRtcEp, onerror) {
        webRtcPeer.on('icecandidate', function(candidate) {
          candidate = kurentoClient.getComplexType('IceCandidate')(candidate);
          webRtcEp.addIceCandidate(candidate, onerror)
        });

        webRtcEp.on('OnIceCandidate', function(event) {
          var candidate = event.candidate;
          webRtcPeer.addIceCandidate(candidate, onerror);
        });
      }

      kurentoClient(process.env.REACT_APP_KURENTO_WS_URL, function(error, client) {
        if (error) return onError(error);

        client.create('MediaPipeline', function(error, pipeline) {
          if (error) return onError(error);

          pipeline.create('WebRtcEndpoint', function(error, webRtc) {
            if (error) return onError(error);

            setIceCandidateCallbacks(webRtcPeer, webRtc, onError)

            webRtc.processOffer(offer, function(error, answer) {
              if (error) return onError(error);

              webRtc.gatherCandidates(onError);

              webRtcPeer.processAnswer(answer);
            });

            var options = {uri : recordedFileUri}

            pipeline.create('PlayerEndpoint', options, function(error, player) {
              if (error) return onError(error);

              // player.on('EndOfStream', function(event){
              //   pipeline.release();
              //   videoOutput.src = '';

              //   // hideSpinner(videoPlayer);
              // });

              player.connect(webRtc, function(error) {
                if (error) return onError(error);

                player.play(function(error) {
                  if (error) return onError(error);
                });
              });
            });
          });
        });
      });
    };
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

  _startRecording = () => {
    const _this = this;
    const onError = this._onError;
    const rtspUrl = this.props.rtspUrl;
    const recordedFileUri = this.state.recordedFileUri;

    kurentoClient(process.env.REACT_APP_KURENTO_WS_URL, function(error, client) {
      if (error) return onError(error);

      client.create('MediaPipeline', function(error, pipeline) {
        if (error) return onError(error);

        _this.setState({pipeline});

        pipeline.create('RecorderEndpoint', {uri : recordedFileUri}, function(error, recorder) {
          if (error) return onError(error);

          _this.setState({recorder});
          pipeline.create('PlayerEndpoint', {uri: rtspUrl}, function(error, player) {
            if (error) return onError(error);

            _this.setState({player});
            player.connect(recorder, function(error) {
              if (error) return onError(error);

              player.play(function(error) {
                if (error) return onError(error);

                recorder.record(function(error) {
                  if (error) return onError(error);
                  setTimeout(() => {
                    _this._stopRecording();
                    _this._startPlayback();
                  }, 15000);
                })
              })
            })
          })
        })
      });
    });
  }

  render() {
    return (
      <div style={{textAlign: 'center'}}>
        <div style={{width: '100%', backgroundColor: 'black', marginLeft: 'auto', marginRight: 'auto'}}>
          <video id={`videoOutput-${this.props.cameraId}`} width='100%' autoPlay loop />
        </div>
      </div>
    )
  }
}
