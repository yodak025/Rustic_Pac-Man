/**
 * Target-Based Direction System
 * 
 * Decides the next movement direction for discrete entities (Ghosts, Echos) based on their target position.
 * Uses pathfinding heuristic: choose direction that minimizes Euclidean distance to target.
 * 
 * Constraints:
 * - Cannot reverse direction (no 180° turns)
 * - Cannot enter walls
 * - Cannot enter house tiles (except in EXITING_HOUSE and FRIGHTENED modes)
 * - Prevents entity-entity collisions via spatial reservation
 * 
 * Special Cases:
 * - TargetKind.RANDOM: Randomly selects from valid moves (used by Echo SCATTER)
 * - IDLE/EATEN modes: No movement intent set
 * 
 * PHASE: DIRECTION_PLANNING
 * RESPONSIBILITY: Path planning for discrete entity AI
 * 
 * @see /docs/ECS_ARCHITECTURE_DESIGN.md Section 4.2 - Ghost/Echo Direction Systems
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { EntityId } from '@custom-types/componentTypes';
import { Direction, BehaviorMode, TargetKind } from '@custom-types/gameComponents';

/**
 * Target-Based Direction System
 * 
 * Calculates the best movement direction for discrete entities based on their target position.
 * Updates MovementIntent component.
 * 
 * Prevents entity-entity collisions by tracking reserved tiles per frame.
 */
export function targetBasedDirectionSystem(gameWorld: GameWorld): void {
  // HashMap to track reserved tiles (prevent entity-entity collisions)
  const reservedTiles = new Map<string, EntityId>();

  // Query all entities with discrete movement and targeting
  const entities = gameWorld.query(
    ComponentType.DISCRETE_POSITION,
    ComponentType.TARGET_POSITION,
    ComponentType.CURRENT_DIRECTION,
    ComponentType.BEHAVIOR_MODE
  );

  for (const entityId of entities) {
    const position = gameWorld.getComponent(entityId, ComponentType.DISCRETE_POSITION);
    const target = gameWorld.getComponent(entityId, ComponentType.TARGET_POSITION);
    const currentDir = gameWorld.getComponent(entityId, ComponentType.CURRENT_DIRECTION);
    const behaviorMode = gameWorld.getComponent(entityId, ComponentType.BEHAVIOR_MODE);

    if (!position || !target || !currentDir || !behaviorMode) {
      console.error(`[targetBasedDirectionSystem] Missing components for entity ${entityId}`);
      continue;
    }

    const { x: entityX, y: entityY } = position;
    const { x: targetX, y: targetY, kind: targetKind } = target;
    const mode = behaviorMode.mode;

    // Don't update direction for EATEN or IDLE entities
    if (mode === BehaviorMode.EATEN || mode === BehaviorMode.IDLE) {
      gameWorld.setComponent(entityId, ComponentType.MOVEMENT_INTENT, { direction: null });
      continue;
    }

    // Don't update direction for entities in HOUSE (not moving)
    if (mode === BehaviorMode.HOUSE) {
      gameWorld.setComponent(entityId, ComponentType.MOVEMENT_INTENT, { direction: null });
      continue;
    }

    // Get opposite direction (cannot reverse)
    const oppositeDirection = getOppositeDirection(currentDir.direction);

    // Evaluate all 4 possible directions
    const candidates: Array<{ direction: Direction; x: number; y: number; distance: number }> = [];

    const moves = [
      { dir: Direction.UP, x: entityX, y: entityY - 1 },
      { dir: Direction.DOWN, x: entityX, y: entityY + 1 },
      { dir: Direction.LEFT, x: entityX - 1, y: entityY },
      { dir: Direction.RIGHT, x: entityX + 1, y: entityY },
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

      if (move.x < 1) {
        continue
      }

      // Skip if this enters house (except when exiting or frightened)
      const isHouseTile = gameWorld.isHouseAt(move.x, move.y);
      if (isHouseTile &&
        mode !== BehaviorMode.EXITING_HOUSE &&
        mode !== BehaviorMode.FRIGHTENED) {
        continue;
      }

      // Skip if this tile is already reserved by another entity
      const tileKey = `${move.x},${move.y}`;
      const reservingEntity = reservedTiles.get(tileKey);
      if (reservingEntity !== undefined && reservingEntity !== entityId) {
        continue; // Another entity is targeting this tile
      }

      // Calculate Euclidean distance to target
      const dx = move.x - targetX;
      const dy = move.y - targetY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      candidates.push({ direction: move.dir, x: move.x, y: move.y, distance });
    }

    // Choose direction based on target kind
    if (candidates.length > 0) {
      let chosenMove;

      if (targetKind === TargetKind.RANDOM) {
        // Random selection (for Echo SCATTER mode)
        const randomIndex = Math.floor(Math.random() * candidates.length);
        chosenMove = candidates[randomIndex];
      } else {
        // Minimum distance selection (default pathfinding)
        chosenMove = candidates.reduce((min, current) =>
          current.distance < min.distance ? current : min
        );
      }

      // Reserve the chosen tile for this entity
      const tileKey = `${chosenMove.x},${chosenMove.y}`;
      reservedTiles.set(tileKey, entityId);

      gameWorld.setComponent(entityId, ComponentType.MOVEMENT_INTENT, {
        direction: chosenMove.direction
      });
    } else {
      // No valid moves (blocked by walls, collision prevention, or constraints)
      console.warn(`[targetBasedDirectionSystem] No valid moves for entity ${entityId} at (${entityX}, ${entityY})`);
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
