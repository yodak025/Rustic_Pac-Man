import React from 'react';
import TileCell from '@/ui/components/TileCell';

export interface TileGridProps {
  tilesData: number[][];
  tileTypes?: Record<number, string>;
  className?: string;
}

const TileGrid: React.FC<TileGridProps> = ({ 
  tilesData, 
  tileTypes,
  className = ''
}) => {
  return (
    <div className={`grid gap-1 ${className}`}>
      {tilesData.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <TileCell 
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              rowIndex={rowIndex}
              colIndex={colIndex}
              tileTypes={tileTypes}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TileGrid;
