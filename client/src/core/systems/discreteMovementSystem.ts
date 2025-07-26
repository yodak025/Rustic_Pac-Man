import useECSStore from '../../state/useECSStore';
import { Direction } from '@custom-types/gameComponents';
import type { Position, MovementTimer, DirectionComponent } from '@custom-types/gameComponents';
import type { Entity } from '@custom-types/gameEntities';
import usePacmanStore from '@/state/usePacmanStore';

export function movementSystem(deltaTime: number): void {
  const setPosition = usePacmanStore.getState().pacman.actions.setPosition;
  const incrementMovementTimer = usePacmanStore.getState().pacman.actions.incrementMovementTimer;
  const entities: Entity[]  = []
  entities.push(usePacmanStore.getState().pacman);
  entities.forEach(entity => {
    const position = entity.components.position as Position;
    const movementTimer = entity.components.movementTimer as MovementTimer;
    const direction = entity.components.direction as Direction;

    // Check if entity has all required components
    if (!position || !movementTimer || !direction) {
      return;
    }


    // Check if elapsed time is greater than interval
    if (incrementMovementTimer(deltaTime)) {
      // Subtract interval from elapsed
      console.log(`Moving entity ${entity.id} with direction ${direction}`);
      // Check direction component and move if not stopped
      if (direction !== Direction.STOP) {
        switch (direction) {
          case Direction.UP:
            setPosition({ x: position.x, y: position.y - 1 } as Position);
            break;
          case Direction.DOWN:
            setPosition({ x: position.x, y: position.y + 1 } as Position);
            break;
          case Direction.LEFT:
            setPosition({ x: position.x - 1, y: position.y } as Position);
            break;
          case Direction.RIGHT:
            setPosition({ x: position.x + 1, y: position.y } as Position);
            break;
        }
        console.log(`Entity ${entity.id} moved to position (${position.x}, ${position.y})`);
      }
    }

  });
}
