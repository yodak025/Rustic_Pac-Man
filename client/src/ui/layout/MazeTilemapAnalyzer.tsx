import React, { useState } from 'react';
import { generateCells, getCells, generateTiles, getTiles } from '@/services/api';

// filepath: /home/yodak025/dev/Rustic_Pac-Man/client/src/ui/layout/MazeTilemapAnalyzer.tsx

// Define tile types for visualization
const TILE_TYPES = {
  0: 'Empty',
  1: 'Wall',
  2: 'Dot',
  3: 'PowerPellet',
  4: 'PacMan',
  // Add more tile types as needed
};

// Define cell types for visualization
interface CellData {
  id: number;
  x: number;
  y: number;
  is_filled: boolean;
  seq: number;
  group_seq: number;
  is_connected_at: boolean[];
  is_raise_height_candidate: boolean;
  is_shrink_width_candidate: boolean;
}

type ViewMode = 'tiles' | 'cells';

const MazeTilemapAnalyzer: React.FC = () => {
  const [tilesData, setTilesData] = useState<number[][]>([]);
  const [cellsData, setCellsData] = useState<CellData[][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tiles');

  const renderTilesMaze = (value: number, rowIndex: number, colIndex: number) => {
    // Define colors for different tile types
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
        key={`${rowIndex}-${colIndex}`}
        className={`${getBgColor(value)} w-8 h-8 border border-gray-900 flex items-center justify-center`}
        title={`${TILE_TYPES[value as keyof typeof TILE_TYPES] || 'Unknown'} (${value}) - Position: (${colIndex}, ${rowIndex})`}
      >
        <span className="text-xs text-white font-mono">{value}</span>
      </div>
    );
  };

  const renderCellsMaze = (cell: CellData, rowIndex: number, colIndex: number) => {
    // Define colors for different cell states
    const getBgColor = (cell: CellData) => {
      if (!cell.is_filled) return 'bg-black';
      
      // Color based on group_seq
      const colors = [
        'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600',
        'bg-purple-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600'
      ];
      return colors[cell.group_seq % colors.length] || 'bg-gray-600';
    };

    const connectionLines = [];
    if (cell.is_connected_at) {
      // UP
      if (cell.is_connected_at[0]) {
        connectionLines.push(<div key="up" className="absolute top-0 left-1/2 w-0.5 h-2 bg-white transform -translate-x-1/2"></div>);
      }
      // RIGHT
      if (cell.is_connected_at[1]) {
        connectionLines.push(<div key="right" className="absolute right-0 top-1/2 w-2 h-0.5 bg-white transform -translate-y-1/2"></div>);
      }
      // DOWN
      if (cell.is_connected_at[2]) {
        connectionLines.push(<div key="down" className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-white transform -translate-x-1/2"></div>);
      }
      // LEFT
      if (cell.is_connected_at[3]) {
        connectionLines.push(<div key="left" className="absolute left-0 top-1/2 w-2 h-0.5 bg-white transform -translate-y-1/2"></div>);
      }
    }

    return (
      <div 
        key={`${rowIndex}-${colIndex}`}
        className={`${getBgColor(cell)} w-16 h-16 border border-gray-900 flex items-center justify-center relative`}
        title={`Cell ${cell.id}: Group ${cell.group_seq}, Seq ${cell.seq}, Filled: ${cell.is_filled} - Position: (${colIndex}, ${rowIndex})`}
      >
        {connectionLines}
        <div className="text-center">
          <div className="text-xs text-white font-mono">{cell.group_seq}</div>
          <div className="text-xs text-white font-mono opacity-70">{cell.seq}</div>
        </div>
      </div>
    );
  };

  const handleGenerateCells = async () => {
    try {
      setLoading(true);
      setError(null);
      await generateCells(9, 5, 5);
      const data = await getCells();
      if (data && Array.isArray(data)) {
        setCellsData(data);
      } else {
        setError('Invalid cells data format');
      }
    } catch (err) {
      setError('Error generating cells: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGetCells = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCells();
      if (data && Array.isArray(data)) {
        setCellsData(data);
      } else {
        setError('Invalid cells data format');
      }
    } catch (err) {
      setError('Error fetching cells: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTiles = async () => {
    try {
      setLoading(true);
      setError(null);
      await generateTiles();
      const data = await getTiles();
      if (data && Array.isArray(data)) {
        setTilesData(data);
      } else {
        setError('Invalid tiles data format');
      }
    } catch (err) {
      setError('Error generating tiles: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGetTiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTiles();
      if (data && Array.isArray(data)) {
        setTilesData(data);
      } else {
        setError('Invalid tiles data format');
      }
    } catch (err) {
      setError('Error fetching tiles: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40 w-60">
          <p className="text-xl font-mono animate-pulse">Loading...</p>
        </div>
      );
    }

    if (viewMode === 'tiles') {
      return tilesData.length > 0 ? (
        <div className="grid gap-1">
          {tilesData.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => renderTilesMaze(cell, rowIndex, colIndex))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 w-60">
          <p className="text-xl font-mono">No tiles data available</p>
        </div>
      );
    } else {
      return cellsData.length > 0 ? (
        <div className="grid gap-1">
          {cellsData.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => renderCellsMaze(cell, rowIndex, colIndex))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 w-60">
          <p className="text-xl font-mono">No cells data available</p>
        </div>
      );
    }
  };

  const renderActionButtons = () => {
    if (viewMode === 'tiles') {
      return (
        <div className="flex gap-4">
          <button
            onClick={handleGenerateTiles}
            className="px-4 py-2 bg-green-600 text-white font-mono font-bold text-sm border-2 border-green-600 hover:bg-black hover:text-green-400 transition-all duration-200 shadow-xl shadow-green-400/30 uppercase tracking-wide"
            disabled={loading}
          >
            GENERATE TILES
          </button>
          <button
            onClick={handleGetTiles}
            className="px-4 py-2 bg-blue-600 text-white font-mono font-bold text-sm border-2 border-blue-600 hover:bg-black hover:text-blue-400 transition-all duration-200 shadow-xl shadow-blue-400/30 uppercase tracking-wide"
            disabled={loading}
          >
            GET TILES
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex gap-4">
          <button
            onClick={handleGenerateCells}
            className="px-4 py-2 bg-green-600 text-white font-mono font-bold text-sm border-2 border-green-600 hover:bg-black hover:text-green-400 transition-all duration-200 shadow-xl shadow-green-400/30 uppercase tracking-wide"
            disabled={loading}
          >
            GENERATE CELLS
          </button>
          <button
            onClick={handleGetCells}
            className="px-4 py-2 bg-blue-600 text-white font-mono font-bold text-sm border-2 border-blue-600 hover:bg-black hover:text-blue-400 transition-all duration-200 shadow-xl shadow-blue-400/30 uppercase tracking-wide"
            disabled={loading}
          >
            GET CELLS
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-400 p-8">
      <h1 className="text-4xl font-bold mb-6 text-yellow-400 font-mono tracking-wider">
        MAZE TILEMAP ANALYZER
      </h1>
      
      {/* View Mode Slider */}
      <div className="mb-6 flex items-center gap-4">
        <span className={`font-mono text-lg ${viewMode === 'tiles' ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
          TILES
        </span>
        <div 
          className="relative w-16 h-8 bg-gray-700 border-2 border-yellow-400 cursor-pointer"
          onClick={() => setViewMode(viewMode === 'tiles' ? 'cells' : 'tiles')}
        >
          <div 
            className={`absolute top-0 w-6 h-6 bg-yellow-400 transition-all duration-300 ${
              viewMode === 'tiles' ? 'left-1' : 'left-8'
            }`}
          ></div>
        </div>
        <span className={`font-mono text-lg ${viewMode === 'cells' ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
          CELLS
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mb-6">
        {renderActionButtons()}
      </div>

      {error && (
        <div className="bg-red-900 text-yellow-400 p-4 mb-6 border-2 border-red-500 font-mono">
          {error}
        </div>
      )}

      <div className="bg-gray-900 p-6 border-4 border-yellow-400 shadow-2xl shadow-yellow-400/30">
        <h2 className="text-2xl font-mono mb-4 text-center">
          {viewMode === 'tiles' ? 'Tilemap Visualization' : 'Cells Visualization'}
        </h2>
        
        {renderCurrentView()}
      </div>
      
      {/* Legend */}
      <div className="mt-8 bg-gray-900 p-4 border-2 border-yellow-400 text-sm font-mono">
        <h3 className="text-lg mb-2 underline">
          {viewMode === 'tiles' ? 'Tile Legend:' : 'Cell Legend:'}
        </h3>
        {viewMode === 'tiles' ? (
          Object.entries(TILE_TYPES).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 ${getBgColor(parseInt(key))}`}></div>
              <span>{key}: {value}</span>
            </div>
          ))
        ) : (
          <div>
            <div className="mb-1">• Filled cells show group number (large) and sequence (small)</div>
            <div className="mb-1">• White lines indicate connections between cells</div>
            <div className="mb-1">• Colors represent different groups</div>
            <div className="mb-1">• Black cells are empty/unfilled</div>
          </div>
        )}
      </div>
    </div>
  );

  function getBgColor(value: number) {
    switch (value) {
      case 0: return 'bg-black';
      case 1: return 'bg-blue-800';
      case 2: return 'bg-yellow-400';
      case 3: return 'bg-yellow-200';
      case 4: return 'bg-red-500';
      default: return 'bg-gray-700';
    }
  }
};

export default MazeTilemapAnalyzer;