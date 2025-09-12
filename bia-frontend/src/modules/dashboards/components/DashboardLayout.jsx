import React, { useState, useEffect } from 'react';
import { Button, Spin, Alert, Tooltip } from 'antd';
import { SaveOutlined, UndoOutlined, RedoOutlined, LayoutOutlined } from '@ant-design/icons';
import { updateDashboardLayout } from '../../../api/dashboardsApi';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardLayout = ({ dashboardId, initialLayout, widgets, onLayoutChange, readOnly = false }) => {
  const [layout, setLayout] = useState(initialLayout || []);
  const [previousLayouts, setPreviousLayouts] = useState([]);
  const [futureLayouts, setFutureLayouts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialLayout) {
      setLayout(initialLayout);
    }
  }, [initialLayout]);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    onLayoutChange && onLayoutChange(newLayout);
  };

  const saveLayout = async () => {
    if (!dashboardId) return;
    
    try {
      setSaving(true);
      setError(null);
      await updateDashboardLayout(dashboardId, layout);
      setPreviousLayouts([...previousLayouts, layout]);
      setFutureLayouts([]);
    } catch (err) {
      setError('Failed to save layout. Please try again.');
      console.error('Error saving layout:', err);
    } finally {
      setSaving(false);
    }
  };

  const undoLayout = () => {
    if (previousLayouts.length === 0) return;
    
    const prevLayout = previousLayouts[previousLayouts.length - 1];
    const newPreviousLayouts = previousLayouts.slice(0, -1);
    
    setFutureLayouts([layout, ...futureLayouts]);
    setPreviousLayouts(newPreviousLayouts);
    setLayout(prevLayout);
    onLayoutChange && onLayoutChange(prevLayout);
  };

  const redoLayout = () => {
    if (futureLayouts.length === 0) return;
    
    const nextLayout = futureLayouts[0];
    const newFutureLayouts = futureLayouts.slice(1);
    
    setPreviousLayouts([...previousLayouts, layout]);
    setFutureLayouts(newFutureLayouts);
    setLayout(nextLayout);
    onLayoutChange && onLayoutChange(nextLayout);
  };

  return (
    <div className="dashboard-layout">
      {!readOnly && (
        <div className="dashboard-layout-controls">
          <Tooltip title="Save Layout">
            <Button 
              icon={<SaveOutlined />} 
              onClick={saveLayout} 
              loading={saving}
              disabled={!dashboardId}
            >
              Save Layout
            </Button>
          </Tooltip>
          <Tooltip title="Undo">
            <Button 
              icon={<UndoOutlined />} 
              onClick={undoLayout}
              disabled={previousLayouts.length === 0}
            />
          </Tooltip>
          <Tooltip title="Redo">
            <Button 
              icon={<RedoOutlined />} 
              onClick={redoLayout}
              disabled={futureLayouts.length === 0}
            />
          </Tooltip>
          <Tooltip title="Reset to Default">
            <Button icon={<LayoutOutlined />}>Reset</Button>
          </Tooltip>
        </div>
      )}

      {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}

      {saving ? (
        <div className="dashboard-layout-loading">
          <Spin size="large" />
          <p>Saving layout...</p>
        </div>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          isDraggable={!readOnly}
          isResizable={!readOnly}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map(widget => (
            <div key={widget.id} data-grid={widget.layout || { x: 0, y: 0, w: 3, h: 2 }}>
              {widget.component}
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
};

export default DashboardLayout;