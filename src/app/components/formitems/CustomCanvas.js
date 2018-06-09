import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Icon} from 'antd';
require('fabric');

class CustomCanvas extends Component {
  polygonMode = true;
  pointArray = [];
  lineArray = [];
  activeLine;
  activeShape = false;
  canvasPointArray = [];
  i = 0;

  constructor(props) {
    super(props);
    this.state = {
      canvas: null,
      image: this.props.image,
      test: 0
    }
  }

  componentDidMount() {
    const nThis = this;

    const fabricCanvas = this.canvas();
    fabricCanvas.renderAll();

    if (this.props.getAlerts === true) {
      const alertedPolygonAtrributes = {
        stroke: '#000',
        strokeWidth: 2,
        strokeStyle: "#FF0000",
        selectable: true,
        evented: true
      };

      /* ---> Genereate Polygons from point array <--- */
      if (this.props.polygonData !== null && this.props.polygonData !== undefined) {
        this.props.polygonData.alerts.forEach((entry) => {
          let points = [];
          entry.points.forEach(function (value) {
            points.push({
              x: value[0] * nThis.props.width,
              y: value[1] * nThis.props.height
            });
            fabricCanvas.remove(value);
          });

          alertedPolygonAtrributes['fill'] = (entry.type === 'RA') ? "#FF0000" : ((entry.type === 'LD') ? '#0092f8' : '#00cd78');
          alertedPolygonAtrributes['id'] = (entry.id !== undefined) ? entry.id : '';
          alertedPolygonAtrributes['type'] = entry.type;
          alertedPolygonAtrributes['duration'] = entry.duration;
          if (entry.type === 'VW') {
            this.generateVirtualWall(fabricCanvas, points, entry.direction, entry.id);
          } else {
            let polygon = this.generatePolygon(fabricCanvas, points, this.lineArray, alertedPolygonAtrributes);
          }
        })
      }

      fabricCanvas.on('mouse:down', function (options) {
        if (fabricCanvas.getActiveObject() !== undefined && fabricCanvas.getActiveObject() !== null) {
          fabricCanvas.getObjects().forEach((entry) => {
            if (entry.type === 'RA') {
              entry.setColor('#FF0000');
            }
            if (entry.type === 'LD') {
              entry.setColor('#0092f8');
            }
            if (entry.type === 'VW') {
              entry.set({fill: '#FF0000', stroke: '#FF0000'});
            }
            if (entry.type === 'VW' && fabricCanvas.getActiveObject().id === entry.id) {
              entry.set({fill: '#36d850', stroke: '#36d850'});
            }
          });

          fabricCanvas.getActiveObject().setColor('#36d850');
          nThis.props.alertExtras(fabricCanvas.getActiveObject().id, fabricCanvas.getActiveObject().type, fabricCanvas.getActiveObject().duration);
        }
      });
      document.getElementById('prev_button').addEventListener('click', function (options) {
        if (fabricCanvas.getActiveObject() !== undefined && fabricCanvas.getActiveObject() !== null) {
          fabricCanvas.getObjects().forEach((entry) => {
            if (entry.type === 'RA') {
              entry.setColor('#FF0000');
            }
            if (entry.type === 'LD') {
              entry.setColor('#0092f8');
            }
            if (entry.type === 'VW') {
              entry.set({fill: '#FF0000', stroke: '#FF0000'});
            }
            if (entry.type === 'VW' && fabricCanvas.getActiveObject().id === entry.id) {
              entry.set({fill: '#36d850', stroke: '#36d850'});
            }
          });
          fabricCanvas.setActiveObject(nThis.prevItem(fabricCanvas.getObjects()), fabricCanvas.getActiveObject());
          fabricCanvas.getActiveObject().setColor('#36d850');
          nThis.props.alertExtras(fabricCanvas.getActiveObject().id, fabricCanvas.getActiveObject().type, fabricCanvas.getActiveObject().duration);
          fabricCanvas.renderAll();
        }
      });

      document.getElementById('next_button').addEventListener('click', function (options) {
        if (fabricCanvas.getActiveObject() !== undefined && fabricCanvas.getActiveObject() !== null) {
          fabricCanvas.getObjects().forEach((entry) => {
            if (entry.type === 'RA') {
              entry.setColor('#FF0000');
            }
            if (entry.type === 'LD') {
              entry.setColor('#0092f8');
            }
            if (entry.type === 'VW') {
              entry.set({fill: '#FF0000', stroke: '#FF0000'});
            }
            if (entry.type === 'VW' && fabricCanvas.getActiveObject().id === entry.id) {
              entry.set({fill: '#36d850', stroke: '#36d850'});
            }
          });
          fabricCanvas.setActiveObject(nThis.nextItem(fabricCanvas.getObjects()), fabricCanvas.getActiveObject());
          fabricCanvas.getActiveObject().setColor('#36d850');
          nThis.props.alertExtras(fabricCanvas.getActiveObject().id, fabricCanvas.getActiveObject().type, fabricCanvas.getActiveObject().duration);
          fabricCanvas.renderAll();
        }
      });
    }
    else {
      fabricCanvas.on('mouse:down', function (options) {
        if (nThis.props.alertType === 'RA' || nThis.props.alertType === 'LD') {
          if (nThis.pointArray.length > 0) {
            if (options.target && options.target.id === nThis.pointArray[0].id) {
              let points = [];
              nThis.pointArray.forEach(function (entry) {
                points.push({
                  x: entry.left,
                  y: entry.top
                });
                fabricCanvas.remove(entry);
              });


              const alertedPolygonAtrributes = {
                fill: (nThis.props.alertType === 'RA') ? "#FF0000" : ((nThis.props.alertType === 'LD') ? '#0092f8' : '#00cd78')
              };

              nThis.generatePolygon(fabricCanvas, points, nThis.lineArray, alertedPolygonAtrributes);

              let canvasPointArray = [];
              for (let i = 0; i < nThis.pointArray.length; i++) {
                canvasPointArray.push([nThis.pointArray[i].left / fabricCanvas.width, nThis.pointArray[i].top / fabricCanvas.height]);
              }
              nThis.props.alertPointDirection(canvasPointArray, undefined);
            }
          }
        }

        if (nThis.polygonMode) {
          nThis.addPoint(fabricCanvas, nThis.pointArray, nThis.lineArray, options);
        }


        if (nThis.props.alertType === 'VW') {
          if (nThis.pointArray.length === 2) {
            let points = [];

            nThis.pointArray.forEach(function (entry) {
              points.push({
                x: entry.left,
                y: entry.top
              });
            });

            nThis.generateVirtualWall(fabricCanvas, points, '');
            nThis.canvasPointArray.length = 0;
            for (let i = 0; i < nThis.pointArray.length; i++) {
              nThis.canvasPointArray.push([nThis.pointArray[i].left / fabricCanvas.width, nThis.pointArray[i].top / fabricCanvas.height]);
            }
            nThis.pointArray.length = 0;
            nThis.props.alertPointDirection(nThis.canvasPointArray, 'rightLeft');
          }
          if (fabricCanvas.getActiveObject() !== undefined && fabricCanvas.getActiveObject() !== null) {
            let virtualWallDetails = {
              id: fabricCanvas.getActiveObject().id,
              left: fabricCanvas.getActiveObject().left,
              top: fabricCanvas.getActiveObject().top,
              rotateAngle: fabricCanvas.getActiveObject().angle
            };

            let directionCircle;
            switch (fabricCanvas.getActiveObject().id) {
              case 'rightLeft':
                virtualWallDetails.id = 'right';
                fabricCanvas.remove(fabricCanvas.getActiveObject());
                directionCircle = CustomCanvas.directionCircleObject(virtualWallDetails.id, 15, virtualWallDetails.left, virtualWallDetails.top, 0, Math.PI, virtualWallDetails.rotateAngle);
                directionCircle.rotate(virtualWallDetails.rotateAngle);
                fabricCanvas.add(directionCircle);
                break;
              case 'right':
                virtualWallDetails.id = 'left';
                fabricCanvas.remove(fabricCanvas.getActiveObject());
                directionCircle = CustomCanvas.directionCircleObject(virtualWallDetails.id, 15, virtualWallDetails.left, virtualWallDetails.top, Math.PI, 0, virtualWallDetails.rotateAngle);
                directionCircle.rotate(virtualWallDetails.rotateAngle);
                fabricCanvas.add(directionCircle);
                break;
              case 'left':
                virtualWallDetails.id = 'rightLeft';
                fabricCanvas.remove(fabricCanvas.getActiveObject());
                directionCircle = CustomCanvas.directionCircleObject(virtualWallDetails.id, 15, virtualWallDetails.left, virtualWallDetails.top, 0, 2 * Math.PI, virtualWallDetails.rotateAngle);
                directionCircle.rotate(virtualWallDetails.rotateAngle);
                fabricCanvas.add(directionCircle);
                break;
            }
            nThis.props.alertPointDirection(nThis.canvasPointArray, virtualWallDetails.id);

          }
        }
      });

      fabricCanvas.on('touch:gesture', function (options) {
        if (nThis.props.alertType === 'RA' || nThis.props.alertType === 'LD') {
          if (nThis.pointArray.length > 0) {
            if (options.target && options.target.id === nThis.pointArray[0].id) {
              let points = [];
              nThis.pointArray.forEach(function (entry) {
                points.push({
                  x: entry.left,
                  y: entry.top
                });
                fabricCanvas.remove(entry);
              });


              const alertedPolygonAtrributes = {
                fill: (nThis.props.alertType === 'RA') ? "#FF0000" : ((nThis.props.alertType === 'LD') ? '#0092f8' : '#00cd78')
              };

              nThis.generatePolygon(fabricCanvas, points, nThis.lineArray, alertedPolygonAtrributes);

              let canvasPointArray = [];
              for (let i = 0; i < nThis.pointArray.length; i++) {
                canvasPointArray.push([nThis.pointArray[i].left / fabricCanvas.width, nThis.pointArray[i].top / fabricCanvas.height]);
              }
              nThis.props.alertPointDirection(canvasPointArray, undefined);
            }
          }
        }

        if (nThis.polygonMode) {
          nThis.addPoint(fabricCanvas, nThis.pointArray, nThis.lineArray, options);
        }


        if (nThis.props.alertType === 'VW') {
          if (nThis.pointArray.length === 2) {
            let points = [];

            nThis.pointArray.forEach(function (entry) {
              points.push({
                x: entry.left,
                y: entry.top
              });
            });

            nThis.generateVirtualWall(fabricCanvas, points, '');
            nThis.canvasPointArray.length = 0;
            for (let i = 0; i < nThis.pointArray.length; i++) {
              nThis.canvasPointArray.push([nThis.pointArray[i].left / fabricCanvas.width, nThis.pointArray[i].top / fabricCanvas.height]);
            }
            nThis.pointArray.length = 0;
            nThis.props.alertPointDirection(nThis.canvasPointArray, 'rightLeft');
          }
          if (fabricCanvas.getActiveObject() !== undefined && fabricCanvas.getActiveObject() !== null) {
            let virtualWallDetails = {
              id: fabricCanvas.getActiveObject().id,
              left: fabricCanvas.getActiveObject().left,
              top: fabricCanvas.getActiveObject().top,
              rotateAngle: fabricCanvas.getActiveObject().angle
            };

            let directionCircle;
            switch (fabricCanvas.getActiveObject().id) {
              case 'rightLeft':
                virtualWallDetails.id = 'right';
                fabricCanvas.remove(fabricCanvas.getActiveObject());
                directionCircle = CustomCanvas.directionCircleObject(virtualWallDetails.id, 15, virtualWallDetails.left, virtualWallDetails.top, 0, Math.PI, virtualWallDetails.rotateAngle);
                directionCircle.rotate(virtualWallDetails.rotateAngle);
                fabricCanvas.add(directionCircle);
                break;
              case 'right':
                virtualWallDetails.id = 'left';
                fabricCanvas.remove(fabricCanvas.getActiveObject());
                directionCircle = CustomCanvas.directionCircleObject(virtualWallDetails.id, 15, virtualWallDetails.left, virtualWallDetails.top, Math.PI, 0, virtualWallDetails.rotateAngle);
                directionCircle.rotate(virtualWallDetails.rotateAngle);
                fabricCanvas.add(directionCircle);
                break;
              case 'left':
                virtualWallDetails.id = 'rightLeft';
                fabricCanvas.remove(fabricCanvas.getActiveObject());
                directionCircle = CustomCanvas.directionCircleObject(virtualWallDetails.id, 15, virtualWallDetails.left, virtualWallDetails.top, 0, 2 * Math.PI, virtualWallDetails.rotateAngle);
                directionCircle.rotate(virtualWallDetails.rotateAngle);
                fabricCanvas.add(directionCircle);
                break;
            }
            nThis.props.alertPointDirection(nThis.canvasPointArray, virtualWallDetails.id);

          }
        }
      });


      fabricCanvas.on('mouse:up', function (options) {
      });

      fabricCanvas.on('mouse:move', function (options) {
        if (nThis.activeLine && nThis.activeLine.class === "line") {
          const pointer = fabricCanvas.getPointer(options.e);

          nThis.activeLine.set({x2: pointer.x, y2: pointer.y});

          const points = nThis.activeShape.get("points");
          points[nThis.pointArray.length] = {
            x: pointer.x,
            y: pointer.y
          };

          nThis.activeShape.set({
            points: points
          });

          fabricCanvas.renderAll();
        }
        fabricCanvas.renderAll();
      });

      fabricCanvas.on('touch:drag', function (options) {
        if (nThis.activeLine && nThis.activeLine.class === "line") {
          const pointer = fabricCanvas.getPointer(options.e);

          nThis.activeLine.set({x2: pointer.x, y2: pointer.y});

          const points = nThis.activeShape.get("points");
          points[nThis.pointArray.length] = {
            x: pointer.x,
            y: pointer.y
          };

          nThis.activeShape.set({
            points: points
          });

          fabricCanvas.renderAll();
        }
        fabricCanvas.renderAll();
      });

      this.drawPolygon();
    }

  }

