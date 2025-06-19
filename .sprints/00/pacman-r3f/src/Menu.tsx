import React from 'react';

interface MenuProps {
  setGameStarted: (started: boolean) => void;
}



const Menu: React.FC<MenuProps> = ({ setGameStarted }) => {
  const [columns, setColumns] = React.useState(5);
  const [rows, setRows] = React.useState(8);
  const [maxFigureSize, setMaxFigureSize] = React.useState(5);
  const [generateNewMaze, setGenerateNewMaze] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const setClassicPacman = () => {
    setColumns(5);
    setRows(8);
    setMaxFigureSize(5);
  };

  const setProposedLayer = () => {
    setColumns(5);
    setRows(32);
    setMaxFigureSize(5);
  };

  const generateMaze = async () => {
    try {
      setIsGenerating(true);
      console.log("Generating new maze...");

      const generateResponse = await fetch(
        "/generation-endpoint/create-maze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cols: columns,
            rows: rows,
            "max-figure-size": maxFigureSize,
          }),
        }
      );

      if (!generateResponse.ok) {
        throw new Error("Failed to generate maze");
      }

      console.log("Maze generated successfully");
      return true;
    } catch (error) {
      console.error("Error generating maze:", error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGame = async () => {
    if (generateNewMaze) {
      const success = await generateMaze();
      if (success) {
        setGameStarted(true);
      }
    } else {
      setGameStarted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-6">
      <div className="bg-gray-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/20 p-8 max-w-md w-full">
        <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 via-lime-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
          PACMAN
        </h1>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-cyan-100 font-medium">
                Número de columnas:
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={columns}
                onChange={(e) => setColumns(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-900/80 border border-cyan-500/50 rounded-lg text-cyan-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-cyan-100 font-medium">
                Número de filas:
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-900/80 border border-cyan-500/50 rounded-lg text-cyan-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-cyan-100 font-medium">
                Tamaño máximo de figura:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxFigureSize}
                onChange={(e) => setMaxFigureSize(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-900/80 border border-cyan-500/50 rounded-lg text-cyan-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3"> 
            <button 
              onClick={setClassicPacman}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-cyan-100 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg border border-cyan-500/30 hover:border-lime-400/50"
            >
              Pacman Clásico
            </button>
            <button 
              onClick={setProposedLayer}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-cyan-100 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg border border-cyan-500/30 hover:border-lime-400/50"
            >
              Layer Propuesto
            </button>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-900/50 rounded-lg border border-cyan-500/20">
            <input
              type="checkbox"
              checked={generateNewMaze}
              onChange={(e) => setGenerateNewMaze(e.target.checked)}
              className="w-5 h-5 text-lime-400 bg-gray-800 border-cyan-500 rounded focus:ring-lime-400 focus:ring-2"
            />
            <label className="text-cyan-100 font-medium">
              Generar nuevo laberinto al iniciar
            </label>
          </div>

          <button 
            onClick={handleStartGame}
            disabled={isGenerating}
            className={`w-full py-4 font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
              isGenerating 
                ? 'bg-gray-700 cursor-not-allowed text-gray-400 border border-gray-600' 
                : 'bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-300 hover:to-green-400 text-gray-900 shadow-lime-400/25'
            }`}
          >
            {isGenerating ? "Generating..." : "Start Game"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;