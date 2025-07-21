import useECSStore from '../../state/useECSStore';
import { Direction } from '../../state/components';
import type { Playable, DirectionComponent } from '../../state/components';

interface KeyState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}

export function playerControlSystem(keyState: KeyState, entityIds: string[]): void {
  const { getEntity, setEntity } = useECSStore.getState();

  entityIds.forEach(id => {
    const entity = getEntity(id);
    if (!entity) return;

    const playable = entity.components.playable as Playable;
    const directionComponent = entity.components.direction as DirectionComponent;

    // Check if entity has required components and is playable
    if (!playable || !playable.value || !directionComponent) {
      return;
    }

    // Determine direction based on key state
    let newDirection = Direction.STOP;

    if (keyState.w) {
      newDirection = Direction.UP;
    } else if (keyState.s) {
      newDirection = Direction.DOWN;
    } else if (keyState.a) {
      newDirection = Direction.LEFT;
    } else if (keyState.d) {
      newDirection = Direction.RIGHT;
    }

    // Update direction component
    directionComponent.direction = newDirection;

    // Update the entity in the store
    setEntity(entity);
  });
}
