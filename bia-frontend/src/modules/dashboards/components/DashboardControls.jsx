import React, { useState } from 'react';
import { Button, Dropdown, Menu, Modal, Input, Tooltip, Space } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined, 
  DownloadOutlined,
  ShareAltOutlined,
  StarOutlined,
  StarFilled,
  SettingOutlined,
  ExportOutlined,
  ReloadOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { 
  duplicateDashboard, 
  deleteDashboard, 
  setDefaultDashboard 
} from '../../../api/dashboardsApi';

const DashboardControls = ({ 
  dashboard, 
  onEdit, 
  onRefresh, 
  onExport, 
  onShare,
  onSettingsChange 
}) => {
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    if (!duplicateName.trim()) return;
    
    try {
      setLoading(true);
      await duplicateDashboard(dashboard.id, duplicateName);
      setDuplicateModalVisible(false);
      setDuplicateName('');
      onRefresh && onRefresh();
    } catch (error) {
      console.error('Error duplicating dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteDashboard(dashboard.id);
      setDeleteModalVisible(false);
      onRefresh && onRefresh();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      setLoading(true);
      await setDefaultDashboard(dashboard.id);
      onRefresh && onRefresh();
    } catch (error) {
      console.error('Error setting default dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const moreMenu = (
    <Menu>
      <Menu.Item key="share" icon={<ShareAltOutlined />} onClick={() => onShare && onShare(dashboard)}>
        Share Dashboard
      </Menu.Item>
      <Menu.Item key="export" icon={<ExportOutlined />} onClick={() => onExport && onExport(dashboard)}>
        Export Dashboard
      </Menu.Item>
      <Menu.Item 
        key="default" 
        icon={dashboard.isDefault ? <StarFilled /> : <StarOutlined />}
        onClick={handleSetDefault}
      >
        {dashboard.isDefault ? 'Remove Default' : 'Set as Default'}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => setDeleteModalVisible(true)}>
        Delete Dashboard
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="dashboard-controls">
      <Space>
        <Tooltip title="Refresh Dashboard">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => onRefresh && onRefresh()}
          />
        </Tooltip>
        
        <Tooltip title="Edit Dashboard">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => onEdit && onEdit(dashboard)}
          />
        </Tooltip>
        
        <Tooltip title="Duplicate Dashboard">
          <Button 
            icon={<CopyOutlined />} 
            onClick={() => setDuplicateModalVisible(true)}
          />
        </Tooltip>
        
        <Tooltip title="Dashboard Settings">
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => onSettingsChange && onSettingsChange(dashboard)}
          />
        </Tooltip>
        
        <Dropdown overlay={moreMenu} trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      </Space>

      {/* Duplicate Dashboard Modal */}
      <Modal
        title="Duplicate Dashboard"
        visible={duplicateModalVisible}
        onOk={handleDuplicate}
        onCancel={() => setDuplicateModalVisible(false)}
        confirmLoading={loading}
      >
        <p>Enter a name for the duplicated dashboard:</p>
        <Input
          placeholder="Dashboard name"
          value={duplicateName}
          onChange={(e) => setDuplicateName(e.target.value)}
          defaultValue={`Copy of ${dashboard?.name || ''}`}
        />
      </Modal>

      {/* Delete Dashboard Modal */}
      <Modal
        title="Delete Dashboard"
        visible={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={loading}
        okButtonProps={{ danger: true }}
        okText="Delete"
      >
        <p>Are you sure you want to delete this dashboard? This action cannot be undone.</p>
        <p><strong>Dashboard: </strong>{dashboard?.name}</p>
      </Modal>
    </div>
  );
};

export default DashboardControls;