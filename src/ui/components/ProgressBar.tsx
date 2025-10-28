import React from 'react';

export interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  showPercentage = false,
  className = '',
  animated = true
}) => {
  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className="w-96 h-4 bg-[var(--color-background)] border-2 border-[var(--color-accent)] relative overflow-hidden">
        <div 
          className={`h-full bg-[var(--color-primary-light)] ${animated ? 'transition-all duration-200 ease-out' : ''}`}
          style={{ width: `${progress}%` }}
        />
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[color:var(--color-primary-light)]/30 to-transparent animate-pulse" />
        )}
      </div>
      
      {showPercentage && (
        <p className="text-lg font-mono text-[color:var(--color-primary-light)]/70">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
