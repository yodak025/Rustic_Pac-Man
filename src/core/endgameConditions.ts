import useGameStatusStore  from '@state/useGameStatusStore';
import useMazeState from '@state/useMazeStore';
import usePacmanStore from '@/state/usePacmanStore';
import { USE_ECS_MAZE, USE_ECS_PACMAN } from '@config/featureFlags';
import type { GameWorld } from './GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';

export default function endgameConditions(gameWorld?: GameWorld) {
  const gameStatusState = useGameStatusStore.getState();
  const mazeState = useMazeState.getState();
  const pacmanState = usePacmanStore.getState().pacman;
  let victoryStatus: boolean | undefined = undefined

  // Victory condition: all pac-dots collected
  // Use GameWorld if ECS flag is enabled, otherwise use legacy store
  if (USE_ECS_MAZE && gameWorld) {
    const mazeInfo = gameWorld.getMazeInfo();
    if (mazeInfo.pacDots.current >= mazeInfo.pacDots.total) {
      victoryStatus = true;
    }
  } else {
    if (mazeState.maze.info.pacDots.current >= mazeState.maze.info.pacDots.total) {
      victoryStatus = true;
    }
  }
  
  // Check Pacman health - use GameWorld if ECS flag is enabled, otherwise use legacy store
  if (USE_ECS_PACMAN && gameWorld) {
    const health = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.HEALTH);
    if (health && health.current <= 0) {
      victoryStatus = false;
    }
  } else {
    if (pacmanState.components.health.value <= 0) {
      victoryStatus = false;
    }
  }
  
  if (victoryStatus !== undefined) {
    gameStatusState.setGameOverStatus(victoryStatus);
  }
}