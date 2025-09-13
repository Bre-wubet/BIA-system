import React from 'react';

const SearchInput = ({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  icon, 
  className = "",
  disabled = false,
  onClear
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
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : 'pl-3'}
          ${onClear && value ? 'pr-10' : 'pr-3'}
        `}
      />
      {onClear && value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
