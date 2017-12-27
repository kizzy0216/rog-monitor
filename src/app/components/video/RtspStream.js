import React, {Component} from 'react';

import KurentoClient from '../../../lib/kurento/kurento-client';
import kurentoUtils from '../../../lib/kurento/kurento-utils';

import loading from '../../../assets/img/loading.gif';

require('fabric');

export default class RtspStream extends Component {
  constructor(props) {
    super(props);

    this.state = {
      webRtcPeer: null,
      pipeline: null,
      canvas: null,
    }
    this.canvasContainer = null;
  }



  componentDidMount() {
    this._setIceServers();
    this._startVideo();
    let min = 99;
    let max = 999999;
    let polygonMode = true;
    let pointArray = [];
    let lineArray = [];
    let activeLine;
    let activeShape = false;
    let c = new fabric.Canvas('canvas');
    c.backgroundColor = 'transparent';
    c.setHeight(window.screen.availHeight);
    c.setWidth(window.screen.availWidth);
    c.renderAll();



    const polygon = {
      drawPolygon: function () {
        polygonMode = true;
          pointArray = [];
          lineArray = [];
        activeLine;
      },
      addPoint: function (options) {
        let random = Math.floor(Math.random() * (max - min + 1)) + min;
        let id = new Date().getTime() + random;
        let circle = new fabric.Circle({
          radius: 5,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 0.5,
          left: (options.e.layerX / c.getZoom()),
          top: (options.e.layerY / c.getZoom()),
          selectable: false,
          hasBorders: false,
          hasControls: false,
          originX: 'center',
          originY: 'center',
          id: id
        });
        if (pointArray.length === 0) {
          circle.set({
            fill: 'red'
          })
        }
        let points = [(options.e.layerX / c.getZoom()), (options.e.layerY / c.getZoom()), (options.e.layerX / c.getZoom()), (options.e.layerY / c.getZoom())];
        let line = new fabric.Line(points, {
          strokeWidth: 2,
          fill: '#999999',
          stroke: '#999999',
          class: 'line',
          originX: 'center',
          originY: 'center',
          selectable: false,
          hasBorders: false,
          hasControls: false,
          evented: false
        });
        if (activeShape) {
          let pos = c.getPointer(options.e);
          let points = activeShape.get("points");
          points.push({
            x: pos.x,
            y: pos.y
          });
          let polygon = new fabric.Polygon(points, {
            stroke: '#333333',
            strokeWidth: 1,
            fill: '#cccccc',
            opacity: 0.1,
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false
          });
          c.remove(activeShape);
          c.add(polygon);
          activeShape = polygon;
          c.renderAll();
        }
        else {
          let polyPoint = [{x: (options.e.layerX / c.getZoom()), y: (options.e.layerY / c.getZoom())}];
          let polygon = new fabric.Polygon(polyPoint, {
            stroke: '#333333',
            strokeWidth: 1,
            fill: '#cccccc',
            opacity: 0.1,
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false
          });
          activeShape = polygon;
          c.add(polygon);
        }
        activeLine = line;
        pointArray.push(circle);
        lineArray.push(line);
        c.add(line);
        c.add(circle);
        c.selection = false;
      },
      generatePolygon: function (pointArray) {
        let points = new Array();
        pointArray.forEach(function (entry) {
          points.push({
            x: entry.left,
            y: entry.top
          });
          c.remove(entry);
        });
        lineArray.forEach(function (entry) {
          c.remove(entry);
        });
        c.remove(activeShape).remove(activeLine);
        let polygon = new fabric.Polygon(points, {
          stroke: '#333333',
          strokeWidth: 0.5,
          opacity: 0.6,
          fill: randomColorGenerator(),
          hasBorders: false,
          hasControls: false
        });
        c.add(polygon);
        activeLine = null;
        activeShape = null;
        polygonMode = false;
        c.selection = true;
      },


    };

    function randomColorGenerator() {
      let num = Math.floor(Math.random() * 100) + 1;
      if (num < 30) {
        return '#d83838';
      }
      if (num > 30 && num < 70) {
        return '#3649d8';
      }
      else {
        return '#36d850'
      }
    }



    c.on('mouse:down', function (options) {
      if (options.target && options.target.id === pointArray[0].id) {
        polygon.generatePolygon(pointArray);
        polygon.drawPolygon();
        console.log(pointArray);
      }
      if (polygonMode) {
        polygon.addPoint(options);
      }
    });
    c.on('mouse:up', function (options) {
    });
    c.on('mouse:move', function (options) {
      if (activeLine && activeLine.class === "line") {
        const pointer = c.getPointer(options.e);
        activeLine.set({x2: pointer.x, y2: pointer.y});
        const points = activeShape.get("points");
        points[pointArray.length] = {
          x: pointer.x,
          y: pointer.y
        }
        activeShape.set({
          points: points
        });
        c.renderAll();
      }
      c.renderAll();
    });

    polygon.drawPolygon();
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
      webRtcPeer.on('icecandidate', function (candidate) {
        candidate = kurentoClient.register.complexTypes.IceCandidate(candidate);
        webRtcEndpoint.addIceCandidate(candidate, onError);
      });

      webRtcEndpoint.on('OnIceCandidate', function (event) {
        var candidate = event.candidate;
        webRtcPeer.addIceCandidate(candidate, onError);
      });
    }

    kurentoClient(process.env.REACT_APP_KURENTO_WS_URL, function (error, kurentoClient) {
      if (error) return onError(error);

      kurentoClient.create('MediaPipeline', function (error, pipeline) {
        if (error) return onError(error);

        _this.setState({pipeline});
        pipeline.create('PlayerEndpoint', {uri: rtspUrl}, function (error, player) {
          if (error) return onError(error);

          pipeline.create('WebRtcEndpoint', function (error, webRtcEndpoint) {
            if (error) return onError(error);

            setIceCandidateCallbacks(webRtcEndpoint, webRtcPeer, onError);

            webRtcEndpoint.processOffer(sdpOffer, function (error, sdpAnswer) {
              if (error) return onError(error);

              webRtcEndpoint.gatherCandidates(onError);
              webRtcPeer.processAnswer(sdpAnswer);
            });

            player.connect(webRtcEndpoint, function (error) {
              if (error) return onError(error);

              player.play(function (error) {
                if (error) return onError(error);
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
      function (error) {
        if (error) {
          return console.error(error);
        }

        webRtcPeer.generateOffer(onOffer);
        webRtcPeer.peerConnection.addEventListener('iceconnectionstatechange', function (event) {
          if (webRtcPeer && webRtcPeer.peerConnection) {
            console.log('oniceconnectionstatechange -> ' + webRtcPeer.peerConnection.iceConnectionState);
            console.log('icegatheringstate -> ' + webRtcPeer.peerConnection.iceGatheringState);
          }
        });
      });

    this.setState({webRtcPeer});
  }


  render() {
    return (
      <div>
        <video id='videoOutput' width='100%' style={styles.canvas} autoPlay onClick={(e) => console.log(e.target.webkitRequestFullscreen())}> </video>
        <canvas style={styles.canvasline} id='canvas'>
        </canvas>
      </div>
    )
  }
}
const styles = {
  canvas: {
    position: 'absolute'
  }
};