  generatePolygon(canvas, points, lineArray, polygonAttributes) {

    lineArray.forEach(function (entry) {
      canvas.remove(entry);
    });

    canvas.remove(this.activeShape).remove(this.activeLine);

    let polygon = CustomCanvas.polygonObject(points);

    if (polygonAttributes !== undefined) {
      polygon.set(polygonAttributes);
    }

    canvas.add(polygon);
    this.activeLine = null;
    this.activeShape = null;
    this.polygonMode = false;

    return polygon;
  }

  drawPolygon() {
    this.polygonMode = true;
    this.pointArray = [];
    this.lineArray = [];
    this.activeLine;
  }

  addPoint(canvas, pointArray, lineArray, options) {
    let min = 99;
    let max = 999999;

    let random = Math.floor(Math.random() * (max - min + 1)) + min;
    let id = new Date().getTime() + random;

    let circle = CustomCanvas.circleObject(id, 5, (options.e.offsetX / canvas.getZoom()), (options.e.offsetY / canvas.getZoom()));

    if (pointArray.length === 0) {
      circle.set({
        fill: 'red'
      })
    }

    let points = [(options.e.offsetX / canvas.getZoom()), (options.e.offsetY / canvas.getZoom()), (options.e.offsetX / canvas.getZoom()), (options.e.offsetY / canvas.getZoom())];

    let line = CustomCanvas.lineObject(points, (this.props.alertType === 'VW') ? '#FF0000' : '#FFFFFF');

    if (this.activeShape) {
      let pos = canvas.getPointer(options.e);
      let points = this.activeShape.get("points");
      points.push({
        x: pos.x,
        y: pos.y
      });

      const polygon = CustomCanvas.polygonObject(points);
      polygon.set({
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.1
      });

      canvas.remove(this.activeShape);
      canvas.add(polygon);
      this.activeShape = polygon;
      canvas.renderAll();
    }
    else {
      let polyPoint = [{
        x: (options.e.offsetX / canvas.getZoom()),
        y: (options.e.offsetY / canvas.getZoom())
      }];

      const polygon = CustomCanvas.polygonObject(polyPoint);
      this.activeShape = polygon;
      canvas.add(polygon);
    }

    this.activeLine = line;
    pointArray.push(circle);
    lineArray.push(line);
    canvas.add(line);
    canvas.add(circle);
    canvas.selection = false;
  }

