'use client'

import React, { useState } from 'react';
import { generateMaze, type MazeMetadata } from '@/core/mazeGen';
import { usePyodide } from '@/core/hooks/usePyodide';
import useAppStateStore from '@/state/useAppStateStore';
import PageTitle from '@/ui/components/PageTitle';
import Button from '@/ui/components/Button';

// Tile types for simplified ASCII tilemap
const TILE_TYPES: Record<string, string> = {
  '_': 'Empty',
  '.': 'Pacdot',
  '|': 'Wall',
  'c': 'Chomp (Player)',
  'x': 'Echo (Ghost)',
  'o': 'Power Pellet',
};

const MazeTilemapAnalyzer: React.FC = () => {
  const [tilesData, setTilesData] = useState<string[][]>([]);
  const [metadata, setMetadata] = useState<MazeMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tileSize, setTileSize] = useState<number>(4); // Size in pixels
  const { goToMainMenu } = useAppStateStore();
  const { pyodide, isLoading: isPyodideLoading, error: pyodideError } = usePyodide();

  const handleGenerateTiles = async () => {
    if (!pyodide) {
      setError('Pyodide not loaded yet');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Generate maze with entity placement
      const result = await generateMaze(pyodide, {
        dimensions: {
          num_layers: 4,
          layer_rows: 36,
          layer_cols: 5
        },
        tunnels: {
          entry_position: 10,
          exit_position: 25
        },
        entities: {
          ghost_ratio: 100,
          powerpellet_ratio: 60
        },
        max_figure_size: 5
      });
      
      if (result && result.tilemap && Array.isArray(result.tilemap)) {
        setTilesData(result.tilemap);
        setMetadata(result.metadata);
        console.log('Maze metadata:', result.metadata);
      } else {
        setError('Invalid tiles data format');
      }
    } catch (err) {
      setError('Error generating tiles: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const getTileColor = (value: string): string => {
    switch (value) {
      case '_': return 'bg-gray-900'; // Empty
      case '.': return 'bg-yellow-200'; // Pacdot
      case '|': return 'bg-blue-600'; // Wall
      case 'c': return 'bg-green-500'; // Chomp (player)
      case 'x': return 'bg-red-500'; // Echo (ghost)
      case 'o': return 'bg-yellow-400'; // Power pellet
      default: return 'bg-gray-500'; // Unknown
    }
  };

  const renderMazeGrid = () => {
    if (!tilesData || tilesData.length === 0) return null;

    const rows = tilesData.length;
    const cols = tilesData[0]?.length || 0;

    return (
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        {/* Info bar */}
        <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-background-dim)] border border-[var(--color-accent)] font-mono text-sm flex-shrink-0">
          <div className="text-[var(--color-text-main)]">
            Size: {rows} × {cols} tiles
            {metadata && (
              <span className="ml-4 text-[var(--color-text-dim)]">
                | Pacdots: {metadata.pacdot_count} | Power: {metadata.powerpellet_count} | Echoes: {metadata.echo_count}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-[var(--color-text-dim)]">Tile size:</span>
            <Button
              onClick={() => setTileSize(Math.max(2, tileSize - 1))}
              variant="secondary"
              disabled={tileSize <= 2}
            >
              -
            </Button>
            <span className="text-[var(--color-accent)] w-12 text-center">{tileSize}px</span>
            <Button
              onClick={() => setTileSize(Math.min(12, tileSize + 1))}
              variant="secondary"
              disabled={tileSize >= 12}
            >
              +
            </Button>
          </div>
        </div>

        {/* Scrollable maze container */}
        <div 
          className="overflow-auto border-2 border-[var(--color-accent)] bg-[var(--color-background-dim)] flex-1"
        >
          <div className="inline-block p-2">
            {tilesData.map((row, rowIndex) => (
              <div key={rowIndex} className="flex" style={{ height: `${tileSize}px` }}>
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getTileColor(cell)}
                    style={{ 
                      width: `${tileSize}px`,
                      height: `${tileSize}px`,
                    }}
                    title={`${TILE_TYPES[cell] || 'Unknown'} (${cell}) @ (${colIndex}, ${rowIndex})`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    if (isPyodideLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-xl font-mono animate-pulse text-[var(--color-accent)]">Loading Pyodide...</p>
        </div>
      );
    }
    
    if (pyodideError) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-xl font-mono text-[var(--color-alert)]">Pyodide failed to load</p>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-xl font-mono animate-pulse text-[var(--color-accent)]">Generating giant maze...</p>
        </div>
      );
    }

    return tilesData.length > 0 ? (
      renderMazeGrid()
    ) : (
      <div className="flex items-center justify-center h-40">
        <p className="text-xl font-mono text-[var(--color-text-main)]">No tiles data available</p>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col h-screen bg-[var(--color-background)] text-[var(--color-text-main)] p-8 overflow-hidden">
      <div className="flex flex-col items-center w-full max-w-[1800px] mx-auto h-full">
        <PageTitle size="medium">GIANT MAZE TILEMAP ANALYZER</PageTitle>
        
        {/* Description */}
        <div className="max-w-3xl text-center mb-4 font-mono">
          <p className="text-lg leading-relaxed">
            Visualize procedurally generated <span className="text-[var(--color-accent)] font-bold">giant mazes</span> with
            chunk-based assembly, MST connectivity, and offset correction.
            Each pixel represents a tile in the maze matrix.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mb-4 flex gap-4">
          <Button
            onClick={handleGenerateTiles}
            variant="success"
            disabled={loading || isPyodideLoading || !pyodide}
          >
            GENERATE GIANT MAZE
          </Button>
          <Button
            onClick={goToMainMenu}
            variant="primary"
          >
            BACK TO MAIN MENU
          </Button>
        </div>

        {error && (
          <div className="bg-[var(--color-alert)] text-[var(--color-text-main)] p-4 mb-4 border-2 border-[var(--color-alert)] font-mono w-full max-w-3xl">
            {error}
          </div>
        )}

        <div className="bg-[var(--color-background)] p-6 border-4 border-[var(--color-accent)] shadow-2xl shadow-[var(--color-accent)]/30 w-full flex-1 flex flex-col min-h-0">
          <h2 className="text-2xl font-mono mb-4 text-center text-[var(--color-accent)]">
            Tilemap Visualization
          </h2>
          
          {renderCurrentView()}
        </div>
        
        {/* Legend */}
        <div className="mt-4 bg-[var(--color-background)] p-4 border-2 border-[var(--color-accent)] text-sm font-mono text-[var(--color-text-main)] w-full max-w-3xl">
          <h3 className="text-lg mb-2 underline text-[var(--color-accent)]">Tile Legend:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(TILE_TYPES).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-4 h-4 ${getTileColor(key)} border border-[var(--color-accent)]`}></div>
                <span>{key}: {value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MazeTilemapAnalyzer;