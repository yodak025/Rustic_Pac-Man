import GameScene from "@scenes/GameScene";
import useGameState from "@state/store";

export default function App() {

  const { gameStatus, startGame, pauseGame, resumeGame, winGame, loseGame, resetGame } = useGameState(state => state);
  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-5">Game State Test Interface</h1>
      
      <div className="mb-5 p-4 border border-gray-300 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Current State:</h3>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(gameStatus, null, 2)}
      </pre>
      </div>

      <div className="flex gap-3 flex-wrap mb-5">
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={startGame}
      >
        Start Game
      </button>
      <button 
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        onClick={pauseGame}
      >
        Pause Game
      </button>
      <button 
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        onClick={resumeGame}
      >
        Resume Game
      </button>
      <button 
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        onClick={winGame}
      >
        Win
      </button>
      <button 
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        onClick={loseGame}
      >
        Lose
      </button>
      <button 
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        onClick={resetGame}
      >
        Reset Game
      </button>
      </div>

      <GameScene />
    </div>
  );
}