import React, { useEffect, useState } from 'react';
import { loadMaze } from '@/services/api';

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

const MazeTilemapAnalyzer: React.FC = () => {
  const [mazeData, setMazeData] = useState<number[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaze = async () => {
      try {
        setLoading(true);
        const data = await loadMaze();
        if (data) {
          setMazeData(data);
        } else {
          setError('Failed to load maze data');
        }
      } catch (err) {
        setError('Error fetching maze: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchMaze();
  }, []);

  const renderMazeTile = (value: number, rowIndex: number, colIndex: number) => {
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
        title={`${TILE_TYPES[value as keyof typeof TILE_TYPES] || 'Unknown'} (${value})`}
      >
        <span className="text-xs text-white font-mono">{value}</span>
      </div>
    );
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadMaze();
      if (data) {
        setMazeData(data);
      } else {
        setError('Failed to load maze data');
      }
    } catch (err) {
      setError('Error refreshing maze: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-400 p-8">
      <h1 className="text-4xl font-bold mb-6 text-yellow-400 font-mono tracking-wider">
        MAZE TILEMAP ANALYZER
      </h1>
      
      <div className="mb-6">
        <button
          onClick={handleRefresh}
          className="px-6 py-3 bg-yellow-400 text-black font-mono font-bold text-lg border-4 border-yellow-400 hover:bg-black hover:text-yellow-400 transition-all duration-200 shadow-xl shadow-yellow-400/50 uppercase tracking-wide"
          disabled={loading}
        >
          {loading ? 'LOADING...' : 'GENERATE NEW MAZE'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 text-yellow-400 p-4 mb-6 border-2 border-red-500 font-mono">
          {error}
        </div>
      )}

      <div className="bg-gray-900 p-6 border-4 border-yellow-400 shadow-2xl shadow-yellow-400/30">
        <h2 className="text-2xl font-mono mb-4 text-center">Tilemap Visualization</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-40 w-60">
            <p className="text-xl font-mono animate-pulse">Loading maze...</p>
          </div>
        ) : mazeData.length > 0 ? (
          <div className="grid gap-1">
            {mazeData.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => renderMazeTile(cell, rowIndex, colIndex))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 w-60">
            <p className="text-xl font-mono">No maze data available</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-gray-900 p-4 border-2 border-yellow-400 text-sm font-mono">
        <h3 className="text-lg mb-2 underline">Tile Legend:</h3>
        {Object.entries(TILE_TYPES).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <div className={`w-4 h-4 ${getBgColor(parseInt(key))}`}></div>
            <span>{key}: {value}</span>
          </div>
        ))}
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