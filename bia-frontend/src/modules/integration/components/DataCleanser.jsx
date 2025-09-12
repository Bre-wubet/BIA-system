// import React, { useState, useEffect } from 'react';
// import * as integrationApi from '../../../api/integrationApi';

// const DataCleanser = ({ data, onDataCleansed }) => {
//   const [cleansingRules, setCleansingRules] = useState([
//     { id: 1, field: '', operation: 'remove_duplicates', value: '', active: true },
//   ]);
//   const [previewData, setPreviewData] = useState(data);
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const [selectedDataSource, setSelectedDataSource] = useState('');
//   const [dataSources, setDataSources] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   const operations = [
//     { value: 'remove_duplicates', label: 'Remove Duplicates' },
//     { value: 'remove_nulls', label: 'Remove Null Values' },
//     { value: 'trim_whitespace', label: 'Trim Whitespace' },
//     { value: 'replace_value', label: 'Replace Value' },
//     { value: 'standardize_case', label: 'Standardize Case' },
//     { value: 'format_date', label: 'Format Date' },
//     { value: 'format_number', label: 'Format Number' },
//     { value: 'remove_special_chars', label: 'Remove Special Characters' },
//   ];
  
//   useEffect(() => {
//     const fetchDataSources = async () => {
//       try {
//         setLoading(true);
//         const response = await integrationApi.getActiveDataSources();
//         setDataSources(response.data || []);
//         if (response.data && response.data.length > 0) {
//           setSelectedDataSource(response.data[0].id);
//         }
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching data sources:', err);
//         setError('Failed to load data sources. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDataSources();
    
//     // Load saved cleansing rules if they exist
//     const loadCleansingRules = async () => {
//       try {
//         const response = await integrationApi.getCleansingRules();
//         if (response.data && response.data.length > 0) {
//           setCleansingRules(response.data);
//         }
//       } catch (err) {
//         console.error('Error loading cleansing rules:', err);
//         // Don't set error here to avoid overriding data source errors
//       }
//     };
    
//     loadCleansingRules();
//   }, []);

//   const addRule = () => {
//     const newRule = {
//       id: Date.now().toString(),
//       field: '',
//       operation: 'remove_duplicates',
//       value: '',
//       active: true,
//       data_source_id: selectedDataSource
//     };
//     setCleansingRules([...cleansingRules, newRule]);
//   };

//   const removeRule = async (id) => {
//     try {
//       // Check if this is a saved rule (has a numeric ID)
//       const ruleToRemove = cleansingRules.find(rule => rule.id === id);
//       if (ruleToRemove && !isNaN(Number(ruleToRemove.id))) {
//         setLoading(true);
//         await integrationApi.deleteCleansingRule(id);
//         setSuccess('Rule deleted successfully');
//       }
      
//       setCleansingRules(cleansingRules.filter(rule => rule.id !== id));
//     } catch (err) {
//       console.error('Error removing rule:', err);
//       setError('Failed to delete rule. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateRule = (id, field, value) => {
//     setCleansingRules(cleansingRules.map(rule => {
//       if (rule.id === id) {
//         return { ...rule, [field]: value };
//       }
//       return rule;
//     }));
//   };

//   const toggleRuleActive = async (id) => {
//     try {
//       const ruleToToggle = cleansingRules.find(rule => rule.id === id);
//       const newActiveState = !ruleToToggle.active;
      
//       // Update local state first for responsive UI
//       setCleansingRules(cleansingRules.map(rule => {
//         if (rule.id === id) {
//           return { ...rule, active: newActiveState };
//         }
//         return rule;
//       }));
      
//       // If this is a saved rule (has a numeric ID), update on server
//       if (ruleToToggle && !isNaN(Number(ruleToToggle.id))) {
//         await integrationApi.updateCleansingRule(id, {
//           ...ruleToToggle,
//           active: newActiveState
//         });
//       }
//     } catch (err) {
//       console.error('Error toggling rule status:', err);
//       setError('Failed to update rule status. Please try again.');
      
