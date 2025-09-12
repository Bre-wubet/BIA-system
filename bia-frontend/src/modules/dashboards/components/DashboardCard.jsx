import React from 'react';
import { Card, Dropdown, Menu, Tag, Tooltip } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined, 
  StarOutlined, 
  StarFilled,
  MoreOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';

const DashboardCard = ({ dashboard, onClick, onEdit, onDelete, onDuplicate, onSetDefault }) => {
  const { id, name, description, isDefault, createdAt, updatedAt, widgetCount, isPublic } = dashboard;
  
  const lastUpdated = updatedAt ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) : 'Never';
  
  const menu = (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={(e) => {
        e.stopPropagation();
        onEdit && onEdit(id);
      }}>
        Edit
      </Menu.Item>
      <Menu.Item key="duplicate" icon={<CopyOutlined />} onClick={(e) => {
        e.stopPropagation();
        onDuplicate && onDuplicate(id);
      }}>
        Duplicate
      </Menu.Item>
      <Menu.Item 
        key="default" 
        icon={isDefault ? <StarFilled /> : <StarOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onSetDefault && onSetDefault(id);
        }}
      >
        {isDefault ? 'Remove Default' : 'Set as Default'}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={(e) => {
        e.stopPropagation();
        onDelete && onDelete(id);
      }}>
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      className="dashboard-card"
      hoverable
      onClick={() => onClick && onClick(id)}
      cover={
        <div className="dashboard-card-cover">
          <LineChartOutlined style={{ fontSize: 48 }} />
        </div>
      }
      actions={[
        <Tooltip title="Edit Dashboard">
          <EditOutlined key="edit" onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(id);
          }} />
        </Tooltip>,
        <Tooltip title={isDefault ? "Default Dashboard" : "Set as Default"}>
          {isDefault ? 
            <StarFilled key="default" style={{ color: '#faad14' }} /> : 
            <StarOutlined key="default" onClick={(e) => {
              e.stopPropagation();
              onSetDefault && onSetDefault(id);
            }} />
          }
        </Tooltip>,
        <Dropdown overlay={menu} trigger={['click']} onClick={e => e.stopPropagation()}>
          <MoreOutlined key="more" />
        </Dropdown>
      ]}
    >
      <Card.Meta
        title={
          <div className="dashboard-card-title">
            {name}
            {isDefault && <Tag color="gold">Default</Tag>}
            {isPublic && <Tag color="green">Public</Tag>}
          </div>
        }
        description={
          <div>
            <p className="dashboard-card-description">{description || 'No description'}</p>
            <div className="dashboard-card-meta">
              <span>{widgetCount || 0} widgets</span>
              <span>Updated {lastUpdated}</span>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default DashboardCard;