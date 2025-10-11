import React from 'react';

export interface PageTitleProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ 
  children, 
  size = 'large',
  className = ''
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'text-2xl';
      case 'medium':
        return 'text-4xl';
      case 'large':
        return 'text-6xl';
      default:
        return 'text-6xl';
    }
  };

  return (
    <h1 className={`font-bold mb-8 text-yellow-400 font-mono tracking-wider ${getSizeStyles()} ${className}`}>
      {children}
    </h1>
  );
};

export default PageTitle;
