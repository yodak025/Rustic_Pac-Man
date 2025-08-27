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
  const clearDirections = usePacmanStore.getState().pacman.actions.clearDirections;
  const addDirection = usePacmanStore.getState().pacman.actions.addDirection; //! Implementación sesgada 
  const entities: Entity[] = [];
  entities.push(usePacmanStore.getState().pacman);

  entities.forEach((entity) => {
    const playable = entity.components.playable as Playable;
    const directionComponent = entity.components.directions as DirectionComponent;

    // Check if entity has required components and is playable
    if (!playable || !playable.value || !directionComponent) {
      return;
    }
    clearDirections(); // Clear previous directions

    if (keyState.w) {
      addDirection(Direction.UP);
    } if (keyState.s) {
      addDirection(Direction.DOWN);
    } if (keyState.a) {
      addDirection(Direction.LEFT);
    } if (keyState.d) {
      addDirection(Direction.RIGHT);
    }
  });
}
