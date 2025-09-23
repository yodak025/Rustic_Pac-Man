import usePacmanStore from "@/state/usePacmanStore";
import {
  Direction,
  GhostBehaviorMode,
  TargetKind,
} from "@custom-types/gameComponents";

import * as config from "@/config/ghostBehavior.json";

import useGameStatusStore from "@/state/useGameStatusStore";

const {
  HOME: HOUSE_POSITION,
  EXIT_HOME: EXIT_POSITION,
  SCATTER: SCATTER_TARGET,
} = config.DEFAULT_POSITIONS;

const CHANGE = config.MODE_CHANGE_SCHEMA;

export function manageBehaviorMode(
  ghost: any,
  chaseCallback: () => void
): boolean {
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
        const levelId = useGameStatusStore.getState().level - 1; // Zero-based index
        ghost.actions.setBehaviorTicks(
          Math.round(
            CHANGE[levelId].CHASE.SECONDS /
              (ghost.components.movementTimer.interval / 1000)
          )
        );
      }
      return true;
    case GhostBehaviorMode.SCATTER:
      if (ghost.components.behavior.ticks <= 0) {
        // Time to consider switching to CHASE
        const levelId = useGameStatusStore.getState().level - 1; // Zero-based index
        const isChange = CHANGE[levelId].CHASE.PROBABILITY;
        ghost.actions.setBehaviorMode(
          isChange ? GhostBehaviorMode.CHASE : GhostBehaviorMode.SCATTER
        );
        ghost.actions.setBehaviorTarget({
          kind: isChange ? TargetKind.PLAYER : TargetKind.TILE,
          position: isChange
            ? usePacmanStore.getState().pacman.components.position
            : SCATTER_TARGET[
                ghost.components.behavior.kind as keyof typeof SCATTER_TARGET
              ],
        });
        ghost.actions.setBehaviorTicks(
          Math.round(
            (isChange
              ? CHANGE[levelId].CHASE.SECONDS
              : CHANGE[levelId].SCATTER.SECONDS) /
              (ghost.components.movementTimer.interval / 1000)
          )
        );
      } else {
        ghost.actions.setBehaviorTicks(ghost.components.behavior.ticks - 1); //[TODO] create a decrement action
      }
      return true;
    case GhostBehaviorMode.CHASE:
      if (ghost.components.behavior.ticks <= 0) {
        // Time to consider switching to CHASE
        const levelId = useGameStatusStore.getState().level - 1; // Zero-based index
        const isChange = CHANGE[levelId].SCATTER.PROBABILITY;
        ghost.actions.setBehaviorMode(
          isChange ? GhostBehaviorMode.SCATTER : GhostBehaviorMode.CHASE
        );
        ghost.actions.setBehaviorTarget({
          kind: isChange ? TargetKind.PLAYER : TargetKind.TILE,
          position: isChange
            ? SCATTER_TARGET[
                ghost.components.behavior.kind as keyof typeof SCATTER_TARGET
              ]
            : usePacmanStore.getState().pacman.components.position,
        });
        ghost.actions.setBehaviorTicks(
          Math.round(
            (isChange
              ? CHANGE[levelId].SCATTER.SECONDS
              : CHANGE[levelId].CHASE.SECONDS) /
              (ghost.components.movementTimer.interval / 1000)
          )
        );
      } else {
        chaseCallback();
        ghost.actions.setBehaviorTicks(ghost.components.behavior.ticks - 1); //[TODO] create a decrement action
      }

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
