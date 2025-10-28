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
      <div className={`bg-[var(--color-background)] border-4 border-[var(--color-accent)] p-8 rounded-lg shadow-2xl shadow-[var(--color-accent)]/50 ${className}`}>
        {title && (
          <h2 className="text-4xl font-bold text-[var(--color-primary-light)] font-mono text-center mb-8 tracking-wider">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
