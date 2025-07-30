import { Direction } from "@custom-types/gameComponents";
import type {
  DirectionComponent,
  Playable,
} from "@custom-types/gameComponents";
import usePacmanStore from "@/state/usePacmanStore";
import type { Entity } from "@custom-types/gameEntities";
interface KeyState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}

export function playerControlSystem(keyState: KeyState): void {
  const setDirection = usePacmanStore.getState().pacman.actions.setDirection; //! Implementación sesgada 
  const entities: Entity[] = [];
  entities.push(usePacmanStore.getState().pacman);

  entities.forEach((entity) => {
    const playable = entity.components.playable as Playable;
    const directionComponent = entity.components
      .direction as DirectionComponent;

    // Check if entity has required components and is playable
    if (!playable || !playable.value || !directionComponent) {
      return;
    }

    if (keyState.w) {
      setDirection(Direction.UP);
    } else if (keyState.s) {
      setDirection(Direction.DOWN);
    } else if (keyState.a) {
      setDirection(Direction.LEFT);
    } else if (keyState.d) {
      setDirection(Direction.RIGHT);
    } else {
      setDirection(Direction.STOP);
    }
  });
}
