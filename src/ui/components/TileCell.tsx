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
      case 0: return 'bg-black';
      case 1: return 'bg-blue-800';
      case 2: return 'bg-yellow-400';
      case 3: return 'bg-yellow-200';
      case 4: return 'bg-red-500';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div 
      className={`${getBgColor(value)} w-8 h-8 border border-gray-900 flex items-center justify-center`}
      title={`${tileTypes[value] || 'Unknown'} (${value}) - Position: (${colIndex}, ${rowIndex})`}
    >
      <span className="text-xs text-white font-mono">{value}</span>
    </div>
  );
};

export default TileCell;
