import React from 'react';

const FilterDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  icon, 
  placeholder = "Select...",
  className = "",
  disabled = false
}) => {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          appearance-none w-full py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${icon ? 'pl-10 pr-8' : 'px-3'}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default FilterDropdown;
