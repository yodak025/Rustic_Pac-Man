'use client'

import React, { useState } from 'react';
import { generateMaze } from '@/core/mazeGen';
import { usePyodide } from '@/core/hooks/usePyodide';
import useAppStateStore from '@/state/useAppStateStore';
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
      const data = await generateMaze(pyodide, 9, 5, 5);
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
    if (isPyodideLoading) {
      return (
        <div className="flex items-center justify-center h-40 w-60">
          <p className="text-xl font-mono animate-pulse text-[var(--color-primary-light)]">Loading Pyodide...</p>
        </div>
      );
    }
    
    if (pyodideError) {
      return (
        <div className="flex items-center justify-center h-40 w-60">
          <p className="text-xl font-mono text-[var(--color-alert)]">Pyodide failed to load</p>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40 w-60">
          <p className="text-xl font-mono animate-pulse text-[var(--color-primary-light)]">Generating maze...</p>
        </div>
      );
    }

    return tilesData.length > 0 ? (
      <TileGrid tilesData={tilesData} tileTypes={TILE_TYPES} />
    ) : (
      <div className="flex items-center justify-center h-40 w-60">
        <p className="text-xl font-mono text-[var(--color-text-light)]">No tiles data available</p>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text-light)] p-8">
      <div className="flex flex-col items-center w-full">
        <PageTitle size="medium">MAZE TILEMAP ANALYZER</PageTitle>
        
        {/* Description */}
        <div className="max-w-2xl text-center mb-6 font-mono">
          <p className="text-lg leading-relaxed">
            This tool allows you to visualize procedurally generated mazes
            in <span className="text-[var(--color-primary-light)] font-bold">tilemap</span> form.
            Each cell represents a different tile type in the maze matrix.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <Button
            onClick={handleGenerateTiles}
            variant="success"
            disabled={loading || isPyodideLoading || !pyodide}
          >
            GENERATE TILES
          </Button>
        </div>

      {error && (
        <div className="bg-[var(--color-alert-dark)] text-[var(--color-text-light)] p-4 mb-6 border-2 border-[var(--color-alert)] font-mono">
          {error}
        </div>
      )}

      <div className="bg-[var(--color-background)] p-6 border-4 border-[var(--color-accent)] shadow-2xl shadow-[var(--color-accent)]/30">
        <h2 className="text-2xl font-mono mb-4 text-center text-[var(--color-primary-light)]">
          Tilemap Visualization
        </h2>
        
        {renderCurrentView()}
      </div>
      
      {/* Legend */}
      <div className="mt-8 bg-[var(--color-background)] p-4 border-2 border-[var(--color-accent)] text-sm font-mono text-[var(--color-text-light)]">
        <h3 className="text-lg mb-2 underline text-[var(--color-primary-light)]">Tile Legend:</h3>
        {Object.entries(TILE_TYPES).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 bg-[var(--color-background)] border border-[var(--color-accent)]"></div>
            <span>{key}: {value}</span>
          </div>
        ))}
        </div> {/* Closing div for flex flex-col items-center w-full */}
          <Button
            onClick={goToMainMenu}
            variant="primary"
          >
            BACK TO MAIN MENU
          </Button>
      </div>
    </div>
  );
};

export default MazeTilemapAnalyzer;