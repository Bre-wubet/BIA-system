// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import * as integrationApi from '../../../api/integrationApi';

// const ComplianceCheck = () => {
//   const [complianceRules, setComplianceRules] = useState([]);
//   const [complianceResults, setComplianceResults] = useState(null);
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [selectedDataSource, setSelectedDataSource] = useState('');
//   const [dataSources, setDataSources] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [data, setData] = useState([]);
//   const navigate = useNavigate();

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
    
//     // Load saved compliance rules if they exist
//     const loadComplianceRules = async () => {
//       try {
//         const response = await integrationApi.getComplianceRules();
//         if (response.data && response.data.length > 0) {
//           setComplianceRules(response.data);
//         } else {
//           // Initialize with a default rule if none exist
//           setComplianceRules([
//             { id: Date.now().toString(), field: '', rule: 'required', value: '', active: true }
//           ]);
//         }
//       } catch (err) {
//         console.error('Error loading compliance rules:', err);
//         // Initialize with a default rule on error
//         setComplianceRules([
//           { id: Date.now().toString(), field: '', rule: 'required', value: '', active: true }
//         ]);
//       }
//     };
    
//     loadComplianceRules();
//   }, []);
  
//   // Load data when data source changes
//   useEffect(() => {
//     if (selectedDataSource) {
//       const fetchDataSample = async () => {
//         try {
//           setLoading(true);
//           const response = await integrationApi.getDataSourceSample(selectedDataSource);
//           setData(response.data || []);
//           setError(null);
//         } catch (err) {
//           console.error('Error fetching data sample:', err);
//           setError('Failed to load data sample. Please try again later.');
//           setData([]);
//         } finally {
//           setLoading(false);
//         }
//       };
      
//       fetchDataSample();
//     }
//   }, [selectedDataSource]);

//   const ruleTypes = [
//     { value: 'required', label: 'Required Field' },
//     { value: 'format', label: 'Format Validation' },
//     { value: 'range', label: 'Value Range' },
//     { value: 'unique', label: 'Unique Value' },
//     { value: 'regex', label: 'Regular Expression' },
//     { value: 'enum', label: 'Enumeration' },
//     { value: 'pii', label: 'PII Detection' },
//     { value: 'gdpr', label: 'GDPR Compliance' },
//   ];

//   const addRule = () => {
//     if (!selectedDataSource) {
//       setError('Please select a data source first');
//       return;
//     }
    
//     const newRule = {
//       id: Date.now().toString(),
//       field: '',
//       rule: 'required',
//       value: '',
//       active: true,
//       data_source_id: selectedDataSource
//     };
//     setComplianceRules([...complianceRules, newRule]);
//     setError(null);
//   };

//   const removeRule = async (id) => {
//     try {
//       // Check if this is a saved rule (has a numeric ID)
//       const ruleToRemove = complianceRules.find(rule => rule.id === id);
//       if (ruleToRemove && !isNaN(Number(ruleToRemove.id))) {
//         setLoading(true);
//         await integrationApi.deleteComplianceRule(id);
//         setSuccess('Rule deleted successfully');
//       }
      
//       setComplianceRules(complianceRules.filter(rule => rule.id !== id));
//       setError(null);
//     } catch (err) {
//       console.error('Error removing rule:', err);
//       setError('Failed to delete rule. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateRule = (id, field, value) => {
//     setComplianceRules(complianceRules.map(rule => {
//       if (rule.id === id) {
//         if (field === 'rule' && rule.rule !== value) {
//           // Reset value when rule type changes
//           return { ...rule, [field]: value, value: '' };
//         }
//         return { ...rule, [field]: value };
//       }
//       return rule;
//     }));
//   };

//   const toggleRuleActive = async (id) => {
//     try {
//       const ruleToToggle = complianceRules.find(rule => rule.id === id);
//       const newActiveState = !ruleToToggle.active;
      
//       // Update local state first for responsive UI
//       setComplianceRules(complianceRules.map(rule => {
//         if (rule.id === id) {
//           return { ...rule, active: newActiveState };
//         }
//         return rule;
//       }));
      
//       // If this is a saved rule (has a numeric ID), update on server
//       if (ruleToToggle && !isNaN(Number(ruleToToggle.id))) {
//         await integrationApi.updateComplianceRule(id, {
//           ...ruleToToggle,
//           active: newActiveState
//         });
//       }
//       setError(null);
//     } catch (err) {
//       console.error('Error toggling rule status:', err);
//       setError('Failed to update rule status. Please try again.');
      
