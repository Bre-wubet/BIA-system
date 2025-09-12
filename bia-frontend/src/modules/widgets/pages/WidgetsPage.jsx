import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getWidgetStats,
  getWidgetData,
  deleteWidget,
  duplicateWidget,
  getWidgetsByDashboardId,
  getAllWidgets
} from '../../../api/widgetsApi';
import { WIDGET_TYPES } from '../../../constants/chartConfig';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { MdDelete, MdEdit} from "react-icons/md";
import { renderWidgetContent } from '../../../utils/widgetRenderer';
import { ROLE_PERMISSIONS, ROLES } from '../../../constants/roles';

const WidgetsPage = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [stats, setStats] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [widgetData, setWidgetData] = useState({});
  const [userRole] = useState(ROLES.ADMIN); // Mock user role
  const navigate = useNavigate();

  useEffect(() => {
    fetchWidgets();
    if (widgets.length > 0) {
      fetchWidgetStats(widgets[0].id);
    }
  }, []);

  useEffect(() => {
    if (widgets.length > 0) {
      fetchWidgetData();
    }
  }, [widgets]);

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      // Fetch all widgets
      const res = await getAllWidgets();
      setWidgets(res.data || []);
      // If there's an endpoint to fetch all widgets, implement and import it.
      // Using by-dashboard as a placeholder with dashboardId = null to fetch all if supported.
      // const res = await getWidgetsByDashboardId();
      // setWidgets(res.data || []);
    } catch (error) {
      console.error('Error fetching widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWidgetStats = async (widgetId) => {
    try {
      const res = await getWidgetStats(widgetId);
      setStats(res.data || {});
    } catch (error) {
      console.error('Error fetching widget stats:', error);
    }
  };

  const fetchWidgetData = async () => {
    try {
      const data = {};
      for (const widget of widgets) {
        try {
          const result = await getWidgetData(widget.id);
          data[widget.id] = result || {};
        } catch (error) {
          console.error(`Error fetching data for widget ${widget.id}:`, error);
        }
      }
      setWidgetData(data);
    } catch (error) {
      console.error('Error fetching widget data:', error);
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      try {
        await deleteWidget(widgetId);
        fetchWidgets();
        fetchWidgetStats();
      } catch (error) {
        console.error('Error deleting widget:', error);
      }
    }
  };

  const handleDuplicateWidget = async (widgetId) => {
    try {
      await duplicateWidget(widgetId);
      fetchWidgets();
      fetchWidgetStats();
    } catch (error) {
      console.error('Error duplicating widget:', error);
    }
  };

  const filteredWidgets = selectedType === 'all' 
    ? widgets 
    : widgets.filter(widget => widget.type === selectedType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">Widgets</h1>
          <p className="text-gray-600">Manage and configure dashboard widgets</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            Widget From Template
          </Button>
          <Button onClick={() => navigate('/widgets/new')} variant="primary">
            New Widget
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{widgets.length || 0}</div>
            <div className="text-sm text-gray-500">Total Widgets</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{widgets.filter(w => w.is_active).length || 0}</div>
            <div className="text-sm text-gray-500">Active Widgets</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Object.keys(widgets.reduce((acc, w) => {
              acc[w.type] = (acc[w.type] || 0) + 1;
              return acc;
            }, {})).length || 0}</div>
            <div className="text-sm text-gray-500">Widget Types</div>
          </div>
        </Card>
      </div>

      {/* Type Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {Object.values(WIDGET_TYPES).map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWidgets.map(widget => (
          <Card key={widget.id} title={widget.title} subtitle={`Type: ${widget.type}`}>
            <div className="space-y-4">
              {/* Widget Content */}
              <div className="min-h-[200px]">
                {renderWidgetContent(widget, widgetData[widget.id])}
              </div>

              {/* Widget Info
              <div className="text-sm text-gray-500 space-y-2">
                <div>Dashboard: {widget.dashboard_id}</div>
                {widget.kpi_id && <div>KPI: {widget.kpi_id}</div>}
                {widget.data_source_id && <div>Data Source: {widget.data_source_id}</div>}
                <div>Position: {JSON.stringify(widget.position)}</div>
              </div> */}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleDuplicateWidget(widget.id)}
                    variant="outline"
                    size="sm"
                  >
                    Duplicate
                  </Button>
                   {ROLE_PERMISSIONS[userRole].canEdit && (
                    <Button
                      onClick={() => navigate(`/widgets/${widget.id}/edit`)}
                      variant="success"
                      size="sm"
                    >
                      <MdEdit className='w-4 h-4'/>
                    </Button>
                  )}
                  {ROLE_PERMISSIONS[userRole].canDelete && (
                    <Button
                      onClick={() => handleDeleteWidget(widget.id)}
                      variant="danger"
                      size="sm"
                    >
                      <MdDelete className='w-4 h-4' />
                    </Button>
                  )}
                <Button variant="primary" size="sm" onClick={() => navigate(`/widgets/${widget.id}`)}>
                  View
                </Button>
                </div>
                <div className="text-xs text-gray-400">
                  {widget.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredWidgets.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No widgets found for the selected type.</p>
          </div>
        </Card>
      )}

      {/* Create Widget Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Widget"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Type
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.values(WIDGET_TYPES).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter widget title"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setShowCreateModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button variant="primary">
              Create Widget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WidgetsPage;