  generateVirtualWall(canvas, points, direction, identity) {
    let slope = (points[1].y - points[0].y) / (points[1].x - points[0].x);
    let angle = Math.atan(slope);
    let angleDeg = angle * 180 / Math.PI;
    let midPointY = (points[1].y + points[0].y) / 2;
    let midPointX = (points[1].x + points[0].x) / 2;
    const radius = 15;
    let id = 'rightLeft';
    let startAngle = 0;
    let endAngle = 2 * Math.PI;

    if (this.props.getAlerts === true) {
      const line = CustomCanvas.lineObject([points[0].x, points[0].y, points[1].x, points[1].y], '#FF0000');
      line.set({id: identity});
      line['type'] = 'VW';

      canvas.add(line);

      id = identity;

      switch (direction) {
        case 'R':
          endAngle = Math.PI;
          startAngle = 0;
          break;
        case 'L':
          startAngle = Math.PI;
          endAngle = 0;
          break;
      }
    }

    const directionCircle = CustomCanvas.directionCircleObject(id, radius, midPointX, midPointY, startAngle, endAngle, angleDeg);
    directionCircle.rotate(angleDeg);

    canvas.add(directionCircle);

    this.activeLine = null;
    this.activeShape = null;
    this.polygonMode = false;
    canvas.selection = true;
  }

