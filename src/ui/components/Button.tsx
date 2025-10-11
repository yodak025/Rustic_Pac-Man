import React from 'react';

export interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary',
  disabled = false,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-yellow-400 text-black border-yellow-400 hover:bg-black hover:text-yellow-400';
      case 'secondary':
        return 'bg-blue-400 text-black border-blue-400 hover:bg-black hover:text-blue-400';
      case 'danger':
        return 'bg-red-400 text-black border-red-400 hover:bg-black hover:text-red-400';
      case 'success':
        return 'bg-green-600 text-white border-green-600 hover:bg-black hover:text-green-400';
      default:
        return 'bg-yellow-400 text-black border-yellow-400 hover:bg-black hover:text-yellow-400';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 font-mono font-bold text-lg border-2 transition-all duration-200 uppercase tracking-wide ${getVariantStyles()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
