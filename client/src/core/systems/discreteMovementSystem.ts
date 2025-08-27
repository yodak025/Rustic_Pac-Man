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

  const entities: Entity[] = [];
  entities.push(usePacmanStore.getState().pacman);
  entities.push(useGhostsStore.getState().blinky);
  entities.forEach((entity) => {
    const position = entity.components.position as Position;
    const movementTimer = entity.components.movementTimer as MovementTimer;
    const directions = entity.components.directions as Array<Direction>;

    // Check if entity has all required components
    if (!position || !movementTimer || !directions) {
      return;
    }

    const isTimeToMove = entity.actions.isTimeToMove;
    const incrementMovementTimer = entity.actions.incrementMovementTimer;

    if (!isTimeToMove(deltaTime)) { // Check if elapsed time is greater than interval
      incrementMovementTimer(deltaTime)
      return;
    }
    if (directions.length === 0) {
      //! ALTAMENTE ACOPLADO Y MUY FRAGIL
      // TODO - Me sangran los ojos
      return; //? Esto evita que se ejecute el incrementMovementTimer, dejando a pacman ready para el siguiente movimiento
      //? Esto evita el input lag a costa de renunciar a todo atisbo de cordura en el desarrollo.
    }
    directions.forEach((direction) => {
      const setPosition = entity.actions.setPosition;
      
      // Subtract interval from elapsed
      // Check direction component and move if not stopped
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
    });
    incrementMovementTimer(deltaTime);
  });
}
