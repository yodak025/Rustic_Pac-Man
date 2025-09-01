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
import useGameStatusStore from "@/state/useGameStatusStore";

export function movementSystem(deltaTime: number): void {
  if (
    useGhostsStore.getState().blinky.components.elapsed + deltaTime <
    useGhostsStore.getState().blinky.components.interval
  ) {
    return;
  }

  const askForMovement = (position: Position, entity: Entity): void => {
    const setPosition = entity.actions.setPosition;
    if (useMazeState.getState().isWallAt(position)) {
      return;
    }
    setPosition(position);

    const collectable = useMazeState.getState().findCollectableAt(position);
    if (collectable) {
      if (collectable=="pacDot") {
        useMazeState.getState().removePacDot(position);
        useGameStatusStore.getState().incrementScore(100);

      }
    }
  };

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

    if (!isTimeToMove(deltaTime)) {
      // Check if elapsed time is greater than interval
      incrementMovementTimer(deltaTime);
      return;
    }
    if (directions.length === 0) {
      //! ALTAMENTE ACOPLADO Y MUY FRAGIL
      // TODO - Me sangran los ojos
      return; //? Esto evita que se ejecute el incrementMovementTimer, dejando a pacman ready para el siguiente movimiento
      //? Esto evita el input lag a costa de renunciar a todo atisbo de cordura en el desarrollo.
    }
    directions.forEach((direction) => {
      // Subtract interval from elapsed
      // Check direction component and move if not stopped
      switch (direction) {
        case Direction.UP:
          askForMovement({ x: position.x, y: position.y - 1 }, entity);
          break;
        case Direction.DOWN:
          askForMovement({ x: position.x, y: position.y + 1 }, entity);
          break;
        case Direction.LEFT:
          askForMovement({ x: position.x - 1, y: position.y }, entity);
          break;
        case Direction.RIGHT:
          askForMovement({ x: position.x + 1, y: position.y }, entity);
          break;
      }
    });
    incrementMovementTimer(deltaTime);
  });
}
