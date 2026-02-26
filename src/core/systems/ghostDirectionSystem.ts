/**
 * Ghost Direction System
 * 
 * Decides the next movement direction for each ghost based on their target position.
 * Uses pathfinding heuristic: choose direction that minimizes Euclidean distance to target.
 * 
 * Constraints:
 * - Cannot reverse direction (no 180° turns)
 * - Cannot enter walls
 * - Cannot enter house tiles (except in EXITING_HOUSE and FRIGHTENED modes)
 * 
 * PHASE: GHOST_DIRECTION
 * RESPONSIBILITY: Path planning for ghost AI
 * 
 * @see /docs/ECS_ARCHITECTURE_DESIGN.md Section 4.2 - GhostDirectionSystem
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import { Direction, BehaviorMode } from '@custom-types/gameComponents';

/**
 * Ghost Direction System
 * 
 * Calculates the best movement direction for each ghost based on their target position.
 * Updates MovementIntent component.
 */
export function ghostDirectionSystem(gameWorld: GameWorld): void {
  // Query all ghosts with required components
  const ghostEntities = gameWorld.query(
    ComponentType.GHOST_TAG,
    ComponentType.DISCRETE_POSITION,
    ComponentType.TARGET_POSITION,
    ComponentType.CURRENT_DIRECTION,
    ComponentType.BEHAVIOR_MODE
  );

  for (const entityId of ghostEntities) {
    const position = gameWorld.getComponent(entityId, ComponentType.DISCRETE_POSITION);
    const target = gameWorld.getComponent(entityId, ComponentType.TARGET_POSITION);
    const currentDir = gameWorld.getComponent(entityId, ComponentType.CURRENT_DIRECTION);
    const behaviorMode = gameWorld.getComponent(entityId, ComponentType.BEHAVIOR_MODE);

    if (!position || !target || !currentDir || !behaviorMode) {
      console.error(`[ghostDirectionSystem] Missing components for entity ${entityId}`);
      continue;
    }

    const { x: ghostX, y: ghostY } = position;
    const { x: targetX, y: targetY } = target;
    const mode = behaviorMode.mode;

    // Don't update direction for EATEN ghosts or ghosts in HOUSE (not moving)
    if (mode === BehaviorMode.EATEN || mode === BehaviorMode.HOUSE) {
      gameWorld.setComponent(entityId, ComponentType.MOVEMENT_INTENT, { direction: null });
      continue;
    }

    // Get opposite direction (cannot reverse)
    const oppositeDirection = getOppositeDirection(currentDir.direction);

    // Evaluate all 4 possible directions
    const candidates: Array<{ direction: Direction; distance: number }> = [];

    const moves = [
      { dir: Direction.UP, x: ghostX, y: ghostY - 1 },
      { dir: Direction.DOWN, x: ghostX, y: ghostY + 1 },
      { dir: Direction.LEFT, x: ghostX - 1, y: ghostY },
      { dir: Direction.RIGHT, x: ghostX + 1, y: ghostY },
    ];

    for (const move of moves) {
      // Skip if this would reverse direction
      if (move.dir === oppositeDirection) {
        continue;
      }

      // Skip if this hits a wall
      if (gameWorld.isWallAt(move.x, move.y)) {
        continue;
      }

      // Skip if this enters house (except when exiting or frightened going back)
      const isHouseTile = gameWorld.isHouseAt(move.x, move.y);
      if (isHouseTile &&
        mode !== BehaviorMode.EXITING_HOUSE &&
        mode !== BehaviorMode.FRIGHTENED) {
        continue;
      }

      // Calculate Euclidean distance to target
      const dx = move.x - targetX;
      const dy = move.y - targetY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      candidates.push({ direction: move.dir, distance });
    }

    // Choose direction with minimum distance
    if (candidates.length > 0) {
      const bestMove = candidates.reduce((min, current) =>
        current.distance < min.distance ? current : min
      );

      gameWorld.setComponent(entityId, ComponentType.MOVEMENT_INTENT, {
        direction: bestMove.direction
      });
    } else {
      // No valid moves (shouldn't happen, but handle gracefully)
      console.warn(`[ghostDirectionSystem] No valid moves for entity ${entityId} at (${ghostX}, ${ghostY})`);
      gameWorld.setComponent(entityId, ComponentType.MOVEMENT_INTENT, { direction: null });
      gameWorld.setComponent(entityId, ComponentType.CURRENT_DIRECTION, { direction: null });
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getOppositeDirection(direction: Direction | null): Direction | null {
  if (direction === null) return null;

  switch (direction) {
    case Direction.UP:
      return Direction.DOWN;
    case Direction.DOWN:
      return Direction.UP;
    case Direction.LEFT:
      return Direction.RIGHT;
    case Direction.RIGHT:
      return Direction.LEFT;
    default:
      return null;
  }
}
