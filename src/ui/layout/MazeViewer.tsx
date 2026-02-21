'use client'

import { useState, useEffect } from "react";
import GlassPanel from "@/ui/components/GlassPanel";


export default function MazeViewer() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [mazeData, setMazeData] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  
  useEffect(() => {
    const fetchMaze = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/generation-endpoint/get-tiles");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setMazeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMaze();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '@') {
        setSidebarVisible(prevState => !prevState);
      }
      
      // Zoom controls when sidebar is visible
      if (sidebarVisible) {
        if (event.key === '+' || event.key === '=') {
          event.preventDefault();
          setScale(prev => Math.min(prev + 0.1, 3.0));
        } else if (event.key === '-' || event.key === '_') {
          event.preventDefault();
          setScale(prev => Math.max(prev - 0.1, 0.3));
        } else if (event.key === '0') {
          event.preventDefault();
          setScale(1.0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarVisible]);

  const renderMaze = () => {
    if (isLoading) {
      return <p className="text-[var(--color-text-main)]">Loading maze data...</p>;
    }

    if (error) {
      return <p className="text-[var(--color-alert)]">Error: {error}</p>;
    }

    if (!mazeData || mazeData.length === 0) {
      return <p className="text-[var(--color-text-main)]">No maze data available</p>;
    }

    // Tile mapping according to Python generator
    const tileMap: Record<string, string> = {
      "0": ".",   // Path
      "1": "|",   // Vertical wall
      "2": "o",   // Power pellet
      "3": "-",   // Tunnel
      "-2": "_", // Horizontal wall
      "-3": "h", // Ghost house
      "-4": "d", // Door
      "-1": "?", // Unknown
    };

    // Render 2D array directly
    const mazeText = mazeData
      .map(row => 
        row.map(tile => tileMap[tile.toString()] || "?").join("")
      )
      .join("\n");

    const rows = mazeData.length;
    const cols = mazeData[0]?.length || 0;
    
    // Calculate font size based on scale
    // Use em units to avoid border growth issues
    const fontSize = `${scale}em`;
    const lineHeight = scale;

    return (
      <div className="space-y-2">
        <div className="text-xs text-[var(--color-text-dim)] font-mono">
          <div>Size: {rows} × {cols}</div>
          <div>Scale: {scale.toFixed(1)}x</div>
          <div className="text-[var(--color-accent)]">
            +/- to zoom | 0 to reset
          </div>
        </div>
        
        <div 
          className="overflow-auto border border-[var(--color-accent-dim)] rounded"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          <pre 
            className="font-mono leading-none tracking-[0] whitespace-pre text-[var(--color-text-main)] p-2 select-text"
            style={{ 
              fontSize,
              lineHeight,
            }}
          >
            {mazeText}
          </pre>
        </div>
      </div>
    );
  };

  return sidebarVisible && (
    <GlassPanel
      variant="heavy"
      insetShadow="lg"
      className="fixed left-0 top-0 bottom-0 z-50 p-4 border-r-2 border-[var(--color-accent)] text-[var(--color-text-main)] text-sm overflow-hidden flex flex-col w-[600px]"
    >
      <div className="mb-4 flex-shrink-0">
        <h3 className="font-bold font-mono text-[var(--color-accent)] border-b border-[var(--color-accent)] pb-1 tracking-wider">
          MAZE VIEWER
        </h3>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {renderMaze()}
      </div>
    </GlassPanel>
  );
}