//       // Revert the local state change on error
//       setComplianceRules(prevRules => prevRules.map(rule => {
//         if (rule.id === id) {
//           return { ...rule, active: !rule.active };
//         }
//         return rule;
//       }));
//     }
//   };
  
//   const saveRules = async () => {
//     if (!selectedDataSource) {
//       setError('Please select a data source first');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
//       setSuccess(null);
      
//       // Filter out rules that don't have required fields
//       const validRules = complianceRules.filter(rule => rule.field);
      
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
//           return integrationApi.createComplianceRule({
//             ...ruleData,
//             data_source_id: selectedDataSource
//           });
//         }));
//       }
      
//       // Update existing rules
//       if (existingRules.length > 0) {
//         await Promise.all(existingRules.map(rule => {
//           return integrationApi.updateComplianceRule(rule.id, rule);
//         }));
//       }
      
//       // Refresh rules from server to get proper IDs
//       const response = await integrationApi.getComplianceRules(selectedDataSource);
//       setComplianceRules(response.data || []);
      
//       setSuccess('Compliance rules saved successfully');
//     } catch (err) {
//       console.error('Error saving rules:', err);
//       setError('Failed to save rules. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyCompliance = async () => {
//     if (!selectedDataSource) {
//       setError('Please select a data source first');
//       return;
//     }
    
//     if (complianceRules.length === 0 || !complianceRules.some(rule => rule.active)) {
//       setError('Please add at least one active compliance rule');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
//       setSuccess(null);
//       setIsVerifying(true);
      
//       // Save rules first
//       await saveRules();
      
//       // Only send active rules with required fields
//       const activeRules = complianceRules
//         .filter(rule => rule.active && rule.field);
      
//       if (activeRules.length === 0) {
//         setError('No valid active rules. Please add at least one complete rule and make it active.');
//         setLoading(false);
//         setIsVerifying(false);
//         return;
//       }
      
//       // Call API to verify compliance
//       const response = await integrationApi.verifyCompliance({
//         data_source_id: selectedDataSource,
//         rules: activeRules
//       });
      
//       setComplianceResults(response.data || {
//         passed: true,
//         totalRecords: 0,
//         violations: [],
//         ruleResults: []
//       });
      
//       setSuccess('Compliance verification completed');
//     } catch (err) {
//       console.error('Error verifying compliance:', err);
//       setError('Failed to verify compliance. Please try again.');
//       setIsVerifying(false);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const exportComplianceReport = async () => {
//     if (!isVerifying || !complianceResults) {
//       setError('Please verify compliance before exporting a report');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
//       setSuccess(null);
      
//       const response = await integrationApi.exportComplianceReport({
//         data_source_id: selectedDataSource,
//         compliance_results: complianceResults
//       });
      
//       // Create a download link for the report
//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `compliance_report_${selectedDataSource}_${new Date().toISOString().split('T')[0]}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);
      
//       setSuccess('Compliance report exported successfully');
//     } catch (err) {
//       console.error('Error exporting compliance report:', err);
//       setError('Failed to export compliance report. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get all available fields from the data
//   const getAvailableFields = () => {
//     if (!data || data.length === 0) return [];
//     return Object.keys(data[0]);
//   };

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Compliance Check</h1>
//         <div className="space-x-2">
//           <button 
//             onClick={() => navigate('/integration')} 
//             className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
//           >
//             Back to Integration
//           </button>
//         </div>
//       </div>

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
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         <div className="col-span-1">
//           <label className="block text-gray-700 font-medium mb-2">Data Source</label>
//           <select 
//             value={selectedDataSource}
//             onChange={(e) => setSelectedDataSource(e.target.value)}
//             className="w-full p-2 border border-gray-300 rounded"
//             disabled={loading}
//           >
//             <option value="">Select a data source</option>
//             {dataSources.map(source => (
//               <option key={source.id} value={source.id}>
//                 {source.name} ({source.type})
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
      
//       <div className="bg-white shadow rounded-lg p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Compliance Rules</h2>
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
      
//       <div className="mb-6">
        
//         {complianceRules.map((rule) => (
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
//               <option value="">Select Field</option>
//               {getAvailableFields().map(field => (
//                 <option key={field} value={field}>{field}</option>
//               ))}
//             </select>
            
