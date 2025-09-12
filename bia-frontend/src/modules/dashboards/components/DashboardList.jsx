import React, { useState, useEffect } from 'react';
import { getAllDashboards, searchDashboards } from '../../../api/dashboardsApi';
import DashboardCard from './DashboardCard';
import { Input, Button, Spin, Empty, Alert } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const DashboardList = ({ onCreateNew, onSelect }) => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const data = await getAllDashboards();
      setDashboards(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboards. Please try again later.');
      console.error('Error fetching dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchDashboards();
      return;
    }

    try {
      setLoading(true);
      const results = await searchDashboards(searchQuery);
      setDashboards(results);
      setError(null);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Error searching dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="dashboard-list">
      <div className="dashboard-list-header">
        <h2>Dashboards</h2>
        <div className="dashboard-list-actions">
          <Input
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            prefix={<SearchOutlined />}
            style={{ width: 250, marginRight: 16 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onCreateNew}
          >
            Create New
          </Button>
        </div>
      </div>

      {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}

      {loading ? (
        <div className="dashboard-list-loading">
          <Spin size="large" />
        </div>
      ) : dashboards.length > 0 ? (
        <div className="dashboard-grid">
          {dashboards.map(dashboard => (
            <DashboardCard 
              key={dashboard.id} 
              dashboard={dashboard} 
              onClick={() => onSelect(dashboard.id)}
            />
          ))}
        </div>
      ) : (
        <Empty 
          description="No dashboards found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      )}
    </div>
  );
};

export default DashboardList;