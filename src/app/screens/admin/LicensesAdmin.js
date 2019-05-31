import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as usersActions from '../../redux/users/actions';

class LicensesAdmin extends Component {
  constructor(props) {
    super(props);

    this.state={}
  }

  render(){
    return(
      <div>LicensesAdmin</div>
    )
  }
}

const styles={};

const mapStateToProps = (state) => {
  return {
    userData: state.users.userData,
    updateUserError: state.users.updateUserError,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(usersActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(LicensesAdmin);
