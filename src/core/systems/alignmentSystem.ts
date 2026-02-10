/**
 * Alignment System
 * 
 * PHASE: ALIGNMENT
 * RESPONSIBILITY: Slide entities to grid alignment when no input is present
 * 
 * This system ensures Pacman snaps to grid intersections when the player
 * releases all input. It uses the lastValidDirection to determine which
 * direction to slide (e.g., if moving right and stops, slide to next integer x).
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import { Direction } from '@custom-types/gameComponents';
import type {
  ContinuousPosition,
  AlignmentState,
  InputState
} from '@custom-types/components';

const INPUT_ENTITY_ID = 'input_singleton';

/**
 * Check if any input is active
 */
function hasActiveInput(input: InputState): boolean {
  return input.up || input.down || input.left || input.right;
}

/**
 * Get the target aligned position based on current position and direction
 */
function getAlignmentTarget(
  position: ContinuousPosition,
  direction: Direction | null
): { targetX: number; targetY: number } {
  if (!direction) {
    return { targetX: Math.round(position.x), targetY: Math.round(position.y) };
  }

  switch (direction) {
    case Direction.UP:
    case Direction.DOWN:
      // Align vertically
      return { targetX: position.x, targetY: Math.round(position.y) };
    case Direction.LEFT:
    case Direction.RIGHT:
      // Align horizontally
      return { targetX: Math.round(position.x), targetY: position.y };
    default:
      return { targetX: Math.round(position.x), targetY: Math.round(position.y) };
  }
}

/**
 * Slide entity to grid alignment when no input is present
 * 
 * @param gameWorld - The ECS world
 * @param deltaTime - Time elapsed since last frame (ms)
 */
export function alignmentSystem(
  gameWorld: GameWorld,
  deltaTime: number
): void {
  // Get input state
  const inputState = gameWorld.getComponent(INPUT_ENTITY_ID, ComponentType.INPUT_STATE);
  if (!inputState) return;

  // Skip if there's active input
  if (hasActiveInput(inputState)) return;

  // Query entities that need alignment
  const entities = gameWorld.query(
    ComponentType.CONTINUOUS_POSITION,
    ComponentType.MOVEMENT_SPEED,
    ComponentType.ALIGNMENT_STATE,
    ComponentType.PLAYER_INTENT
  );

  for (const entityId of entities) {
    const position = gameWorld.getComponent(entityId, ComponentType.CONTINUOUS_POSITION);
    const speed = gameWorld.getComponent(entityId, ComponentType.MOVEMENT_SPEED);
    const alignmentState = gameWorld.getComponent(entityId, ComponentType.ALIGNMENT_STATE);
    const playerIntent = gameWorld.getComponent(entityId, ComponentType.PLAYER_INTENT);

    if (!position || !speed || !alignmentState || !playerIntent) continue;

    // If already aligned, nothing to do
    if (alignmentState.isAligned) continue;

    // Use last valid direction to determine alignment direction
    const direction = playerIntent.lastValidDirection;
    if (!direction) continue;

    // Calculate distance to move this frame
    const distance = speed.current * (deltaTime / 1000);
    const doubleDistance = distance * 2;

    // Get alignment target
    const { targetX, targetY } = getAlignmentTarget(position, direction);
    
    // eslint-disable-next-line prefer-const
    let newPos = { ...position };
    let shouldSnap = false;

    switch (direction) {
      case Direction.UP: {
        const distanceToTarget = Math.abs(position.y - targetY);
        newPos.y = position.y - distance;
        
        // Check if we should snap
        if (distanceToTarget < doubleDistance || newPos.y < targetY) {
          newPos.y = targetY;
          shouldSnap = true;
        }
        break;
      }
      case Direction.DOWN: {
        const distanceToTarget = Math.abs(position.y - targetY);
        newPos.y = position.y + distance;
        
        // Check if we should snap
        if (distanceToTarget < doubleDistance || newPos.y > targetY) {
          newPos.y = targetY;
          shouldSnap = true;
        }
        break;
      }
      case Direction.LEFT: {
        const distanceToTarget = Math.abs(position.x - targetX);
        newPos.x = position.x - distance;
        
        // Check if we should snap
        if (distanceToTarget < doubleDistance || newPos.x < targetX) {
          newPos.x = targetX;
          shouldSnap = true;
        }
        break;
      }
      case Direction.RIGHT: {
        const distanceToTarget = Math.abs(position.x - targetX);
        newPos.x = position.x + distance;
        
        // Check if we should snap
        if (distanceToTarget < doubleDistance || newPos.x > targetX) {
          newPos.x = targetX;
          shouldSnap = true;
        }
        break;
      }
    }

    // Update position
    gameWorld.setComponent(entityId, ComponentType.CONTINUOUS_POSITION, newPos);

    // Update alignment state
    const isAlignedX = Math.floor(newPos.x) === newPos.x;
    const isAlignedY = Math.floor(newPos.y) === newPos.y;
    
    const updatedAlignmentState: AlignmentState = {
      isAligned: shouldSnap && isAlignedX && isAlignedY,
      aligningDirection: (shouldSnap && isAlignedX && isAlignedY) ? null : direction
    };

    gameWorld.setComponent(entityId, ComponentType.ALIGNMENT_STATE, updatedAlignmentState);
  }
}
