import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdDragIndicator,
  MdTextFields,
  MdBarChart,
  MdPieChart,
  MdTableChart,
  MdImage
} from 'react-icons/md';

const ReportBuilder = ({ reportData, onReportDataChange }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const elementTypes = [
    { type: 'text', label: 'Text', icon: MdTextFields, color: 'bg-gray-500' },
    { type: 'chart', label: 'Chart', icon: MdBarChart, color: 'bg-blue-500' },
    { type: 'table', label: 'Table', icon: MdTableChart, color: 'bg-green-500' },
    { type: 'image', label: 'Image', icon: MdImage, color: 'bg-purple-500' }
  ];

  const chartTypes = [
    { type: 'bar', label: 'Bar Chart', icon: MdBarChart },
    { type: 'line', label: 'Line Chart', icon: MdBarChart },
    { type: 'pie', label: 'Pie Chart', icon: MdPieChart },
    { type: 'table', label: 'Data Table', icon: MdTableChart }
  ];

  const addElement = (type) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
      config: getDefaultConfig(type)
    };

    const updatedLayout = {
      ...reportData.layout,
      elements: [...(reportData.layout.elements || []), newElement]
    };

    onReportDataChange({
      ...reportData,
      layout: updatedLayout
    });
  };

  const getDefaultConfig = (type) => {
    switch (type) {
      case 'text':
        return { content: 'New Text Element', fontSize: 14, color: '#000000' };
      case 'chart':
        return { 
          chartType: 'bar', 
          dataSource: reportData.dataSource,
          title: 'New Chart',
          xAxis: 'category',
          yAxis: 'value'
        };
      case 'table':
        return { 
          dataSource: reportData.dataSource,
          columns: [],
          title: 'New Table'
        };
      case 'image':
        return { src: '', alt: 'Image', width: 200, height: 150 };
      default:
        return {};
    }
  };

  const updateElement = (elementId, updates) => {
    const updatedElements = (reportData.layout.elements || []).map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );

    onReportDataChange({
      ...reportData,
      layout: {
        ...reportData.layout,
        elements: updatedElements
      }
    });
  };

  const deleteElement = (elementId) => {
    const updatedElements = (reportData.layout.elements || []).filter(
      element => element.id !== elementId
    );

    onReportDataChange({
      ...reportData,
      layout: {
        ...reportData.layout,
        elements: updatedElements
      }
    });

    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const handleDragStart = (e, elementId) => {
    e.dataTransfer.setData('text/plain', elementId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const elementId = e.dataTransfer.getData('text/plain');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateElement(elementId, {
      position: { x, y }
    });
  };

  const renderElement = (element) => {
    const ElementIcon = elementTypes.find(et => et.type === element.type)?.icon || MdTextFields;
    
    return (
      <div
        key={element.id}
        className={`absolute border-2 rounded-lg p-2 cursor-move ${
          selectedElement === element.id 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white'
        }`}
        style={{
          left: element.position.x,
          top: element.position.y,
          width: element.size.width,
          height: element.size.height
        }}
        draggable
        onDragStart={(e) => handleDragStart(e, element.id)}
        onClick={() => setSelectedElement(element.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <ElementIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{element.type}</span>
          </div>
          <div className="flex space-x-1">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element.id);
              }}
              variant="outline"
              size="sm"
            >
              <MdEdit className="w-3 h-3" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(element.id);
              }}
              variant="outline"
              size="sm"
            >
              <MdDelete className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {renderElementContent(element)}
        </div>
      </div>
    );
  };

  const renderElementContent = (element) => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            style={{ 
              fontSize: element.config.fontSize,
              color: element.config.color 
            }}
          >
            {element.config.content}
          </div>
        );
      case 'chart':
        return (
          <div className="flex items-center justify-center h-full bg-gray-100 rounded">
            <div className="text-center">
              <div className="text-sm font-medium">{element.config.title}</div>
              <div className="text-xs text-gray-500">{element.config.chartType}</div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="h-full bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium">{element.config.title}</div>
              <div className="text-xs text-gray-500">Data Table</div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="h-full bg-gray-100 rounded flex items-center justify-center">
            {element.config.src ? (
              <img 
                src={element.config.src} 
                alt={element.config.alt}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <MdImage className="w-8 h-8 mx-auto text-gray-400" />
                <div className="text-xs text-gray-500 mt-1">No Image</div>
              </div>
            )}
          </div>
        );
      default:
        return <div>Unknown element type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Report Layout</h3>
        <div className="flex space-x-2">
          {elementTypes.map(elementType => {
            const Icon = elementType.icon;
            return (
              <Button
                key={elementType.type}
                onClick={() => addElement(elementType.type)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Icon className="w-4 h-4" />
                <span>{elementType.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <div
          className={`relative w-full h-96 border-2 border-dashed rounded-lg ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {(reportData.layout.elements || []).map(renderElement)}
          
          {(reportData.layout.elements || []).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MdDragIndicator className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Drag elements here to build your report</p>
                <p className="text-sm">or use the toolbar above to add elements</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Element Properties Panel */}
      {selectedElement && (
        <Card>
          <h4 className="font-medium mb-4">Element Properties</h4>
          {(() => {
            const element = (reportData.layout.elements || []).find(
              el => el.id === selectedElement
            );
            if (!element) return null;

            return (
              <div className="space-y-4">
                {/* Position and Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X Position
                    </label>
                    <input
                      type="number"
                      value={element.position.x}
                      onChange={(e) => updateElement(element.id, {
                        position: { ...element.position, x: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y Position
                    </label>
                    <input
                      type="number"
                      value={element.position.y}
                      onChange={(e) => updateElement(element.id, {
                        position: { ...element.position, y: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      value={element.size.width}
                      onChange={(e) => updateElement(element.id, {
                        size: { ...element.size, width: parseInt(e.target.value) || 200 }
                      })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      value={element.size.height}
                      onChange={(e) => updateElement(element.id, {
                        size: { ...element.size, height: parseInt(e.target.value) || 150 }
                      })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>

                {/* Element-specific properties */}
                {element.type === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        value={element.config.content}
                        onChange={(e) => updateElement(element.id, {
                          config: { ...element.config, content: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Font Size
                        </label>
                        <input
                          type="number"
                          value={element.config.fontSize}
                          onChange={(e) => updateElement(element.id, {
                            config: { ...element.config, fontSize: parseInt(e.target.value) || 14 }
                          })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="color"
                          value={element.config.color}
                          onChange={(e) => updateElement(element.id, {
                            config: { ...element.config, color: e.target.value }
                          })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {element.type === 'chart' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chart Type
                      </label>
                      <select
                        value={element.config.chartType}
                        onChange={(e) => updateElement(element.id, {
                          config: { ...element.config, chartType: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        {chartTypes.map(chart => (
                          <option key={chart.type} value={chart.type}>
                            {chart.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={element.config.title}
                        onChange={(e) => updateElement(element.id, {
                          config: { ...element.config, title: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
};

export default ReportBuilder;
