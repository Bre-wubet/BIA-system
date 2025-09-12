import React, { useState, useEffect } from 'react';
import * as integrationApi from '../../../api/integrationApi';
import { toast } from 'react-toastify';
import { FiInfo, FiAlertTriangle } from 'react-icons/fi';

const MappingRuleForm = ({ dataSourceId, rule, isEditing = false, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    source_field: '',
    target_field: '',
    transformation: {},
    ...rule
  });

  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [sourceFields, setSourceFields] = useState([]);
  const [targetFields, setTargetFields] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  // const [sampleData, setSampleData] = useState([]);

  useEffect(() => {
    if (dataSourceId) {
      fetchDataSource();
      // fetchSampleData();
    }

    // Editing mode: normalize transformation
    if (isEditing && rule) {
      let transformationObj = {};
      if (rule.transformation) {
        try {
          transformationObj =
            typeof rule.transformation === 'string'
              ? JSON.parse(rule.transformation)
              : rule.transformation;
        } catch (err) {
          console.error('Error parsing transformation:', err);
        }
      }

      setFormData({
        sourceField: rule.source_field || '',
        targetField: rule.target_field || '',
        transformation: transformationObj,
      });
    }
  }, [dataSourceId, isEditing, rule]);

  const fetchDataSource = async () => {
    try {
      const response = await integrationApi.getDataSource(dataSourceId);
      setDataSource(response.data);
    } catch (err) {
      console.error('Error fetching data source:', err);
      setError('Failed to load data source information.');
      toast.error('Failed to load data source information');
    }
  };

  // const fetchSampleData = async () => {
  //   try {
  //     const response = await integrationApi.getDataSourceSample(dataSourceId);
  //     if (response.data?.length > 0) {
  //       const sampleRecord = response.data[0];
  //       setSourceFields(Object.keys(sampleRecord));
  //       setSampleData(response.data);

  //       // TODO: Replace this placeholder with actual schema call for target fields
  //       setTargetFields(['id', 'name', 'description', 'created_at', 'updated_at']);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching sample data:', err);
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Support nested transformation.* fields
    if (name.startsWith('transformation.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        transformation: {
          ...prev.transformation,
          [key]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.sourceField) errors.sourceField = 'Source field is required';
    if (!formData.targetField) errors.targetField = 'Target field is required';

    if (formData.transformation?.lookupTable) {
      try {
        JSON.parse(formData.transformation.lookupTable);
      } catch {
        errors.lookupTable = 'Invalid JSON format for lookup table';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePreviewTransformation = () => {
    setPreviewData(null);

    if (!formData.sourceField) {
      toast.error('Please enter a source field first');
      return;
    }

    let sampleValue = 'example';
    if (sampleData.length > 0) {
      const record = sampleData[0];
      sampleValue = record[formData.sourceField] || 'example';
    }

    try {
      let result = sampleValue;
      let description = 'No transformation';

      if (formData.transformation?.formula) {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('value', `return ${formData.transformation.formula}`);
          result = fn(sampleValue);
          description = `Formula: ${formData.transformation.formula}`;
        } catch (err) {
          toast.error(`Formula error: ${err.message}`);
          return;
        }
      }

      if (formData.transformation?.lookupTable) {
        try {
          const lookupTable = JSON.parse(formData.transformation.lookupTable);
          if (lookupTable[result] !== undefined) {
            result = lookupTable[result];
            description += formData.transformation.formula ? ' + Lookup Table' : 'Lookup Table';
          }
        } catch (err) {
          toast.error(`Lookup table error: ${err.message}`);
          return;
        }
      }

      setPreviewData({ sourceValue: sampleValue, transformation: description, result });
    } catch (err) {
      toast.error(`Preview error: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        source_field: formData.sourceField,
        target_field: formData.targetField,
        transformation: JSON.stringify(formData.transformation || {}),
      };

      let result;
      if (isEditing) {
        result = await integrationApi.updateMappingRule(dataSourceId, rule.id, payload);
        toast.success('Mapping rule updated successfully');
      } else {
        result = await integrationApi.addMappingRule(dataSourceId, payload);
        toast.success('Mapping rule created successfully');
      }

      onSave(result.data);
    } catch (err) {
      console.error('Error saving mapping rule:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to save mapping rule';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Edit Mapping Rule' : 'Add New Mapping Rule'}
        </h3>
        {dataSource && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {dataSource.name}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center">
          <FiAlertTriangle className="text-red-500 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form>
        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Field */}
          <div>
            <label htmlFor="sourceField" className="block text-sm font-medium text-gray-700">
              Source Field *
            </label>
            <input
              type="text"
              id="sourceField"
              name="sourceField"
              value={formData.sourceField}
              onChange={handleInputChange}
              list="sourceFieldSuggestions"
              className={`mt-1 block w-full border ${
                validationErrors.sourceField ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm p-2`}
            />
            <datalist id="sourceFieldSuggestions">
              {sourceFields.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
            {validationErrors.sourceField && (
              <p className="text-red-500 text-xs">{validationErrors.sourceField}</p>
            )}
          </div>

          {/* Target Field */}
          <div>
            <label htmlFor="targetField" className="block text-sm font-medium text-gray-700">
              Target Field *
            </label>
            <input
              type="text"
              id="targetField"
              name="targetField"
              value={formData.targetField}
              onChange={handleInputChange}
              list="targetFieldSuggestions"
              className={`mt-1 block w-full border ${
                validationErrors.targetField ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm p-2`}
            />
            <datalist id="targetFieldSuggestions">
              {targetFields.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
            {validationErrors.targetField && (
              <p className="text-red-500 text-xs">{validationErrors.targetField}</p>
            )}
          </div>
        </div>

        {/* Transformation */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Transformation</label>
          <input
            type="text"
            name="transformation.formula"
            placeholder="Formula (e.g., value * 100)"
            value={formData.transformation?.formula || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono"
          />
          <textarea
            name="transformation.lookupTable"
            placeholder='{"old": "new"}'
            value={formData.transformation?.lookupTable || ''}
            onChange={handleInputChange}
            rows="3"
            className="mt-3 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono"
          />
        </div>

        {/* Preview */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handlePreviewTransformation}
            className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
          >
            Preview Transformation
          </button>

          {previewData && (
            <div className="mt-3 border rounded p-3 bg-gray-50 text-sm">
              <p>
                <strong>Source:</strong> {previewData.sourceValue}
              </p>
              <p>
                <strong>Transformation:</strong> {previewData.transformation}
              </p>
              <p>
                <strong>Result:</strong> {previewData.result}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => onDelete(rule.id)}
              className="px-4 py-2 border rounded text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MappingRuleForm;