//             <select
//               value={rule.rule}
//               onChange={(e) => updateRule(rule.id, 'rule', e.target.value)}
//               className="border rounded px-2 py-1 text-sm flex-1"
//             >
//               {ruleTypes.map(type => (
//                 <option key={type.value} value={type.value}>{type.label}</option>
//               ))}
//             </select>
            
//             {(rule.rule === 'format' || rule.rule === 'range' || rule.rule === 'regex' || rule.rule === 'enum') && (
//               <input
//                 type="text"
//                 value={rule.value}
//                 onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
//                 placeholder={getPlaceholderForRule(rule.rule)}
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
      
//       <div className="flex justify-end space-x-4 mb-6">
//         <button 
//           onClick={() => {
//             setIsVerifying(false);
//             setComplianceResults(null);
//           }}
//           className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//           disabled={loading || !isVerifying}
//         >
//           Edit Rules
//         </button>
//         <button 
//           onClick={verifyCompliance}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           disabled={loading || complianceRules.length === 0 || !selectedDataSource}
//         >
//           Verify Compliance
//         </button>
//         <button 
//           onClick={exportComplianceReport}
//           className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//           disabled={loading || !isVerifying || !complianceResults}
//         >
//           Export Report
//         </button>
//       </div>
      
//       {complianceResults && (
//         <div>
//           <h3 className="text-lg font-medium mb-2">Compliance Results</h3>
          
//           <div className="mb-4 p-4 rounded" 
//             style={{ backgroundColor: complianceResults.passed ? '#f0fdf4' : '#fef2f2' }}
//           >
//             <div className="flex items-center">
//               <div className="mr-2">
//                 {complianceResults.passed ? (
//                   <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                 ) : (
//                   <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 )}
//               </div>
//               <div>
//                 <h4 className="font-medium">
//                   {complianceResults.passed ? 'All compliance checks passed!' : 'Compliance issues detected'}
//                 </h4>
//                 <p className="text-sm">
//                   {complianceResults.totalRecords} records checked, {complianceResults.violations.length} violations found
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           {complianceResults.violations.length > 0 && (
//             <div className="mb-4">
//               <h4 className="font-medium mb-2">Violations</h4>
//               <div className="border rounded overflow-x-auto max-h-60">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {complianceResults.violations.map((violation, index) => (
//                       <tr key={index}>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{violation.recordIndex + 1}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{violation.field}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{violation.value?.toString() || 'N/A'}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{violation.message}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
          
//           <div>
//             <h4 className="font-medium mb-2">Rule Summary</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//               {complianceResults.ruleResults.map((result) => {
//                 const rule = complianceRules.find(r => r.id === result.ruleId);
//                 return (
//                   <div 
//                     key={result.ruleId} 
//                     className="p-3 border rounded"
//                     style={{ backgroundColor: result.passed ? '#f0fdf4' : '#fef2f2' }}
//                   >
//                     <div className="flex justify-between">
//                       <div>
//                         <span className="font-medium">{getRuleTypeLabel(rule.rule)}</span>
//                         <span className="text-sm text-gray-600"> - {rule.field || 'All Fields'}</span>
//                       </div>
//                       <div>
//                         {result.passed ? (
//                           <span className="text-green-600 text-sm">Passed</span>
//                         ) : (
//                           <span className="text-red-600 text-sm">{result.violations} Violations</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Helper function to get placeholder text based on rule type
// function getPlaceholderForRule(ruleType) {
//   switch (ruleType) {
//     case 'format':
//       return 'email, date, phone';
//     case 'range':
//       return 'min|max (e.g. 0|100)';
//     case 'regex':
//       return 'Regular expression pattern';
//     case 'enum':
//       return 'value1,value2,value3';
//     default:
//       return '';
//   }
// }

// // Helper function to get rule type label
// function getRuleTypeLabel(ruleType) {
//   const ruleTypes = {
//     required: 'Required Field',
//     format: 'Format Validation',
//     range: 'Value Range',
//     unique: 'Unique Value',
//     regex: 'Regular Expression',
//     enum: 'Enumeration',
//     pii: 'PII Detection',
//     gdpr: 'GDPR Compliance',
//   };
  
//   return ruleTypes[ruleType] || ruleType;
// }

// export default ComplianceCheck;