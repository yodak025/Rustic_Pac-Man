import usePacmanStore from "@/state/usePacmanStore";
import {
  Direction,
  GhostBehaviorMode,
  TargetKind,
} from "@custom-types/gameComponents";

import * as config from "@/config/ghostBehavior.json";
const {
  HOME: HOUSE_POSITION,
  EXIT_HOME: EXIT_POSITION,
  SCATTER: SCATTER_TARGET,
} = config.DEFAULT_POSITIONS;

export function manageBehaviorMode(ghost: any, chaseCallback: () => void): boolean {
  const { x: ghx, y: ghy } = ghost.components.position;
  const { x: tx, y: ty } = ghost.components.behavior.target.position;
  const clearDirections = ghost.actions.clearDirections;

  switch (ghost.components.behavior.mode) {
    case GhostBehaviorMode.HOUSE:
      if (ghost.components.behavior.ticks <= 0) {
        ghost.actions.setBehaviorMode(GhostBehaviorMode.EXITING_HOUSE);
        ghost.actions.setBehaviorTarget({
          kind: TargetKind.TILE,
          position:
            EXIT_POSITION[
              ghost.components.behavior.kind as keyof typeof EXIT_POSITION
            ],
        });
      } else {
        ghost.actions.setBehaviorTicks(ghost.components.behavior.ticks - 1); //[TODO] create a decrement action
        return false; // Stay in house until ticks run out
      }
      return true;
    case GhostBehaviorMode.EXITING_HOUSE:
      if (ghx === tx && ghy === ty) {
        ghost.actions.setBehaviorMode(GhostBehaviorMode.CHASE);
        ghost.actions.setBehaviorTarget({
          kind: TargetKind.PLAYER,
          position: usePacmanStore.getState().pacman.components.position,
        });
      }
      return true;
    case GhostBehaviorMode.SCATTER:
      // Logic for scatter behavior (not implemented here)
      return true;
    case GhostBehaviorMode.CHASE:
      chaseCallback();
      return true;
    case GhostBehaviorMode.FRIGHTENED:
      if (
        ghost.components.position.x ==
          EXIT_POSITION[
            ghost.components.behavior.kind as keyof typeof EXIT_POSITION
          ].x &&
        ghost.components.position.y ==
          EXIT_POSITION[
            ghost.components.behavior.kind as keyof typeof EXIT_POSITION
          ].y
      ) {
        ghost.actions.setBehaviorMode(GhostBehaviorMode.FRIGHTENED);
        ghost.actions.setBehaviorTarget({
          kind: TargetKind.HOUSE,
          position:
            HOUSE_POSITION[
              ghost.components.behavior.kind as keyof typeof HOUSE_POSITION
            ],
        });
        ghost.actions.addDirection(Direction.DOWN);
        return false; // Keep moving down until out of the house
      } else if (
        ghost.components.position.x ==
          HOUSE_POSITION[
            ghost.components.behavior.kind as keyof typeof HOUSE_POSITION
          ].x &&
        ghost.components.position.y ==
          HOUSE_POSITION[
            ghost.components.behavior.kind as keyof typeof HOUSE_POSITION
          ].y
      ) {
        ghost.actions.setBehaviorMode(GhostBehaviorMode.HOUSE);
        ghost.actions.setBehaviorTarget({
          kind: TargetKind.HOUSE,
          position:
            HOUSE_POSITION[
              ghost.components.behavior.kind as keyof typeof HOUSE_POSITION
            ],
        });
        clearDirections();
        ghost.actions.setBehaviorTicks(15); //[IMPROVEMENT] Hardcoded ticks in the house. Could be JSON config, could be randomized.
        return false;
      }
      return true;
    case GhostBehaviorMode.EATEN:
      return false;
    default:
      throw `The GhostBehaviorMode '${ghost.components.behavior.mode}' is not recognized in ghostBehaviorSystem`;
  }
}
