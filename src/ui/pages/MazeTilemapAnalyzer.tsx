import React, { useState } from 'react';
import { generateMaze } from '@/core/mazeGen';
import { useGameStatusStore } from '@state/store';
import PageTitle from '@/ui/components/PageTitle';
import Button from '@/ui/components/Button';
import TileGrid from '@/ui/common/TileGrid';

// Define tile types for visualization
const TILE_TYPES = {
  0: 'Pac-Dot',
  1: 'Wall',
  2: 'Power-Pellet',
  // Add more tile types as needed
};

const MazeTilemapAnalyzer: React.FC = () => {
  const [tilesData, setTilesData] = useState<number[][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const game = useGameStatusStore((state) => state);

  const handleGenerateTiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await generateMaze(9, 5, 5);
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

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40 w-60">
          <p className="text-xl font-mono animate-pulse">Loading...</p>
        </div>
      );
    }

    return tilesData.length > 0 ? (
      <TileGrid tilesData={tilesData} tileTypes={TILE_TYPES} />
    ) : (
      <div className="flex items-center justify-center h-40 w-60">
        <p className="text-xl font-mono">No tiles data available</p>
      </div>
    );
  };

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-400 p-8">
      <PageTitle size="medium">MAZE TILEMAP ANALYZER</PageTitle>
      
      {/* Description */}
      <div className="max-w-2xl text-center mb-6 font-mono">
        <p className="text-lg leading-relaxed">
          This tool allows you to visualize procedurally generated mazes
          in <span className="text-yellow-200 font-bold">tilemap</span> form.
          Each cell represents a different tile type in the maze matrix.
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="mb-6 flex gap-4">
        <Button
          onClick={handleGenerateTiles}
          variant="success"
          disabled={loading}
          className="px-4 py-2 text-sm shadow-xl shadow-green-400/30"
        >
          GENERATE TILES
        </Button>
        
        <Button
          onClick={game.reboot}
          variant="primary"
          className="px-4 py-2 text-sm shadow-xl shadow-yellow-400/30"
        >
          MAIN MENU
        </Button>
      </div>

      {error && (
        <div className="bg-red-900 text-yellow-400 p-4 mb-6 border-2 border-red-500 font-mono">
          {error}
        </div>
      )}

      <div className="bg-gray-900 p-6 border-4 border-yellow-400 shadow-2xl shadow-yellow-400/30">
        <h2 className="text-2xl font-mono mb-4 text-center">
          Tilemap Visualization
        </h2>
        
        {renderCurrentView()}
      </div>
      
      {/* Legend */}
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
};

export default MazeTilemapAnalyzer;