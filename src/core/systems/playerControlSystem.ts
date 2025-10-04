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
  const directions = usePacmanStore.getState().pacman.components.directions;
  const entities: Entity[] = [];
  entities.push(usePacmanStore.getState().pacman);

  entities.forEach((entity) => {
    const playable = entity.components.playable as Playable;
    const directionComponent = entity.components.directions as DirectionComponent;

    // Check if entity has required components and is playable
    if (!playable || !playable.value || !directionComponent) {
      return;
    }
    const inputDirections: Array<Direction> = [];
    if (keyState.w) {
      inputDirections.push(Direction.UP);
    }
    if (keyState.s) {
      inputDirections.push(Direction.DOWN);
    }
    if (keyState.a) {
      inputDirections.push(Direction.LEFT);
    }
    if (keyState.d) {
      inputDirections.push(Direction.RIGHT);
    }
    // Create directionsBuffer with common directions between inputDirections and directions
    // Preserving the order from directions
    const followDirection = directions[0]; // Get the first direction to follow
    const directionsBuffer: Array<Direction> = directions.filter((dir: Direction) => 
      inputDirections.includes(dir)
    );

    // Filter out directions that are now in directionsBuffer
    const filteredInputDirections = inputDirections.filter(
      dir => !directionsBuffer.includes(dir)
    );

    clearDirections(); // Clear previous directions

    // Add directions from directionsBuffer in reverse order
    for (let i = directionsBuffer.length - 1; i >= 0; i--) {
      addDirection(directionsBuffer[i]);
    }

    if (filteredInputDirections.length === 0 && !directionsBuffer.includes(followDirection)) {
      addDirection(followDirection);
      return;
    }

    // Add remaining directions from filteredInputDirections in normal order
    for (let i = 0; i < filteredInputDirections.length; i++) {
      addDirection(filteredInputDirections[i]);
    }

  });
}
