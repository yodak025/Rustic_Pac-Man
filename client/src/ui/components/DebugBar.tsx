import React, { useState, useEffect } from "react"
import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import { useGameStatusStore } from "@state/store";

export default function DebugBar() {
  const [debugBar, setDebugBarState] = useState(false);

  const gameStatus = useGameStatusStore((state) => state.status);
  
  // Pacman store subscriptions
  const pacmanPosition = usePacmanStore(state => state.pacman.components.position);
  const pacmanMovementTimer = usePacmanStore(state => state.pacman.components.movementTimer);
  const pacmanDirection = usePacmanStore(state => state.pacman.components.direction);
  const pacmanHealth = usePacmanStore(state => state.pacman.components.health);
  
  // Pacman actions
  const setPacmanPosition = usePacmanStore(state => state.pacman.actions.setPosition);
  const setPacmanMovementInterval = usePacmanStore(state => state.pacman.actions.setMovementTimerInterval);
  const setPacmanHealth = usePacmanStore(state => state.pacman.actions.setHealth);

  // Ghost store subscriptions
  const blinkyPosition = useGhostsStore(state => state.blinky.components.position);
  const blinkyMovementTimer = useGhostsStore(state => state.blinky.components.movementTimer);
  const blinkyDirection = useGhostsStore(state => state.blinky.components.direction);
  
  // Ghost actions
  const setBlinkyPosition = useGhostsStore(state => state.blinky.actions.setPosition);
  const setBlinkyMovementInterval = useGhostsStore(state => state.blinky.actions.setMovementTimerInterval);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '#') {
        setDebugBarState(prevState => !prevState);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputChange = (setter: (value: any) => void, value: string, type: 'number' | 'position') => {
    if (type === 'number') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setter(numValue);
      }
    } else if (type === 'position') {
      const [x, y] = value.split(',').map(v => parseFloat(v.trim()));
      if (!isNaN(x) && !isNaN(y)) {
        setter({ x, y });
      }
    }
  };

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
      <div className="pl-2 mt-1 space-y-2">
        <details className="mb-2">
          <summary className="text-xs cursor-pointer hover:text-red-300">{`Position: x=${pacmanPosition.x}, y=${pacmanPosition.y}`}</summary>
          <div className="pl-2 mt-1">
            <input
              type="text"
              placeholder="x,y"
              className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInputChange(setPacmanPosition, e.currentTarget.value, 'position');
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </details>

        <details className="mb-2">
          <summary className="text-xs cursor-pointer hover:text-red-300">{`Movement Timer: interval=${pacmanMovementTimer.interval}, elapsed=${pacmanMovementTimer.elapsed.toFixed(2)}`}</summary>
          <div className="pl-2 mt-1">
            <input
              type="number"
              placeholder="interval"
              className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInputChange(setPacmanMovementInterval, e.currentTarget.value, 'number');
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </details>

        <p className="text-xs">{`Direction: ${pacmanDirection}`}</p>

        <details className="mb-2">
          <summary className="text-xs cursor-pointer hover:text-red-300">{`Health: ${pacmanHealth.value}`}</summary>
          <div className="pl-2 mt-1">
            <input
              type="number"
              placeholder="health"
              min="0"
              className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInputChange(setPacmanHealth, e.currentTarget.value, 'number');
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </details>
      </div>
      </details>
      
      <details className="mb-3">
      <summary className="font-medium cursor-pointer hover:text-red-400">Ghosts</summary>
      <div className="pl-2 mt-1">
        <details className="mb-2">
        <summary className="font-medium cursor-pointer hover:text-red-300 text-xs">Blinky</summary>
        <div className="pl-2 mt-1 space-y-2">
          <details className="mb-2">
            <summary className="text-xs cursor-pointer hover:text-red-200">{`Position: x=${blinkyPosition.x}, y=${blinkyPosition.y}`}</summary>
            <div className="pl-2 mt-1">
              <input
                type="text"
                placeholder="x,y"
                className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange(setBlinkyPosition, e.currentTarget.value, 'position');
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </details>

          <details className="mb-2">
            <summary className="text-xs cursor-pointer hover:text-red-200">{`Movement Timer: interval=${blinkyMovementTimer.interval}, elapsed=${blinkyMovementTimer.elapsed.toFixed(2)}`}</summary>
            <div className="pl-2 mt-1">
              <input
                type="number"
                placeholder="interval"
                className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange(setBlinkyMovementInterval, e.currentTarget.value, 'number');
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </details>

          <p className="text-xs">{`Direction: ${blinkyDirection}`}</p>
        </div>
        </details>
      </div>
      </details>
    </div>
  );
}