//       // Revert the local state change on error
//       setCleansingRules(prevRules => prevRules.map(rule => {
//         if (rule.id === id) {
//           return { ...rule, active: !rule.active };
//         }
//         return rule;
//       }));
//     }
//   };
  
//   const saveRules = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       setSuccess(null);
      
//       // Filter out rules that don't have required fields
//       const validRules = cleansingRules.filter(rule => rule.operation && rule.field);
      
//       if (validRules.length === 0) {
//         setError('No valid rules to save. Please add at least one complete rule.');
//         setLoading(false);
//         return;
//       }
      
//       // Separate rules into new and existing
//       const newRules = validRules.filter(rule => isNaN(Number(rule.id)));
//       const existingRules = validRules.filter(rule => !isNaN(Number(rule.id)));
      
//       // Create new rules
//       if (newRules.length > 0) {
//         await Promise.all(newRules.map(rule => {
//           // Convert temporary ID to proper format for API
//           const { id, ...ruleData } = rule;
//           return integrationApi.createCleansingRule({
//             ...ruleData,
//             data_source_id: selectedDataSource
//           });
//         }));
//       }
      
//       // Update existing rules
//       if (existingRules.length > 0) {
//         await Promise.all(existingRules.map(rule => {
//           return integrationApi.updateCleansingRule(rule.id, rule);
//         }));
//       }
      
//       // Refresh rules from server to get proper IDs
//       const response = await integrationApi.getCleansingRules(selectedDataSource);
//       setCleansingRules(response.data || []);
      
//       setSuccess('Cleansing rules saved successfully');
//     } catch (err) {
//       console.error('Error saving rules:', err);
//       setError('Failed to save rules. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const previewCleansing = async () => {
//     if (!selectedDataSource) {
//       setError('Please select a data source');
//       return;
//     }
    
//     if (cleansingRules.length === 0 || !cleansingRules.some(rule => rule.active)) {
//       setError('Please add at least one active cleansing rule');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
//       setSuccess(null);
      
//       // Only send active rules with required fields
//       const activeRules = cleansingRules
//         .filter(rule => rule.active && rule.operation && (rule.operation === 'remove_duplicates' || rule.field));
      
//       if (activeRules.length === 0) {
//         setError('No valid active rules. Please add at least one complete rule and make it active.');
//         setLoading(false);
//         return;
//       }
      
//       const response = await integrationApi.previewDataCleansing({
//         data_source_id: selectedDataSource,
//         rules: activeRules
//       });
      
//       setPreviewData(response.data || []);
//       setIsPreviewMode(true);
//       setSuccess('Preview generated successfully');
//     } catch (err) {
//       console.error('Error previewing data cleansing:', err);
//       setError('Failed to generate preview. Please try again.');
//       setIsPreviewMode(false);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const applyCleansingRules = async () => {
//     if (!selectedDataSource) {
//       setError('Please select a data source');
//       return;
//     }
    
//     if (cleansingRules.length === 0 || !cleansingRules.some(rule => rule.active)) {
//       setError('Please add at least one active cleansing rule');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
//       setSuccess(null);
      
//       // Save rules first
//       await saveRules();
      
//       // Apply the rules to the actual data
//       const response = await integrationApi.applyDataCleansing(selectedDataSource);
      
//       setSuccess(`Cleansing applied successfully. ${response.data?.rowsAffected || 0} rows affected.`);
//       setIsPreviewMode(false);
//     } catch (err) {
//       console.error('Error applying data cleansing:', err);
//       setError('Failed to apply cleansing rules. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetPreview = () => {
//     setIsPreviewMode(false);
//     setPreviewData(data);
//   };

//   // Get all available fields from the data
//   const getAvailableFields = () => {
//     if (!data || data.length === 0) return [];
//     return Object.keys(data[0]);
//   };

//   return (
//     <div className="bg-white shadow rounded-lg p-6">
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
      
//       {success && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           {success}
//         </div>
//       )}
      
