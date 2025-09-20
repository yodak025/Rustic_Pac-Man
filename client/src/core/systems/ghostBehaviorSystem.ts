import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import useMazeState from "@/state/useMazeStore";
import { Direction } from "@custom-types/gameComponents";

import {
  GhostBehaviorMode,
  GhostBehaviorKind,
  TargetKind,
} from "@custom-types/gameComponents";

import * as config from "@/config/ghostBehavior.json";
const {
  HOME: HOUSE_POSITION,
  EXIT_HOME: EXIT_POSITION,
  SCATTER: SCATTER_POSITIONS,
} = config.DEFAULT_POSITIONS;

export function ghostBehaviorSystem(deltaTime: number): void {
  
  const ghosts = useGhostsStore.getState().actions.getGhosts();
  // Process each ghost
  ghosts.forEach((ghost) => {
    
    const isTimeToMove = ghost.actions.isTimeToMove(deltaTime);
    console.log(`deltaTime: ${deltaTime} for ${ghost.components.behavior.kind}. El valor de isTimeToMove es ${isTimeToMove}. Elapsed: ${ghost.components.movementTimer.elapsed}, Interval: ${ghost.components.movementTimer.interval}`);
    // Skip if it's not time for this ghost to move
    if (!isTimeToMove) {
      return
    }
    // [ERROR HANDLING] Remenber to check the props and its values
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
          console.log(`Initial Ghost ${ghost.components.behavior.kind} in house, ticks left: ${ghost.components.behavior.ticks}`);
          ghost.actions.setBehaviorTicks(ghost.components.behavior.ticks - 1); //[TODO] create a decrement action
          return; // Stay in house until ticks run out
        }
        break;
      case GhostBehaviorMode.EXITING_HOUSE:
        if (ghx === tx && ghy === ty) {
          ghost.actions.setBehaviorMode(GhostBehaviorMode.CHASE);
          ghost.actions.setBehaviorTarget({
            kind: TargetKind.PLAYER,
            position: usePacmanStore.getState().pacman.components.position,
          });
        }
        break;
      case GhostBehaviorMode.SCATTER:
        // Logic for scatter behavior (not implemented here)
        break;
      case GhostBehaviorMode.CHASE:
        switch (ghost.components.behavior.kind) {
          case GhostBehaviorKind.BLINKY:
            ghost.actions.setBehaviorTarget({
              kind: TargetKind.PLAYER,
              position: usePacmanStore.getState().pacman.components.position,
            });
            break;
          case GhostBehaviorKind.PINKY:
            // Target 4 tiles ahead of Pacman's current direction
            const pacman = usePacmanStore.getState().pacman;
            const pacPos = pacman.components.position;
            const pacDir = pacman.components.directions[0]; // [WARNING] It depends on the horrible input management currently implemented. Be careful if you change it.
            let targetPos = { x: pacPos.x, y: pacPos.y };
            switch (pacDir) {
              case Direction.UP:
                targetPos.y -= 4;
                break;
              case Direction.DOWN:
                targetPos.y += 4;
                break;
              case Direction.LEFT:
                targetPos.x -= 4;
                break;
              case Direction.RIGHT:
                targetPos.x += 4;
                break;
            }
            ghost.actions.setBehaviorTarget({
              kind: TargetKind.PLAYER,
              position: targetPos,
            });
            break;
          case GhostBehaviorKind.CLYDE:
            // If Clyde is more than 8 tiles away from Pacman, target Pacman
            // If within 8 tiles, target his scatter corner (bottom-left)
            const pac = usePacmanStore.getState().pacman;
            const pacPosition = pac.components.position;
            const distance = Math.sqrt(
              Math.pow(ghx - pacPosition.x, 2) +
                Math.pow(ghy - pacPosition.y, 2)
            );
            if (distance > 8) {
              ghost.actions.setBehaviorTarget({
                kind: TargetKind.PLAYER,
                position: pacPosition,
              });
            } else {
              ghost.actions.setBehaviorTarget({
                kind: TargetKind.PLAYER,
                position: { x: 0, y: 34 },
              });
            }
            break;
          case GhostBehaviorKind.INKY:
            // Target is determined by a point 2 tiles ahead of Pacman and
            // a vector from Blinky to that point, doubled.
            const pacmanInky = usePacmanStore.getState().pacman;
            const pacPosInky = pacmanInky.components.position;
            const pacDirInky = pacmanInky.components.directions[0]; // [WARNING] It depends on the horrible input management currently implemented. Be careful if you change it.
            let intermediatePos = { x: pacPosInky.x, y: pacPosInky.y };
            switch (pacDirInky) {
              case Direction.UP:
                intermediatePos.y -= 2;
                break;
              case Direction.DOWN:
                intermediatePos.y += 2;
                break;
              case Direction.LEFT:
                intermediatePos.x -= 2;
                break;
              case Direction.RIGHT:
                intermediatePos.x += 2;
                break;
            }
            const blinky = useGhostsStore.getState().blinky;
            const blinkyPos = blinky.components.position;
            const vectorX = intermediatePos.x - blinkyPos.x;
            const vectorY = intermediatePos.y - blinkyPos.y;
            const targetX = intermediatePos.x + vectorX;
            const targetY = intermediatePos.y + vectorY;
            ghost.actions.setBehaviorTarget({
              kind: TargetKind.PLAYER,
              position: { x: targetX, y: targetY },
            });
            break;
        }

        break;
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
          return; // Keep moving down until out of the house
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
          return
        }
        break;
      case GhostBehaviorMode.EATEN:
        return;
      default:
        throw `The GhostBehaviorMode '${ghost.components.behavior.mode}' is not recognized in ghostBehaviorSystem`;
    }
    console.log(`Deciding direction for ${ghost.components.behavior.kind} in mode ${ghost.components.behavior.mode}`);
    const isWallAt = useMazeState.getState().isWallAt;
    const isHouseTileAt = useMazeState.getState().isHouseTileAt;
    const directions = ghost.components.directions as Array<Direction>;

    const addDirection = ghost.actions.addDirection;

    const decide = () => {
      // Ghost decides direction based on Pacman's position
      // Chooses the direction with the shortest Euclidean distance to Pacman
      // while avoiding reversing direction

      const currentDirection = directions[0];
      const oppositeDirections = {
        [Direction.UP]: Direction.DOWN,
        [Direction.DOWN]: Direction.UP,
        [Direction.LEFT]: Direction.RIGHT,
        [Direction.RIGHT]: Direction.LEFT,
      };

      // Possible moves and their coordinates
      const moves = [
        { dir: Direction.RIGHT, x: ghx + 1, y: ghy },
        { dir: Direction.LEFT, x: ghx - 1, y: ghy },
        { dir: Direction.DOWN, x: ghx, y: ghy + 1 },
        { dir: Direction.UP, x: ghx, y: ghy - 1 },
      ];

      // Filter valid moves and calculate distances
      const candidates = moves
        .filter(
          (move) =>
            move.dir !== oppositeDirections[currentDirection] &&
            !isWallAt({ x: move.x, y: move.y }) &&
            !(
              ghost.components.behavior.mode !==
                GhostBehaviorMode.EXITING_HOUSE &&
              ghost.components.behavior.mode !== GhostBehaviorMode.FRIGHTENED &&
              isHouseTileAt({ x: move.x, y: move.y })
            ) // Ghosts (except when exiting) cannot enter house tiles
        )
        .map((move) => ({
          direction: move.dir,
          distance: Math.sqrt(
            Math.pow(move.x - tx, 2) + Math.pow(move.y - ty, 2)
          ),
        }));

      clearDirections();

      if (candidates.length > 0) {
        // Find direction with minimum distance
        const bestMove = candidates.reduce(
          (min, current) => (current.distance < min.distance ? current : min),
          candidates[0]
        );

        addDirection(bestMove.direction);
      }
    };

    decide();
  });
}