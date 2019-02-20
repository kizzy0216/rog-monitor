import React from 'react';
import { Menu, Icon } from 'antd';

import LogoutItem from './LogoutItem';

import UserSettings from '../../components/modals/UserSettings';
import AddCameraGroupModal from  '../../components/modals/AddCameraGroupModal';
import GuardInvitesModal from '../../components/modals/GuardInvitesModal';
import CameraLicensesModal from '../../components/modals/CameraLicensesModal';

const SideMenu = () => (
  <Menu>
    <Menu.Item key='1'>
      <UserSettings />
    </Menu.Item>
    <Menu.Item key='2'>
      <AddCameraGroupModal linkText='Add CameraGroup' />
    </Menu.Item>
    <Menu.Item key='3'>
      <CameraLicensesModal />
    </Menu.Item>
    <Menu.Item key='4'>
      <GuardInvitesModal />
    </Menu.Item>
    <Menu.Item key='5'>
      <LogoutItem/>
    </Menu.Item>
  </Menu>
);

export default SideMenu;