//       {loading && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
//             <p className="text-gray-700">Processing your request...</p>
//           </div>
//         </div>
//       )}
      
//       <div className="mb-4">
//         <label className="block text-gray-700 font-medium mb-2">Data Source</label>
//         <select 
//           value={selectedDataSource}
//           onChange={(e) => setSelectedDataSource(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded"
//           disabled={loading}
//         >
//           <option value="">Select a data source</option>
//           {dataSources.map(source => (
//             <option key={source.id} value={source.id}>
//               {source.name} ({source.type})
//             </option>
//           ))}
//         </select>
//       </div>
//       <h2 className="text-xl font-semibold mb-4">Data Cleansing</h2>
      
//       <div className="mb-6">
//         <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg font-medium">Cleansing Rules</h3>
//         <div className="space-x-2">
//           <button 
//             onClick={saveRules}
//             className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
//             disabled={loading || !selectedDataSource}
//           >
//             Save Rules
//           </button>
//           <button 
//             onClick={addRule}
//             className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
//             disabled={loading || !selectedDataSource}
//           >
//             Add Rule
//           </button>
//         </div>
//       </div>
        
//         {cleansingRules.map((rule) => (
//           <div key={rule.id} className="flex items-center space-x-2 mb-2 p-2 border rounded">
//             <input
//               type="checkbox"
//               checked={rule.active}
//               onChange={() => toggleRuleActive(rule.id)}
//               className="h-4 w-4 text-blue-600"
//             />
            
//             <select
//               value={rule.field}
//               onChange={(e) => updateRule(rule.id, 'field', e.target.value)}
//               className="border rounded px-2 py-1 text-sm flex-1"
//             >
//               <option value="">All Fields</option>
//               {getAvailableFields().map(field => (
//                 <option key={field} value={field}>{field}</option>
//               ))}
//             </select>
            
//             <select
//               value={rule.operation}
//               onChange={(e) => updateRule(rule.id, 'operation', e.target.value)}
//               className="border rounded px-2 py-1 text-sm flex-1"
//             >
//               {operations.map(op => (
//                 <option key={op.value} value={op.value}>{op.label}</option>
//               ))}
//             </select>
            
//             {(rule.operation === 'replace_value' || rule.operation === 'standardize_case') && (
//               <input
//                 type="text"
//                 value={rule.value}
//                 onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
//                 placeholder={rule.operation === 'replace_value' ? 'oldValue|newValue' : 'upper/lower'}
//                 className="border rounded px-2 py-1 text-sm flex-1"
//               />
//             )}
            
//             <button 
//               onClick={() => removeRule(rule.id)}
//               className="text-red-600 hover:text-red-800"
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//       </div>
      
//       <div className="flex space-x-2 mb-4">
//         <button 
//           onClick={previewCleansing}
//           className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
//           disabled={loading || cleansingRules.length === 0 || !selectedDataSource}
//         >
//           Preview Changes
//         </button>
//         <button 
//           onClick={applyCleansingRules}
//           className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//           disabled={loading || !isPreviewMode}
//         >
//           Apply Cleansing
//         </button>
//         {isPreviewMode && (
//           <button 
//             onClick={resetPreview}
//             className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//             disabled={loading}
//           >
//             Reset Preview
//           </button>
//         )}
//       </div>
      
//       {isPreviewMode && (
//         <div>
//           <h3 className="text-lg font-medium mb-2">Preview Results</h3>
//           <div className="border rounded overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   {getAvailableFields().map(field => (
//                     <th 
//                       key={field}
//                       className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                     >
//                       {field}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {previewData.slice(0, 5).map((item, index) => (
//                   <tr key={index}>
//                     {getAvailableFields().map(field => (
//                       <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {item[field]?.toString() || ''}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <p className="text-sm text-gray-500 mt-2">
//             Showing {Math.min(5, previewData.length)} of {previewData.length} records
//           </p>
//           <div className="mt-2">
//             <p className="text-sm font-medium">
//               Original: {data.length} records | Cleansed: {previewData.length} records
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DataCleanser;