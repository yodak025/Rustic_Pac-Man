import useECSStore from '../../state/useECSStore';
import { Direction } from '../../state/components';
import type { Position, MovementTimer, DirectionComponent } from '../../state/components';

export function movementSystem(deltaTime: number, entityIds: string[]): void {
  const { getEntity, setEntity } = useECSStore.getState();

  entityIds.forEach(id => {
    const entity = getEntity(id);
    if (!entity) return;

    const position = entity.components.position as Position;
    const movementTimer = entity.components.movementTimer as MovementTimer;
    const directionComponent = entity.components.direction as DirectionComponent;

    // Check if entity has all required components
    if (!position || !movementTimer || !directionComponent) {
      return;
    }

    // Increment elapsed time by deltaTime
    movementTimer.elapsed += deltaTime;

    // Check if elapsed time is greater than interval
    if (movementTimer.elapsed > movementTimer.interval) {
      // Subtract interval from elapsed
      movementTimer.elapsed -= movementTimer.interval;

      // Check direction component and move if not stopped
      if (directionComponent.direction !== Direction.STOP) {
        switch (directionComponent.direction) {
          case Direction.UP:
            position.y -= 1;
            break;
          case Direction.DOWN:
            position.y += 1;
            break;
          case Direction.LEFT:
            position.x -= 1;
            break;
          case Direction.RIGHT:
            position.x += 1;
            break;
        }
      }
    }

    // Update the entity in the store
    setEntity(entity);
  });
}
