import { useState, useEffect } from "react";


// TODO -  Implementar modo para visualizar el contenido del Maze store también en ASCII
export default function MazeViewer() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [mazeData, setMazeData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderMaze = () => {
    if (isLoading) {
      return <p>Loading maze data...</p>;
    }

    if (error) {
      return <p className="text-red-500">Error: {error}</p>;
    }

    if (!mazeData || mazeData.length === 0) {
      return <p>No maze data available</p>;
    }

    // Convert numbers to characters for better visualization
    const tileMap: Record<number, string> = {
      0: "·", // Empty space
      1: "#", // Wall
      2: "P", // Player
      3: "G", // Ghost
      4: "○", // Pellet
      // Add more mappings as needed
    };

    // Assuming mazeData is a 1D array that represents a 2D grid
    // We need to determine the width of the grid
    // This is a simple example assuming a square maze
    // Assuming mazeData is an array of strings, where each string represents a row of numbers
    let mazeText = "";
    
    for (let i = 0; i < mazeData.length; i++) {
      const row = String(mazeData[i]).split('').filter(char => !isNaN(parseInt(char)));
      
      for (let j = 0; j < row.length; j++) {
      const tileValue = parseInt(row[j]);
      mazeText += tileMap[tileValue] || tileValue.toString(); // Fallback to number if no mapping
      }
      
      mazeText += "\n"; // Add a line break after each row
    }

    return (
      <pre className="font-mono text-xs leading-tight tracking-tighter whitespace-pre">
      {mazeText}
      </pre>
    );
  };

  return sidebarVisible && (
    <div className="fixed left-0 top-0 bottom-0 z-50 p-4 border-r border-green-600 bg-black bg-opacity-20 text-green-600 text-sm w-60 backdrop-blur-sm overflow-y-auto">
      <div className="mb-4">
        <h3 className="font-bold border-b border-green-600 pb-1">Maze Viewer</h3>
      </div>
      
      <div className="pl-2 mt-1">
        {renderMaze()}
      </div>
    </div>
  );
}