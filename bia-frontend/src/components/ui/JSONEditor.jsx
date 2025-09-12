import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * A simple JSON editor component with syntax highlighting
 */
const JSONEditor = ({ value, onChange, height = '200px', readOnly = false }) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    try {
      // Validate JSON but only if there's content
      if (newValue.trim()) {
        JSON.parse(newValue);
      }
      setError(null);
      onChange(newValue);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  return (
    <div className="json-editor-container">
      <textarea
        value={internalValue}
        onChange={handleChange}
        className={`w-full font-mono text-sm p-2 ${error ? 'border-red-500' : ''}`}
        style={{ height, resize: 'vertical' }}
        readOnly={readOnly}
        spellCheck="false"
      />
      {error && (
        <div className="text-red-500 text-xs mt-1">{error}</div>
      )}
    </div>
  );
};

JSONEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  height: PropTypes.string,
  readOnly: PropTypes.bool
};

export default JSONEditor;