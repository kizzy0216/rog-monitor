import React, { Component } from 'react';
import { Button, Modal, Form, Input, Icon } from 'antd';

class CustomInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inEditMode: false,
      value: this.props.value1
    };
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.closeEditMode && this.props.closeEditMode !== nextProps.closeEditMode) {
      this.setState({inEditMode: false});
      this.onCancel();
    }

    if (nextProps.value1) {
      this.setState({value: nextProps.value1});
    }
  };

  toggleEditing = () => {
    this.setState({inEditMode: !this.state.inEditMode}, () => {
      if (!this.state.inEditMode) {
        this.onCancel();
      }
    });
  };
  
  handleChange = (event) => {
    this.setState({value: event.target.value});
  };

  onCancel = () => {
    this.setState({value: this.props.value1});
  };

  render() {
    return (
      <div style={styles.inputContainer}>
        <Input value={this.state.value} type={this.props.inputType} onChange={this.handleChange} disabled={!this.state.inEditMode} style={styles.input} className='formInput' />
        {!this.state.inEditMode && <Icon type='edit' onClick={this.toggleEditing} style={styles.edit} />}
        {this.state.inEditMode &&
          <span style={styles.cancelSaveBtn}>
            <Button
              onClick={this.toggleEditing}
              style={styles.cancelBtn}
              className='cancelBtn'
              disabled={this.props.buttonsDisabled}
            >
              Cancel
            </Button>
            <Button
              type='primary'
              id={this.props.id}
              value={this.state.value}
              onClick={this.props.handleSave}
              style={styles.saveBtn}
              className='saveBtn'
              disabled={this.props.buttonsDisabled}
            >
              Save
            </Button>
          </span>
        }
      </div>
    )
  }
}

const styles = {
  inputContainer: {
    margin: '0 auto'
  },
  input: {
    marginTop: 0,
    textAlign: 'center',
    float: 'left'
  },
  edit: {
    fontSize: 20,
    paddingLeft: 10,
    paddingTop: 5,
    float: 'left'
  },
  cancelSaveBtn: {
    float: 'left',
  },
  saveBtn: {
    color: '#108ee9',
  },
  cancelBtn: {
    color: 'red',
    marginLeft: 2
  }
};
export default CustomInput;
