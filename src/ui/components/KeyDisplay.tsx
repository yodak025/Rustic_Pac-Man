import React from 'react';

interface KeyDisplayProps {
  value: string;
  className?: string;
}

const KeyDisplay: React.FC<KeyDisplayProps> = ({ value, className }) => {
  return (
    <div className={`flex items-center justify-center w-12 h-12 border-2 border-[var(--color-accent)] rounded-md bg-[var(--color-background)] text-[var(--color-accent)] text-2xl font-mono ${className}`}>
      {value}
    </div>
  );
};

export default KeyDisplay;
