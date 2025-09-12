import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Switch, Select, Spin, Alert } from 'antd';
import { createDashboard, updateDashboard, getDashboardById } from '../../../api/dashboardsApi';

const { TextArea } = Input;
const { Option } = Select;

const DashboardForm = ({ dashboardId, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = !!dashboardId;

  useEffect(() => {
    if (dashboardId) {
      loadDashboardData();
    }
  }, [dashboardId]);

  const loadDashboardData = async () => {
    try {
      setInitialLoading(true);
      const dashboard = await getDashboardById(dashboardId);
      form.setFieldsValue({
        name: dashboard.name,
        description: dashboard.description,
        isPublic: dashboard.isPublic,
        layout: dashboard.layout || 'grid',
        refreshInterval: dashboard.refreshInterval || 0
      });
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error loading dashboard:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isEditing) {
        await updateDashboard(dashboardId, values);
      } else {
        await createDashboard(values);
      }
      
      onSuccess && onSuccess();
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} dashboard. Please try again.`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} dashboard:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="dashboard-form-loading">
        <Spin size="large" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-form">
      <h2>{isEditing ? 'Edit Dashboard' : 'Create New Dashboard'}</h2>
      
      {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isPublic: false,
          layout: 'grid',
          refreshInterval: 0
        }}
      >
        <Form.Item
          name="name"
          label="Dashboard Name"
          rules={[{ required: true, message: 'Please enter a dashboard name' }]}
        >
          <Input placeholder="Enter dashboard name" maxLength={100} />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea 
            placeholder="Enter dashboard description" 
            rows={4}
            maxLength={500}
          />
        </Form.Item>
        
        <Form.Item
          name="layout"
          label="Layout Type"
        >
          <Select>
            <Option value="grid">Grid</Option>
            <Option value="free">Free-form</Option>
            <Option value="fixed">Fixed</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="refreshInterval"
          label="Auto-refresh Interval (seconds)"
        >
          <Select>
            <Option value={0}>No auto-refresh</Option>
            <Option value={30}>30 seconds</Option>
            <Option value={60}>1 minute</Option>
            <Option value={300}>5 minutes</Option>
            <Option value={600}>10 minutes</Option>
            <Option value={1800}>30 minutes</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="isPublic"
          label="Public Dashboard"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item>
          <div className="form-actions">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? 'Update Dashboard' : 'Create Dashboard'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DashboardForm;