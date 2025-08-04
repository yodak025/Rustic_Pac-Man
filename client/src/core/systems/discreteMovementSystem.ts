import { Direction } from "@custom-types/gameComponents";
import type {
  Position,
  MovementTimer,
  DirectionComponent,
} from "@custom-types/gameComponents";
import type { Entity } from "@custom-types/gameEntities";
import usePacmanStore from "@/state/usePacmanStore";
import useMazeState from "@/state/useMazeStore";
import useGhostsStore from "@/state/useGhostsStore";

const askForMovement = (
  position: Position,
  onValidMove: (position: Position) => void
): void => {
  const { x, y } = position;
  if (useMazeState.getState().isWallAt({ x, y })) {
    return;
  }
  onValidMove({ x, y });
};

export function movementSystem(deltaTime: number): void {
  if (
    useGhostsStore.getState().blinky.components.elapsed + deltaTime <
    useGhostsStore.getState().blinky.components.interval
  ) {
    return;
  }

  const entities = []; //! Esto es un Lazy Any porque Entity no sabe lo que son sus actions
  entities.push(usePacmanStore.getState().pacman);
  entities.push(useGhostsStore.getState().blinky);
  entities.forEach((entity) => {
    const position = entity.components.position as Position;
    const movementTimer = entity.components.movementTimer as MovementTimer;
    const direction = entity.components.direction as Direction;

    // Check if entity has all required components
    if (!position || !movementTimer || !direction) {
      return;
    }
    const setPosition = entity.actions.setPosition;
    const incrementMovementTimer = entity.actions.incrementMovementTimer;
    const isTimeToMove = entity.actions.isTimeToMove;

    // Check if elapsed time is greater than interval
    if (isTimeToMove(deltaTime)) {
      
      // Subtract interval from elapsed
      console.log(`Moving entity ${entity.id} with direction ${direction}`);
      // Check direction component and move if not stopped
      if (direction !== Direction.STOP) {
        switch (direction) {
          case Direction.UP:
            askForMovement(
              { x: position.x, y: position.y - 1 },
              (newPosition) => {
                setPosition(newPosition);
                //TODO - Por qué pasas un callback? define la función dentro, KISS
              }
            );
            break;
          case Direction.DOWN:
            askForMovement(
              { x: position.x, y: position.y + 1 },
              (newPosition) => {
                setPosition(newPosition);
              }
            );
            break;
          case Direction.LEFT:
            askForMovement(
              { x: position.x - 1, y: position.y },
              (newPosition) => {
                setPosition(newPosition);
              }
            );
            break;
          case Direction.RIGHT:
            askForMovement(
              { x: position.x + 1, y: position.y },
              (newPosition) => {
                setPosition(newPosition);
              }
            );
            break;
        }
        console.log(
          `Entity ${entity.id} moved to position (${position.x}, ${position.y})`
        );
      }
      
    }
    incrementMovementTimer(deltaTime)
  });
}
