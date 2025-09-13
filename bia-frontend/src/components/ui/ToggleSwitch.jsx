import React from 'react';

const ToggleSwitch = ({ 
  checked, 
  onChange, 
  label, 
  disabled = false,
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-8 h-4",
    md: "w-11 h-6",
    lg: "w-14 h-8"
  };

  const thumbSizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-7 h-7"
  };

  const translateClasses = {
    sm: checked ? "translate-x-4" : "translate-x-0",
    md: checked ? "translate-x-5" : "translate-x-0",
    lg: checked ? "translate-x-6" : "translate-x-0"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${sizeClasses[size]}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out
            ${thumbSizeClasses[size]}
            ${translateClasses[size]}
          `}
        />
      </button>
      {label && (
        <span className={`ml-3 text-sm font-medium text-gray-700 ${disabled ? 'text-gray-400' : ''}`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default ToggleSwitch;
