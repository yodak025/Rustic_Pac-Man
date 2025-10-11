import React from 'react';

export interface DebugInputProps {
  placeholder: string;
  type?: 'text' | 'number';
  onSubmit: (value: string) => void;
  min?: string;
  className?: string;
}

const DebugInput: React.FC<DebugInputProps> = ({ 
  placeholder, 
  type = 'text',
  onSubmit,
  min,
  className = ''
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      min={min}
      className={`w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700 ${className}`}
      onKeyDown={handleKeyDown}
    />
  );
};

export default DebugInput;
