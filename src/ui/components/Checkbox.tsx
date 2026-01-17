'use client'

import React from 'react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ 
  checked, 
  onChange, 
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 accent-[var(--color-primary-light)] cursor-pointer"
      />
      <span className="font-mono text-[var(--color-text-light)] text-base">
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
