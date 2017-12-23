import React, { Component } from 'react';

export default class Video extends Component {
  render() {
    return (
      <video src={this.props.source} width='100%' autoPlay onClick={(e) => console.log(e.target.webkitRequestFullscreen())} />
    )
  }
}
