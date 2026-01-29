import { Direction } from "@custom-types/gameComponents";
import {
  type Position,
  type MovementTimer,
} from "@custom-types/gameComponents";
import type { Entity } from "@custom-types/gameEntities";
import usePacmanStore from "@/state/usePacmanStore";
import useMazeState from "@/state/useMazeStore";
import useGhostsStore from "@/state/useGhostsStore";
import { USE_ECS_MAZE, USE_ECS_PACMAN } from "@config/featureFlags";
import type { GameWorld } from "@core/GameWorld";

import { collectSystem } from "./collectSystem";

export function movementSystem(deltaTime: number, gameWorld?: GameWorld): void {
  if (
    useGhostsStore.getState().blinky.components.elapsed + deltaTime <
    useGhostsStore.getState().blinky.components.interval
  ) {
    return;
  }

  const askForMovement = (position: Position, entity: Entity): boolean => {
    const setPosition = entity.actions.setPosition;
    
    // Use GameWorld if ECS flag is enabled, otherwise use legacy store
    const isWall = USE_ECS_MAZE && gameWorld
      ? gameWorld.isWallAt(position.x, position.y)
      : useMazeState.getState().isWallAt(position);
    
    if (isWall) {
      return false;
    }
    
    const isHouse = USE_ECS_MAZE && gameWorld
      ? gameWorld.isHouseAt(position.x, position.y)
      : useMazeState.getState().isHouseTileAt(position);
    
    if (isHouse && entity.id === "pacman") {
      return false;
    }
    
    setPosition(position);
    collectSystem(position, entity, gameWorld);
    return true;
  };

  const entities: Entity[] = [];
  
  // Phase 3: Only add Pacman if ECS is not enabled
  if (!USE_ECS_PACMAN) {
    entities.push(usePacmanStore.getState().pacman);
  }
  
  // Always add ghosts (Phase 4 will migrate them)
  entities.push(useGhostsStore.getState().blinky);
  entities.push(useGhostsStore.getState().pinky);
  entities.push(useGhostsStore.getState().inky);
  entities.push(useGhostsStore.getState().clyde);
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
    entity.actions.setLastPosition(position); // Update lastPosition before moving
    if (directions.length === 0 && entity.id === "pacman") {
      //! ALTAMENTE ACOPLADO Y MUY FRAGIL
      // TODO - Me sangran los ojos
      return; //? Esto evita que se ejecute el incrementMovementTimer, dejando a pacman ready para el siguiente movimiento
      //? Esto evita el input lag a costa de renunciar a todo atisbo de cordura en el desarrollo.
    }
    let moved = false;
    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];

      if (moved) {
        break; // If movement succeeded, break the loop
      }
      
      switch (direction) {
        case Direction.UP:
          moved = askForMovement({ x: position.x, y: position.y - 1 }, entity);
          continue;
        case Direction.DOWN:
          moved = askForMovement({ x: position.x, y: position.y + 1 }, entity);
          continue;
        case Direction.LEFT:
          if (position.x == 1) {
            //! [DELETE]: TELEPORTACION
            moved = askForMovement({ x: 30, y: position.y }, entity);
          } else {
            moved = askForMovement({ x: position.x - 1, y: position.y }, entity);
          }
          continue;
        case Direction.RIGHT:
          if (position.x == 30) {
            //! [DELETE]: TELEPORTACION
            moved = askForMovement({ x: 1, y: position.y }, entity);
          } else {
            moved = askForMovement({ x: position.x + 1, y: position.y }, entity);
          }
          continue;
      }
      
      // Otherwise, continue to the next direction
    }
    incrementMovementTimer(deltaTime);
  });
}
