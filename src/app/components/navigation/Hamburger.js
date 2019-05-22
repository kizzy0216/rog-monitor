import React from 'react';
import { connect } from 'react-redux';
import { Badge, Icon } from 'antd';

const Hamburger = (props) => (
  <ul className='ant-menu ant-menu-horizontal ant-menu-dark ant-menu-root' style={props.style}>
    <li className='ant-menu-item-active ant-menu-item'>
      <Badge count={props.cameraGroupInvites.length} dot={true}>
        <Icon
          className='nav-icon'
          type={props.collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={props.toggleCollapsed} />
      </Badge>
    </li>
  </ul>
)

const mapStateToProps = (state) => {
  return {
    cameraGroupInvites: state.invites.cameraGroupInvites
  }
}

export default connect(mapStateToProps, null)(Hamburger);