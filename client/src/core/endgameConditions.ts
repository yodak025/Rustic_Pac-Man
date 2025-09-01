import useGameStatusStore  from '@state/useGameStatusStore';
import useMazeState from '@state/useMazeStore';
import usePacmanStore from '@/state/usePacmanStore';

export default function endgameConditions() {
  const gameStatusState = useGameStatusStore.getState();
  const mazeState = useMazeState.getState();
  const pacmanState = usePacmanStore.getState().pacman;
  let victoryStatus: boolean | undefined = undefined

  //! Condición de victoria cutre provisional: 60% de pacdots. Recuerda cambiarlo en el HUD
  if (mazeState.maze.info.pacdots.current >= Math.floor(mazeState.maze.info.pacdots.total*0.6)) {
    victoryStatus = true
  }
  if (pacmanState.components.health.value <= 0) {
    victoryStatus = false
  }
  if (victoryStatus !== undefined) {
    gameStatusState.setGameOverStatus(victoryStatus)
  }

}