import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class SystemConfigurationAdmin extends Component {
  constructor(props) {
    super(props);

    this.state={}
  }

  render(){
    return(
      <div>SystemConfigurationAdmin</div>
    )
  }
}

const styles={};

const mapStateToProps = (state) => {
  return {}
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(SystemConfigurationAdmin);
