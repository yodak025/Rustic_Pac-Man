import React from 'react';
import KeyDisplay from '@/ui/components/KeyDisplay';

export interface GameControlsDisplayProps {
  className?: string;
}

const GameControlsDisplay: React.FC<GameControlsDisplayProps> = ({ className }) => {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <p className="text-xl font-mono text-[var(--color-text-light)]">Direction keys</p>
      <div className="grid grid-cols-3 gap-2">
        <KeyDisplay value="W" className="col-start-2" />
        <KeyDisplay value="A" className="col-start-1" />
        <KeyDisplay value="S" />
        <KeyDisplay value="D" className="col-start-3" />
      </div>
    </div>
  );
};

export default GameControlsDisplay;
