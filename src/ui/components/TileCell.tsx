import React from 'react';

export interface TileCellProps {
  value: number;
  rowIndex: number;
  colIndex: number;
  tileTypes?: Record<number, string>;
}

const TileCell: React.FC<TileCellProps> = ({ 
  value, 
  rowIndex, 
  colIndex,
  tileTypes = {}
}) => {
  const getBgColor = (value: number) => {
    switch (value) {
      case 0: return 'bg-[var(--color-background)]' // Empty space
      case 1: return 'bg-[var(--color-main-light)]' // Wall
      case 2: return 'bg-[var(--color-accent)]' // Pac-dot
      case 3: return 'bg-[var(--color-success)]' // Power-pellet
      case 4: return 'bg-[var(--color-alert)]' // Special (e.g., ghost/pacman start)
      default: return 'bg-[var(--color-main)]' // Unknown type
    }
  }

  return (
    <div 
      className={`${getBgColor(value)} w-8 h-8 border border-[var(--color-accent)] flex items-center justify-center`}
      title={`${tileTypes[value] || 'Unknown'} (${value}) - Position: (${colIndex}, ${rowIndex})`}
    >
      <span className="text-xs text-[var(--color-text-main)] font-mono">{value}</span>
    </div>
  );
};

export default TileCell;
