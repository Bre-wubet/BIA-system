import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as integrationApi from '../../../api/integrationApi';
import Button from '../../../components/ui/Button';

const ImportExport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [exportType, setExportType] = useState('all'); // 'all', 'selected'
  const [exportFormat, setExportFormat] = useState('csv'); // 'csv', 'json', 'excel'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dataSources, setDataSources] = useState([]);
  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeHistory: false,
    dateRange: 'all' // 'all', 'last30', 'last90', 'custom'
  });
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        const response = await integrationApi.getAllDataSources();
        setDataSources(response.data || []);
      } catch (error) {
        console.error('Error fetching data sources:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load data sources. Please try again later.'
        });
      }
    };

    fetchDataSources();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage(null);
  };
  
  const handleDataSourceSelect = (id) => {
    setSelectedDataSources(prev => {
      if (prev.includes(id)) {
        return prev.filter(dsId => dsId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSelectAllDataSources = () => {
    if (selectedDataSources.length === dataSources.length) {
      setSelectedDataSources([]);
    } else {
      setSelectedDataSources(dataSources.map(ds => ds.id));
    }
  };
  
  const handleExportOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  const handleCustomDateChange = (field, value) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file to import' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setLoading(true);
      setMessage(null);
      const response = await integrationApi.importData(formData);
      setMessage({ type: 'success', text: response.message || 'Import successful' });
      setSelectedFile(null);
      
      // Refresh data sources after import
      const sourcesResponse = await integrationApi.getAllDataSources();
      setDataSources(sourcesResponse.data || []);
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error importing data. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // Validate if data sources are selected when export type is 'selected'
      if (exportType === 'selected' && selectedDataSources.length === 0) {
        setMessage({ type: 'error', text: 'Please select at least one data source to export' });
        setLoading(false);
        return;
      }
      
      // Validate custom date range if selected
      if (exportOptions.dateRange === 'custom') {
        if (!customDateRange.startDate || !customDateRange.endDate) {
          setMessage({ type: 'error', text: 'Please provide both start and end dates for custom date range' });
          setLoading(false);
          return;
        }
        
        const startDate = new Date(customDateRange.startDate);
        const endDate = new Date(customDateRange.endDate);
        
        if (startDate > endDate) {
          setMessage({ type: 'error', text: 'Start date cannot be after end date' });
          setLoading(false);
          return;
        }
      }
      
      const exportParams = {
        format: exportFormat,
        type: exportType,
        dataSources: exportType === 'selected' ? selectedDataSources : undefined,
        options: {
          ...exportOptions,
          customDateRange: exportOptions.dateRange === 'custom' ? customDateRange : undefined
        }
      };
      
      const response = await integrationApi.exportData(exportParams);
      
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage({ type: 'success', text: 'Export successful' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error exporting data. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Import/Export Data</h1>
        <Button 
          onClick={() => navigate('/integration')} 
            className="px-4 py-2 text-green-950 hover:bg-blue-100"
            variant='outline'
          >
            Back to Integration
        </Button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-700">Processing your request...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Import Data</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select File</label>
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="w-full p-2 border border-gray-300 rounded"
              accept=".csv,.json,.xlsx,.xls"
            />
            <p className="text-sm text-gray-500 mt-1">Supported formats: CSV, JSON, Excel</p>
          </div>
          <button 
            onClick={handleImport} 
            disabled={loading || !selectedFile}
            className={`w-full py-2 rounded ${loading || !selectedFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            {loading ? 'Importing...' : 'Import Data'}
          </button>
        </div>

        {/* Export Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Export Data</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Export Type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="all">All Data</option>
              <option value="selected">Selected Data Sources</option>
            </select>
          </div>
          
          {exportType === 'selected' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Data Sources</label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                <div className="flex items-center mb-2 pb-2 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedDataSources.length === dataSources.length && dataSources.length > 0}
                    onChange={handleSelectAllDataSources}
                    className="mr-2"
                  />
                  <span className="font-medium">Select All</span>
                </div>
                {dataSources.map(source => (
                  <div key={source.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={selectedDataSources.includes(source.id)}
                      onChange={() => handleDataSourceSelect(source.id)}
                      className="mr-2"
                    />
                    <span>{source.name} ({source.type})</span>
                  </div>
                ))}
                {dataSources.length === 0 && (
                  <p className="text-gray-500 text-sm">No data sources available</p>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Export Options</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeMetadata"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => handleExportOptionChange('includeMetadata', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="includeMetadata">Include Metadata</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeHistory"
                  checked={exportOptions.includeHistory}
                  onChange={(e) => handleExportOptionChange('includeHistory', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="includeHistory">Include Sync History</label>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Date Range</label>
            <select
              value={exportOptions.dateRange}
              onChange={(e) => handleExportOptionChange('dateRange', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            >
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {exportOptions.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">End Date</label>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleExport} 
            disabled={loading || (exportType === 'selected' && selectedDataSources.length === 0)}
            className={`w-full py-2 rounded ${loading || (exportType === 'selected' && selectedDataSources.length === 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            {loading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

     {/* Data Mapping Section */}
       <div className="mt-8 bg-white shadow rounded-lg p-6">
         <h2 className="text-xl font-semibold mb-4">Data Mapping Templates</h2>
         <p className="mb-4">Download templates for data mapping to help with your data integration:</p>
        
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
             <h3 className="font-semibold mb-2">Salesforce Template</h3>
             <p className="text-sm text-gray-600 mb-2">Standard mapping for Salesforce CRM data</p>
             <button className="text-blue-600 hover:text-blue-800 text-sm">Download Template</button>
           </div>
          
           <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
             <h3 className="font-semibold mb-2">SAP Template</h3>
             <p className="text-sm text-gray-600 mb-2">Standard mapping for SAP ERP data</p>
             <button className="text-blue-600 hover:text-blue-800 text-sm">Download Template</button>
           </div>
          
           <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
             <h3 className="font-semibold mb-2">Custom API Template</h3>
             <p className="text-sm text-gray-600 mb-2">Template for custom API integrations</p>
             <button className="text-blue-600 hover:text-blue-800 text-sm">Download Template</button>
           </div>
         </div>
       </div>
     </div>
   );
}
 export default ImportExport;