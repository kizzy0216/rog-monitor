import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class UsersAdmin extends Component {
  // TODO: combine with user privileges
  constructor(props) {
    super(props);

    this.state={}
  }

  render(){
    return(
      <div>UsersAdmin</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(UsersAdmin);
