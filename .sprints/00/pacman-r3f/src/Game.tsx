import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Pacman, {type PacmanRef} from "./components/Pacman.tsx";
import Maze from "./components/Maze.tsx";
import PacDots, { type PacDotsRef } from "./components/PacDots.tsx";
import { level1Map, playerStartPosition } from "./data/level1.ts";
import Ghost from "./components/Ghost.tsx";
import React, { useEffect, useState } from "react";

export default function Game() {
  // Asegurar que la posición del jugador sea del tipo [number, number, number]
  const position: [number, number, number] = playerStartPosition as [
    number,
    number,
    number,
  ];
  const pacmanRef = React.useRef<PacmanRef>(null);
  const pacDotsRef = React.useRef<PacDotsRef>(null);
  const [mazeMap, setMazeMap] = useState<number[][]>(level1Map);
  const [mazeLoaded, setMazeLoaded] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [score, setScore] = useState(0);

  const handlePacDotConsumed = (position: [number, number]) => {
    setScore((prev) => prev + 10);
    console.log(`Pac-dot consumed at [${position[0]}, ${position[1]}]`);
  };

  const handleAllPacDotsConsumed = () => {
    setGameState("won");
    console.log("Game won! All pac-dots consumed");
  };

  const handleDead = () => {
    setGameState("lost");
    console.log("Game lost! Pacman is dead");
  }

  const loadMaze = async () => {
    try {
      console.log("Fetching maze from server...");

      let response = await fetch("/generation-endpoint/get-tiles");

      if (response.status === 400) {
        console.log("No maze available, generating new one...");
        const generateResponse = await fetch(
          "/generation-endpoint/create-maze",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cols: 5,
              rows: 16,
              "max-figure-size": 5,
            }),
          }
        );

        if (!generateResponse.ok) {
          throw new Error("Failed to generate maze");
        }

        // Repetir la petición inicial después de generar el laberinto
        response = await fetch("/generation-endpoint/get-tiles");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch maze");
      }

      const data = await response.json();

      // Verificar que la respuesta contiene un number[][]
      if (
        Array.isArray(data) &&
        data.every(
          (row) =>
            Array.isArray(row) && row.every((cell) => typeof cell === "number")
        )
      ) {
        console.log("Received maze:", data);
        setMazeMap(data);
        setMazeLoaded(true);
      } else {
        throw new Error("Invalid maze format received");
      }
    } catch (error) {
      console.error("Error loading maze:", error);
      // Fallback al mapa por defecto en caso de error
      console.log("Using fallback maze");
      setMazeMap(level1Map);
    } finally {
      setMazeLoaded(true);
    }
  };
  useEffect(() => {
    loadMaze();
  }, []);
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {!mazeLoaded && (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-gray-800/90 backdrop-blur-lg border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 p-8 text-center">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent mb-4">
        Generating maze...
        </h3>
        <p className="text-cyan-100">This may take a few seconds</p>
        <div className="mt-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
        </div>
      </div>
      )}

      {/* Game Over Screen */}
      {gameState !== "playing" && (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-gray-800/90 backdrop-blur-lg border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 p-8 text-center max-w-md w-full mx-4">
        <h2 className="text-4xl font-bold mb-4">
        {gameState === "won" ? (
          <span className="bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent">
          🎉 You Won!
          </span>
        ) : (
          <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
          💀 Game Over
          </span>
        )}
        </h2>
        <p className="text-xl text-cyan-100 mb-6">Final Score: <span className="text-lime-400 font-bold">{score}</span></p>
        <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-300 hover:to-green-400 text-gray-900 font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-lime-400/25 border border-lime-400/50"
        >
        Play Again
        </button>
      </div>
      )}

      {mazeLoaded && gameState === "playing" && (
      <>
        {/* Game UI */}
        <div className="absolute top-6 left-6 z-[1000] bg-gray-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-4 shadow-lg shadow-cyan-500/10">
        <div className="space-y-2 text-cyan-100 font-medium">
          <div className="flex items-center gap-2">
          <span className="text-lime-400">Score:</span>
          <span className="text-xl font-bold text-white">{score}</span>
          </div>
          <div className="flex items-center gap-2">
          <span className="text-cyan-400">Remaining Dots:</span>
          <span className="text-lg font-bold text-white">{pacDotsRef.current?.getRemainingCount() || 0}</span>
          </div>
          <div className="flex items-center gap-2">
          <span className="text-red-400">Lives:</span>
          <span className="text-lg font-bold text-white">{pacmanRef.current?.lives || 'Loading...'}</span>
          </div>
        </div>
        </div>

        {/* Game Canvas */}
        <Canvas id="game-canvas" style={{ width: "100vw", height: "100vh" }}>
        <PerspectiveCamera
          makeDefault
          position={[mazeMap[0].length / 2, 18, mazeMap.length + 2]}
          fov={75}
          near={0.1}
          far={1000}
        />

        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls
          target={[mazeMap[0].length / 2, 0, mazeMap.length / 2]}
        />
        <Maze map={mazeMap} wallHeight={0.5} />

        <PacDots
          mazeMap={mazeMap}
          onPacDotConsumed={handlePacDotConsumed}
          onAllConsumed={handleAllPacDotsConsumed}
          ref={pacDotsRef}
        />

        <Pacman
          position={position}
          radius={0.4}
          color="yellow"
          sphereResolution={32}
          ref={pacmanRef}
          pacDotsRef={pacDotsRef}
          onPacmanIsDead={handleDead}
        />
        <Ghost
          position={[14.5, 1, 14.5]}
          pacmanRef={pacmanRef}
          type="red"
          mazeMap={mazeMap}
        />
        <Ghost
          position={[14.5, 1, 10.5]}
          pacmanRef={pacmanRef}
          type="blue"
          mazeMap={mazeMap}
        />
        <Ghost
          position={[10.5, 1, 14.5]}
          pacmanRef={pacmanRef}
          type="pink"
          mazeMap={mazeMap}
        />
        <Ghost
          position={[10.5, 1, 10.5]}
          pacmanRef={pacmanRef}
          type="orange"
          mazeMap={mazeMap}
        />
        </Canvas>
      </>
      )}
    </div>
  );
}