  nextItem(arr) {
      this.i = this.i + 1; // increase i by one
      this.i = this.i % arr.length; // if we've gone too high, start from `0` again
      return arr[this.i]; // give us back the item of where we are now
  }
  prevItem(arr) {
      if (this.i === 0) { // i would become 0
          this.i = arr.length; // so put it at the other end of the array
      }
      this.i = this.i - 1; // decrease by one
      return arr[this.i]; // give us back the item of where we are now
  }

  static lineObject(points, color) {
    return new fabric.Line(points, {
      strokeWidth: 2,
      fill: color,
      stroke: color,
      class: 'line',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false
    });
  }

  static polygonObject(points) {
    return new fabric.Polygon(points, {
      fill: '#FF0000',
      strokeWidth: 0.5,
      opacity: 0.4,
      stroke: '#333333',
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
      lockMovementX: true,
      lockMovementY: true
    });
  }

  static circleObject(id, radius, left, top) {
    return new fabric.Circle({
      radius: radius,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 0.5,
      left: left,
      top: top,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      id: id
    });
  }

  static directionCircleObject(id, radius, left, top, startAngle, endAngle, rotateAngle) {
    return new fabric.Circle({
      radius: radius,
      fill: '#FF0000',
      stroke: '#333333',
      strokeWidth: 0.5,
      left: left,
      top: top,
      startAngle: startAngle,
      endAngle: endAngle,
      selectable: true,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      id: id,
      type: 'VW',
      lockMovementX: true,
      lockMovementY: true,
      opacity: 0.7,
      angle: rotateAngle
    });
  }

  canvas() {
    let canvas = new fabric.Canvas('canvas');
    canvas.backgroundColor = 'transparent';
    canvas.setHeight(this.props.height);
    canvas.setWidth(this.props.width);
    canvas.selection = false;
    return canvas;
  }

  render() {
    return (
      <div>
        <div id="canvas-contain">
          <canvas id='canvas' style={styles.canvas}/>
        </div>
        <div style={styles.prevNext}>
          <Icon id="prev_button" type="step-backward" />
          <Icon id="next_button" type="step-forward" />
        </div>
      </div>
    )
  }
}

const styles = {
  canvas: {
    position: 'relative'
  },
  prevNext: {
    textAlign: 'center',
    fontSize: 24
  },
  prevButton: {

  },
  nextButton: {

  }
};

const mapStateToProps = (state) => {
  return {
    polygonData: state.alerts.polygonData
  }
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomCanvas));
