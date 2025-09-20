import { useState, useEffect } from "react"
import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import { useGameStatusStore } from "@state/store";

export default function DebugBar() {
  const [debugBar, setDebugBarState] = useState(true);

  const gameStatus = useGameStatusStore((state) => state.status);
  
  // Pacman store subscriptions
  const pacmanPosition = usePacmanStore(state => state.pacman.components.position);
  const pacmanMovementTimer = usePacmanStore(state => state.pacman.components.movementTimer);
  const pacmanDirections = usePacmanStore(state => state.pacman.components.directions);
  const pacmanHealth = usePacmanStore(state => state.pacman.components.health);
  
  // Pacman actions
  const setPacmanPosition = usePacmanStore(state => state.pacman.actions.setPosition);
  const setPacmanMovementInterval = usePacmanStore(state => state.pacman.actions.setMovementTimerInterval);
  const setPacmanHealth = usePacmanStore(state => state.pacman.actions.setHealth);

  // Ghost store subscriptions - Blinky
  const blinkyPosition = useGhostsStore(state => state.blinky.components.position);
  const blinkyMovementTimer = useGhostsStore(state => state.blinky.components.movementTimer);
  const blinkyDirections = useGhostsStore(state => state.blinky.components.directions);
  const blinkyBehaviorMode = useGhostsStore(state => state.blinky.components.behavior.mode);
  const blinkyBehaviorTicks = useGhostsStore(state => state.blinky.components.behavior.ticks);
  const blinkyTargetPosition = useGhostsStore(state => state.blinky.components.behavior.target.position);
  
  // Ghost store subscriptions - Pinky
  const pinkyPosition = useGhostsStore(state => state.pinky.components.position);
  const pinkyMovementTimer = useGhostsStore(state => state.pinky.components.movementTimer);
  const pinkyDirections = useGhostsStore(state => state.pinky.components.directions);
  const pinkyBehaviorMode = useGhostsStore(state => state.pinky.components.behavior.mode);
  const pinkyBehaviorTicks = useGhostsStore(state => state.pinky.components.behavior.ticks);
  const pinkyTargetPosition = useGhostsStore(state => state.pinky.components.behavior.target.position);

  // Ghost store subscriptions - Inky
  const inkyPosition = useGhostsStore(state => state.inky.components.position);
  const inkyMovementTimer = useGhostsStore(state => state.inky.components.movementTimer);
  const inkyDirections = useGhostsStore(state => state.inky.components.directions);
  const inkyBehaviorMode = useGhostsStore(state => state.inky.components.behavior.mode);
  const inkyBehaviorTicks = useGhostsStore(state => state.inky.components.behavior.ticks);
  const inkyTargetPosition = useGhostsStore(state => state.inky.components.behavior.target.position);

  // Ghost store subscriptions - Clyde
  const clydePosition = useGhostsStore(state => state.clyde.components.position);
  const clydeMovementTimer = useGhostsStore(state => state.clyde.components.movementTimer);
  const clydeDirections = useGhostsStore(state => state.clyde.components.directions);
  const clydeBehaviorMode = useGhostsStore(state => state.clyde.components.behavior.mode);
  const clydeBehaviorTicks = useGhostsStore(state => state.clyde.components.behavior.ticks);
  const clydeTargetPosition = useGhostsStore(state => state.clyde.components.behavior.target.position);
  
  // Ghost actions
  const setBlinkyPosition = useGhostsStore(state => state.blinky.actions.setPosition);
  const setBlinkyMovementInterval = useGhostsStore(state => state.blinky.actions.setMovementTimerInterval);
  const setPinkyPosition = useGhostsStore(state => state.pinky.actions.setPosition);
  const setPinkyMovementInterval = useGhostsStore(state => state.pinky.actions.setMovementTimerInterval);
  const setInkyPosition = useGhostsStore(state => state.inky.actions.setPosition);
  const setInkyMovementInterval = useGhostsStore(state => state.inky.actions.setMovementTimerInterval);
  const setClydePosition = useGhostsStore(state => state.clyde.actions.setPosition);
  const setClydeMovementInterval = useGhostsStore(state => state.clyde.actions.setMovementTimerInterval);

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

  const formatDirections = (directions: Array<any>) => {
    if (!directions || directions.length === 0) return 'None';
    if (directions.length === 1) return directions[0];
    return directions.join(', ');
  };

  return debugBar && (
    <div className="fixed left-0 top-0 bottom-0 z-60 p-4 border-r border-red-600 bg-black bg-opacity-20 text-red-600 text-sm w-60 backdrop-blur-sm overflow-y-auto">
      <div className="mb-4">
      <h3 className="font-bold border-b border-red-600 pb-1">Debug Panel</h3>
      </div>

      <details className="mb-3" open>
      <summary className="font-medium cursor-pointer hover:text-red-400">Game Status</summary>
      <div className="pl-2 mt-1">
        <p>{`Value: ${gameStatus}`}</p>
      </div>
      </details>
      
      <details className="mb-3" open>
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

        <p className="text-xs">{`Direction: ${formatDirections(pacmanDirections)}`}</p>

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
      
      <details className="mb-3" open>
      <summary className="font-medium cursor-pointer hover:text-red-400">Ghosts</summary>
      <div className="pl-2 mt-1">
        <details className="mb-2" open>
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

          <p className="text-xs">{`Direction: ${formatDirections(blinkyDirections)}`}</p>
          <p className="text-xs">{`Mode: ${blinkyBehaviorMode}`}</p>
          <p className="text-xs">{`Ticks: ${blinkyBehaviorTicks}`}</p>
          <p className="text-xs">{`Target: x=${blinkyTargetPosition?.x || 0}, y=${blinkyTargetPosition?.y || 0}`}</p>
        </div>
        </details>

        <details className="mb-2" open>
        <summary className="font-medium cursor-pointer hover:text-red-300 text-xs">Pinky</summary>
        <div className="pl-2 mt-1 space-y-2">
          <details className="mb-2">
            <summary className="text-xs cursor-pointer hover:text-red-200">{`Position: x=${pinkyPosition.x}, y=${pinkyPosition.y}`}</summary>
            <div className="pl-2 mt-1">
              <input
                type="text"
                placeholder="x,y"
                className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange(setPinkyPosition, e.currentTarget.value, 'position');
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </details>

          <details className="mb-2">
            <summary className="text-xs cursor-pointer hover:text-red-200">{`Movement Timer: interval=${pinkyMovementTimer.interval}, elapsed=${pinkyMovementTimer.elapsed.toFixed(2)}`}</summary>
            <div className="pl-2 mt-1">
              <input
                type="number"
                placeholder="interval"
                className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange(setPinkyMovementInterval, e.currentTarget.value, 'number');
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </details>

          <p className="text-xs">{`Direction: ${formatDirections(pinkyDirections)}`}</p>
          <p className="text-xs">{`Mode: ${pinkyBehaviorMode}`}</p>
          <p className="text-xs">{`Ticks: ${pinkyBehaviorTicks}`}</p>
          <p className="text-xs">{`Target: x=${pinkyTargetPosition?.x || 0}, y=${pinkyTargetPosition?.y || 0}`}</p>
        </div>
        </details>

        <details className="mb-2" open>
        <summary className="font-medium cursor-pointer hover:text-red-300 text-xs">Inky</summary>
        <div className="pl-2 mt-1 space-y-2">
          <details className="mb-2">
            <summary className="text-xs cursor-pointer hover:text-red-200">{`Position: x=${inkyPosition.x}, y=${inkyPosition.y}`}</summary>
            <div className="pl-2 mt-1">
              <input
                type="text"
                placeholder="x,y"
                className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange(setInkyPosition, e.currentTarget.value, 'position');
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </details>

          <details className="mb-2">
            <summary className="text-xs cursor-pointer hover:text-red-200">{`Movement Timer: interval=${inkyMovementTimer.interval}, elapsed=${inkyMovementTimer.elapsed.toFixed(2)}`}</summary>
            <div className="pl-2 mt-1">
              <input
                type="number"
                placeholder="interval"
                className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange(setInkyMovementInterval, e.currentTarget.value, 'number');
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </details>

          <p className="text-xs">{`Direction: ${formatDirections(inkyDirections)}`}</p>
          <p className="text-xs">{`Mode: ${inkyBehaviorMode}`}</p>
          <p className="text-xs">{`Ticks: ${inkyBehaviorTicks}`}</p>
          <p className="text-xs">{`Target: x=${inkyTargetPosition?.x || 0}, y=${inkyTargetPosition?.y || 0}`}</p>
        </div>
        </details>

        <details className="mb-2" open>
        <summary className="font-medium cursor-pointer hover:text-red-300 text-xs">Clyde</summary>
        <div className="pl-2 mt-1 space-y-2">
          <details className="mb-2">
            <summary className="text-xs cursor-pointer hover:text-red-200">{`Position: x=${clydePosition.x}, y=${clydePosition.y}`}</summary>
            <div className="pl-2 mt-1">
              <input
                type="text"
                placeholder="x,y"
                className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange(setClydePosition, e.currentTarget.value, 'position');
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </details>

          <details className="mb-2">
            <summary className="text-xs cursor-pointer hover:text-red-200">{`Movement Timer: interval=${clydeMovementTimer.interval}, elapsed=${clydeMovementTimer.elapsed.toFixed(2)}`}</summary>
            <div className="pl-2 mt-1">
              <input
                type="number"
                placeholder="interval"
                className="w-full px-2 py-1 text-xs bg-black bg-opacity-50 border border-red-600 rounded text-red-400 placeholder-red-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange(setClydeMovementInterval, e.currentTarget.value, 'number');
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </details>

          <p className="text-xs">{`Direction: ${formatDirections(clydeDirections)}`}</p>
          <p className="text-xs">{`Mode: ${clydeBehaviorMode}`}</p>
          <p className="text-xs">{`Ticks: ${clydeBehaviorTicks}`}</p>
          <p className="text-xs">{`Target: x=${clydeTargetPosition?.x || 0}, y=${clydeTargetPosition?.y || 0}`}</p>
        </div>
        </details>
      </div>
      </details>
    </div>
  );
}
