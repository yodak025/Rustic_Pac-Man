/**
 * Continuous Movement System
 * 
 * PHASE: CONTINUOUS_MOVEMENT
 * RESPONSIBILITY: Move entities with continuous (float) positions based on MovementIntent
 * 
 * This system handles smooth, pixel-perfect movement for Pacman.
 * Includes wall collision detection and position clamping.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import { Direction } from '@custom-types/gameComponents';
import type {
  ContinuousPosition,
  MovementSpeed,
  MovementIntent,
  AlignmentState
} from '@custom-types/components';

/**
 * Get direction vector for a given direction
 */
function getDirectionVector(direction: Direction): { dx: number; dy: number } {
  switch (direction) {
    case Direction.UP:
      return { dx: 0, dy: -1 };
    case Direction.DOWN:
      return { dx: 0, dy: 1 };
    case Direction.LEFT:
      return { dx: -1, dy: 0 };
    case Direction.RIGHT:
      return { dx: 1, dy: 0 };
    default:
      return { dx: 0, dy: 0 };
  }
}

/**
 * Check if position would collide with wall
 * Returns the maximum valid position in the direction of movement
 */
function checkWallCollision(
  gameWorld: GameWorld,
  currentPos: ContinuousPosition,
  newPos: ContinuousPosition,
  direction: Direction
): ContinuousPosition {
  const { dx, dy } = getDirectionVector(direction);
  
  // Determine which tile we're trying to enter
  let targetTileX: number;
  let targetTileY: number;
  
  if (dx > 0) {
    // Moving right
    targetTileX = Math.ceil(newPos.x);
  } else if (dx < 0) {
    // Moving left
    targetTileX = Math.floor(newPos.x);
  } else {
    targetTileX = Math.round(currentPos.x);
  }
  
  if (dy > 0) {
    // Moving down
    targetTileY = Math.ceil(newPos.y);
  } else if (dy < 0) {
    // Moving up
    targetTileY = Math.floor(newPos.y);
  } else {
    targetTileY = Math.round(currentPos.y);
  }
  
  // Check if target tile is a wall or a collision between player and house
  if (gameWorld.isWallAt(targetTileX, targetTileY) || 
      gameWorld.isHouseAt(targetTileX, targetTileY)) {
    // Clamp to current tile boundary
    if (dx > 0) {
      // Moving right, clamp to left edge of target tile
      return { x: Math.round(currentPos.x), y: newPos.y };
    } else if (dx < 0) {
      // Moving left, clamp to right edge of current tile
      return { x: Math.round(currentPos.x), y: newPos.y };
    } else if (dy > 0) {
      // Moving down, clamp to top edge of target tile
      return { x: newPos.x, y: Math.round(currentPos.y) };
    } else if (dy < 0) {
      // Moving up, clamp to bottom edge of current tile
      return { x: newPos.x, y: Math.round(currentPos.y) };
    }
  }
  
  // No collision, return new position
  return newPos;
}

/**
 * Update alignment state based on position
 */
function updateAlignmentState(position: ContinuousPosition): AlignmentState {
  const isAlignedX = Math.floor(position.x) === position.x;
  const isAlignedY = Math.floor(position.y) === position.y;
  
  return {
    isAligned: isAlignedX && isAlignedY,
    aligningDirection: null // Alignment system will set this
  };
}

/**
 * Handle teleportation at map edges
 */
function handleTeleportation(position: ContinuousPosition): ContinuousPosition {
  let { x, y } = position;
  
  // Teleport at horizontal edges (x boundaries: 1 to 30)
  if (x <= 1) {
    x = 30;
  } else if (x >= 30) {
    x = 1;
  }
  
  return { x, y };
}

/**
 * Move entities with continuous position based on speed and direction
 * 
 * @param gameWorld - The ECS world
 * @param deltaTime - Time elapsed since last frame (ms)
 */
export function continuousMovementSystem(
  gameWorld: GameWorld,
  deltaTime: number
): void {
  // Query entities with continuous movement components
  const entities = gameWorld.query(
    ComponentType.CONTINUOUS_POSITION,
    ComponentType.MOVEMENT_SPEED,
    ComponentType.MOVEMENT_INTENT
  );

  for (const entityId of entities) {
    const position = gameWorld.getComponent(entityId, ComponentType.CONTINUOUS_POSITION);
    const speed = gameWorld.getComponent(entityId, ComponentType.MOVEMENT_SPEED);
    const intent = gameWorld.getComponent(entityId, ComponentType.MOVEMENT_INTENT);

    if (!position || !speed || !intent) continue;

    // If no movement intent, skip (alignment system will handle sliding)
    if (intent.direction === null) continue;

    // Calculate distance to move this frame
    const distance = speed.current * (deltaTime / 1000);

    // Get direction vector
    const { dx, dy } = getDirectionVector(intent.direction);

    // Calculate new position with centered fix axis.
    let newPos: ContinuousPosition = {
      x: dx ? position.x + dx * distance : Math.round(position.x),
      y: dy ? position.y + dy * distance : Math.round(position.y)
    };

    // Check wall collision and clamp if necessary
    newPos = checkWallCollision(gameWorld, position, newPos, intent.direction);

    // Handle teleportation
    newPos = handleTeleportation(newPos);

    // Update position
    gameWorld.setComponent(entityId, ComponentType.CONTINUOUS_POSITION, newPos);

    // Update alignment state
    const alignmentState = updateAlignmentState(newPos);
    gameWorld.setComponent(entityId, ComponentType.ALIGNMENT_STATE, alignmentState);
  }
}
