import useMazeState from "@/state/useMazeStore";
import {
  Direction,
  GhostBehaviorMode,
} from "@custom-types/gameComponents";
import { USE_ECS_MAZE } from "@config/featureFlags";
import type { GameWorld } from "@core/GameWorld";

export function decideGhostDirection(ghost: any, gameWorld?: GameWorld): void {
  const { x: ghx, y: ghy } = ghost.components.position;
  const { x: tx, y: ty } = ghost.components.behavior.target.position;
  
  // Use GameWorld if ECS flag is enabled, otherwise use legacy store
  const isWallAt = (x: number, y: number): boolean => {
    return USE_ECS_MAZE && gameWorld
      ? gameWorld.isWallAt(x, y)
      : useMazeState.getState().isWallAt({ x, y });
  };
  
  const isHouseTileAt = (x: number, y: number): boolean => {
    return USE_ECS_MAZE && gameWorld
      ? gameWorld.isHouseAt(x, y)
      : useMazeState.getState().isHouseTileAt({ x, y });
  };
  
  const directions = ghost.components.directions as Array<Direction>;
  const clearDirections = ghost.actions.clearDirections;
  const addDirection = ghost.actions.addDirection;

  // Ghost decides direction based on target position
  // Chooses the direction with the shortest Euclidean distance to target
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
        !isWallAt(move.x, move.y) &&
        !(
          ghost.components.behavior.mode !==
            GhostBehaviorMode.EXITING_HOUSE &&
          ghost.components.behavior.mode !== GhostBehaviorMode.FRIGHTENED &&
          isHouseTileAt(move.x, move.y)
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
}
