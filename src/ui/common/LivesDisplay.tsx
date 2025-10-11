import React from 'react';
import HeartIcon from '@/ui/components/HeartIcon';

export interface LivesDisplayProps {
  lives: number;
  className?: string;
}

const LivesDisplay: React.FC<LivesDisplayProps> = ({ lives, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span>Vidas:</span>
      <div className="flex gap-1 bg-black">
        {Array.from({ length: lives }, (_, index) => (
          <HeartIcon key={index} />
        ))}
      </div>
    </div>
  );
};

export default LivesDisplay;
