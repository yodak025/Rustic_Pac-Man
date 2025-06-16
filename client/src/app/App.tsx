import GameScene from "@scenes/GameScene";
import {useGameStatusStore} from "@state/store";
import gameStatusValue from "@custom-types/gameStatusValue";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function App() {
  const { gameStatus, playGame, pauseGame, winGame, loseGame, resetGame } =
    useGameStatusStore((state) => state);

  return (
    <div className="p-5 font-sans bg-gray">
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
          onClick={playGame}
        >
          Play
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          onClick={pauseGame}
        >
          Pause
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

      {gameStatus === gameStatusValue.PLAYING ? (
        <>
          <KeyboardControls
            map={[
              { name: "forward", keys: ["ArrowUp", "w"] },
              { name: "backward", keys: ["ArrowDown", "s"] },
              { name: "left", keys: ["ArrowLeft", "a"] },
              { name: "right", keys: ["ArrowRight", "d"] },
            ]}
          >
            <Canvas
              className="bg-gradient-to-br from-stone-600 to-stone-300 "
              style={{ height: "60vh" }}
              camera={{ position: [0, 30, 0], rotation: [Math.PI / 2, 0, 0] }}
            >
              <GameScene />
            </Canvas>
          </KeyboardControls>
        </>
      ) : (
        <div className="p-4 bg-gray- rounded text-center">
          <p className="text-gray-600">
            Game is not currently active. Please start the game to see the
            scene.
          </p>
        </div>
      )}
    </div>
  );
}
