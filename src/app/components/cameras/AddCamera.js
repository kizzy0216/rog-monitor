import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'antd';

class AddCamera extends Component {
  render() {
    return (
      <div>
        <span>Add camera to location {this.props.locationId}</span>
        
        <Button onClick={() => this.props.history.goBack()}>Cancel</Button>
        <Button>Add</Button>
      </div>
    )
  }
}

export default withRouter(AddCamera);