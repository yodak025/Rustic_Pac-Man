import GameScene from "@/scenes/GameScene";
import {useGameStatusStore, usePacmanState, useTilemapState, useGhostsState} from "@state/store";
import gameStatusValue from "@custom-types/gameStatusValue";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function App() {
  const { status: gameStatus, setStatus, score, reStartGame} =
    useGameStatusStore((state) => state);

  const {lives, reStart: reStartPacman} = usePacmanState((state) => state);
  const tilemap = useTilemapState((state) => state);
  const ghosts = useGhostsState((state) => state);

  return (
    <div className="p-5 font-sans bg-gray">
      <h1 className="text-2xl font-bold mb-5">Game State Test Interface</h1>

      <div className="mb-5 p-4 border border-gray-300 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Current State:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(gameStatus, null, 2)}
        </pre>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(score, null, 2)}
        </pre>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(lives, null, 2)}
        </pre>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(tilemap.pacDots, null, 2)}
        </pre>
      </div>

      <div className="flex gap-3 flex-wrap mb-5">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => {
            if (gameStatus === gameStatusValue.NOT_STARTED) setStatus(gameStatusValue.GENERATING_MAZE);
            else if (gameStatus === gameStatusValue.PAUSED) setStatus(gameStatusValue.PLAYING);
          }
        }
        >
          Play
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          onClick={() => setStatus(gameStatusValue.PAUSED)}
        >
          Pause
        </button>
        
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          onClick={() => {
            reStartGame(); // Reset game status
            reStartPacman(); // Reset
            tilemap.reStart(); // Reset tilemap
            ghosts.reStart(); // Reset ghosts
            setStatus(gameStatusValue.NOT_STARTED); // Set game status to NOT_STARTED
          }}
        >
          Restart Game
        </button>
      </div>

      {gameStatus !== gameStatusValue.NOT_STARTED ? (
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
              className="bg-gradient-to-br from-stone-800 to-stone-600 "
              style={{ height: "60vh" }}
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
