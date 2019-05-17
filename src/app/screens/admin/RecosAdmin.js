import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class RecosAdmin extends Component {
  constructor(props) {
    super(props);

    this.state={}
  }

  render(){
    return(
      <div>RecosAdmin</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(RecosAdmin);
