import {
  Direction,
  GhostBehaviorMode,
} from "@custom-types/gameComponents";
import type { GameWorld } from "@core/GameWorld";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decideGhostDirection(ghost: any, gameWorld?: GameWorld): void {
  if (!gameWorld) {
    console.error('[ghostDirectionDecider] GameWorld is required');
    return;
  }

  const { x: ghx, y: ghy } = ghost.components.position;
  const { x: tx, y: ty } = ghost.components.behavior.target.position;
  
  const isWallAt = (x: number, y: number): boolean => {
    return gameWorld.isWallAt(x, y);
  };
  
  const isHouseTileAt = (x: number, y: number): boolean => {
    return gameWorld.isHouseAt(x, y);
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
