import React, { useContext, useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tag, Input, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import * as camerasActions from '../../redux/cameras/actions';

class S3Keywords extends React.Component {
  constructor(props){
    console.log(props);
  }
  state = {
    keywords: this.props.s3_keywords,
    inputVisible: false,
    inputValue: '',
    editInputIndex: -1,
    editInputValue: '',
  };

  handleClose = removedKeyword => {
    const keywords = this.state.keywords.filter(keyword => keyword !== removedKeyword);
    console.log(keywords);
    this.setState({ keywords });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { keywords } = this.state;
    if (inputValue && keywords.indexOf(inputValue) === -1) {
      keywords = [...keywords, inputValue];
    }
    console.log(keywords);
    // TODO: call controller camera update function here with new s3_keywords to overwrite the existing ones.
    this.setState({
      keywords,
      inputVisible: false,
      inputValue: '',
    });
  };

  handleEditInputChange = e => {
    this.setState({ editInputValue: e.target.value });
  };

  handleEditInputConfirm = () => {
    this.setState(({ keywords, editInputIndex, editInputValue }) => {
      const newKeywords = [...keywords];
      newKeywords[editInputIndex] = editInputValue;

      return {
        keywords: newKeywords,
        editInputIndex: -1,
        editInputValue: '',
      };
    });
  };

  saveInputRef = input => {
    this.input = input;
  };

  saveEditInputRef = input => {
    this.editInput = input;
  };

  render() {
    const { keywords, inputVisible, inputValue, editInputIndex, editInputValue } = this.state;
    return (
      <div>
        {keywords.map((keyword, index) => {
          if (editInputIndex === index) {
            return (
              <Input
                ref={this.saveEditInputRef}
                key={keyword}
                size="small"
                className="tag-input"
                value={editInputValue}
                onChange={this.handleEditInputChange}
                onBlur={this.handleEditInputConfirm}
                onPressEnter={this.handleEditInputConfirm}
              />
            );
          }

          const isLongTag = keyword.length > 20;

          const keywordElem = (
            <Tag
              className="edit-tag"
              key={keyword}
              closable={index !== 0}
              onClose={() => this.handleClose(keyword)}
            >
              <span
                onDoubleClick={e => {
                  if (index !== 0) {
                    this.setState({ editInputIndex: index, editInputValue: keyword }, () => {
                      this.editInput.focus();
                    });
                    e.preventDefault();
                  }
                }}
              >
                {isLongTag ? `${keyword.slice(0, 20)}...` : keyword}
              </span>
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={keyword} key={keyword}>
              {keywordElem}
            </Tooltip>
          ) : (
            keywordElem
          );
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            className="tag-input"
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag className="site-tag-plus" onClick={this.showInput}>
            <PlusOutlined /> New Tag
          </Tag>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    cameras: state.cameras.camerasAdmin,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(camerasActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(S3Keywords);
