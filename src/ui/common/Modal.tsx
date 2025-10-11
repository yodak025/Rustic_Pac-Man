import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  children, 
  title,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={`bg-black border-4 border-yellow-400 p-8 rounded-lg shadow-2xl shadow-yellow-400/50 ${className}`}>
        {title && (
          <h2 className="text-4xl font-bold text-yellow-400 font-mono text-center mb-8 tracking-wider">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
