import React, { useState } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = `
    font-mono font-bold text-lg uppercase tracking-wide
    text-[var(--color-primary-light)]
    hover:text-[var(--color-primary-medium)]
    transition-all duration-200 transform
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
    inline-flex items-center justify-center
  `;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={baseStyles}
    >
      {isHovered && <span className="mr-2">→</span>}
      <span className={`inline-block ${isHovered ? 'scale-105' : ''} transition-transform duration-200`}>
        {children}
      </span>
      {isHovered && <span className="ml-2">←</span>}
    </button>
  );
};

export default Button;