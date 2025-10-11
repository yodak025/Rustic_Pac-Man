import { useState, useEffect } from "react"
import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import { useGameStatusStore } from "@state/store";
import DebugEntitySection from "@/ui/common/DebugEntitySection";

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
        <DebugEntitySection
          entityName="Pacman Stats"
          position={pacmanPosition}
          movementTimer={pacmanMovementTimer}
          directions={pacmanDirections}
          health={pacmanHealth}
          onSetPosition={setPacmanPosition}
          onSetMovementInterval={setPacmanMovementInterval}
          onSetHealth={setPacmanHealth}
          open={false}
        />
      </div>
      </details>
      
      <details className="mb-3" open>
      <summary className="font-medium cursor-pointer hover:text-red-400">Ghosts</summary>
      <div className="pl-2 mt-1">
        <DebugEntitySection
          entityName="Blinky"
          position={blinkyPosition}
          movementTimer={blinkyMovementTimer}
          directions={blinkyDirections}
          mode={blinkyBehaviorMode}
          ticks={blinkyBehaviorTicks}
          targetPosition={blinkyTargetPosition}
          onSetPosition={setBlinkyPosition}
          onSetMovementInterval={setBlinkyMovementInterval}
          open={true}
        />

        <DebugEntitySection
          entityName="Pinky"
          position={pinkyPosition}
          movementTimer={pinkyMovementTimer}
          directions={pinkyDirections}
          mode={pinkyBehaviorMode}
          ticks={pinkyBehaviorTicks}
          targetPosition={pinkyTargetPosition}
          onSetPosition={setPinkyPosition}
          onSetMovementInterval={setPinkyMovementInterval}
          open={true}
        />

        <DebugEntitySection
          entityName="Inky"
          position={inkyPosition}
          movementTimer={inkyMovementTimer}
          directions={inkyDirections}
          mode={inkyBehaviorMode}
          ticks={inkyBehaviorTicks}
          targetPosition={inkyTargetPosition}
          onSetPosition={setInkyPosition}
          onSetMovementInterval={setInkyMovementInterval}
          open={true}
        />

        <DebugEntitySection
          entityName="Clyde"
          position={clydePosition}
          movementTimer={clydeMovementTimer}
          directions={clydeDirections}
          mode={clydeBehaviorMode}
          ticks={clydeBehaviorTicks}
          targetPosition={clydeTargetPosition}
          onSetPosition={setClydePosition}
          onSetMovementInterval={setClydeMovementInterval}
          open={true}
        />
      </div>
      </details>
    </div>
  );
}
