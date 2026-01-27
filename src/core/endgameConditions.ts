import useGameStatusStore  from '@state/useGameStatusStore';
import useMazeState from '@state/useMazeStore';
import usePacmanStore from '@/state/usePacmanStore';
import { USE_ECS_MAZE, USE_ECS_PACMAN } from '@config/featureFlags';
import type { GameWorld } from './GameWorld';

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
  
  // Check Pacman health (Fase 3 will migrate this to GameWorld)
  if (USE_ECS_PACMAN && gameWorld) {
    // TODO: Phase 3 - read from GameWorld
    // const pacmanHealth = gameWorld.getComponent(PACMAN_ID, ComponentType.Health);
    // if (pacmanHealth && pacmanHealth.value <= 0) victoryStatus = false;
  } else {
    if (pacmanState.components.health.value <= 0) {
      victoryStatus = false;
    }
  }
  
  if (victoryStatus !== undefined) {
    gameStatusState.setGameOverStatus(victoryStatus);
  }
}