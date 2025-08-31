import React, { useState, useEffect } from "react"
import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import { useGameStatusStore } from "@state/store";

export default function DebugBar() {
  const [debugBar, setDebugBarState] = useState(false);

  const gameStatus = useGameStatusStore((state) => state.status);
  
  // Separar las subscripciones del store para evitar el bucle infinito
  const pacmanPosition = usePacmanStore(state => state.pacman.components.position);
  const pacmanMovementTimer = usePacmanStore(state => state.pacman.components.movementTimer);
  const pacmanDirection = usePacmanStore(state => state.pacman.components.direction);
  const pacmanHealth = usePacmanStore(state => state.pacman.components.health);

  // Ghost store subscriptions
  const blinkyPosition = useGhostsStore(state => state.blinky.components.position);
  const blinkyMovementTimer = useGhostsStore(state => state.blinky.components.movementTimer);
  const blinkyDirection = useGhostsStore(state => state.blinky.components.direction);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '3') {
        setDebugBarState(prevState => !prevState);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return debugBar && (
    <div className="fixed left-0 top-0 bottom-0 z-50 p-4 border-r border-red-600 bg-black bg-opacity-20 text-red-600 text-sm w-60 backdrop-blur-sm overflow-y-auto">
      <div className="mb-4">
      <h3 className="font-bold border-b border-red-600 pb-1">Debug Panel</h3>
      </div>

      <details className="mb-3">
      <summary className="font-medium cursor-pointer hover:text-red-400">Game Status</summary>
      <div className="pl-2 mt-1">
        <p>{`Value: ${gameStatus}`}</p>
      </div>
      </details>
      
      <details className="mb-3">
      <summary className="font-medium cursor-pointer hover:text-red-400">Pacman</summary>
      <div className="pl-2 mt-1">
        <p>{`Position: x=${pacmanPosition.x}, y=${pacmanPosition.y}`}</p>
        <p>{`Movement Timer: interval=${pacmanMovementTimer.interval}, elapsed=${pacmanMovementTimer.elapsed.toFixed(2)}`}</p>
        <p>{`Direction: ${pacmanDirection}`}</p>
        <p>{`Health: ${pacmanHealth.value}`}</p>
      </div>
      </details>
      
      <details className="mb-3">
      <summary className="font-medium cursor-pointer hover:text-red-400">Ghosts</summary>
      <div className="pl-2 mt-1">
        <details className="mb-2">
        <summary className="font-medium cursor-pointer hover:text-red-300 text-xs">Blinky</summary>
        <div className="pl-2 mt-1">
          <p>{`Position: x=${blinkyPosition.x}, y=${blinkyPosition.y}`}</p>
          <p>{`Movement Timer: interval=${blinkyMovementTimer.interval}, elapsed=${blinkyMovementTimer.elapsed.toFixed(2)}`}</p>
          <p>{`Direction: ${blinkyDirection}`}</p>
        </div>
        </details>
      </div>
      </details>
    </div>
  );
}
