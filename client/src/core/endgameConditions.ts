import useGameStatusStore  from '@state/useGameStatusStore';
import useMazeState from '@state/useMazeStore';
import usePacmanStore from '@/state/usePacmanStore';
import { c } from 'node_modules/vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf';

export default function endgameConditions() {
  const gameStatusState = useGameStatusStore.getState();
  const mazeState = useMazeState.getState();
  const pacmanState = usePacmanStore.getState().pacman;
  let victoryStatus: boolean | undefined = undefined

  if (mazeState.maze.info.pacdots.current >= mazeState.maze.info.pacdots.total) {
    victoryStatus = true
  }
  if (pacmanState.components.health.value <= 0) {
    victoryStatus = false
  }
  if (victoryStatus !== undefined) {
    gameStatusState.setGameOverStatus(victoryStatus)
  }

}