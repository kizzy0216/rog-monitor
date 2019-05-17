import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class CameraGroupsAdmin extends Component {
  // TODO: this will contain logic and UI for both camera groups and user camera group privileges
  constructor(props) {
    super(props);

    this.state={}
  }

  render(){
    return(
      <div>CameraGroupsAdmin</div>
    )
  }
}

const styles={};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user
  }
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraGroupsAdmin);
