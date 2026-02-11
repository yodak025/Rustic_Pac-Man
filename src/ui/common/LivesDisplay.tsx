import React from 'react';
import HeartIcon from '@/ui/components/HeartIcon';

export interface LivesDisplayProps {
  lives: number;
  className?: string;
}

const LivesDisplay: React.FC<LivesDisplayProps> = ({ lives, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Pac-Man Sphere */}
      <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]"></div>
      
      {/* Lives Count */}
      <div className="flex items-center gap-1 p-1 rounded-md border-2 border-[var(--color-accent)] bg-[var(--color-background)] text-[var(--color-text-main)] font-mono text-lg">
        <HeartIcon />
        <span className='text-2xl'>:{lives}</span>
      </div>
    </div>
  );
};

export default LivesDisplay;
