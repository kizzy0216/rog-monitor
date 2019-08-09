import React from 'react';
import { Menu, Icon } from 'antd';

import LogoutItem from './LogoutItem';

import UserSettings from '../../components/modals/UserSettings';
import AddCameraGroupModal from  '../../components/modals/AddCameraGroupModal';
import CameraGroupInvitesModal from '../../components/modals/CameraGroupInvitesModal';
import CameraLicensesModal from '../../components/modals/CameraLicensesModal';
import UserDevicesModal from '../../components/modals/UserDevicesModal';

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
      <UserDevicesModal />
    </Menu.Item>
    <Menu.Item key='5'>
      <CameraGroupInvitesModal />
    </Menu.Item>
    <Menu.Item key='6'>
      <LogoutItem/>
    </Menu.Item>
  </Menu>
);

export default SideMenu;
