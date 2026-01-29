/**
 * Player Intent System
 * 
 * PHASE: PLAYER_INTENT
 * RESPONSIBILITY: Translate input to movement intent with turn rules
 * 
 * This system reads InputState and determines MovementIntent for Pacman.
 * Key logic: Pacman can only turn at intersections (when aligned to grid).
 * - Horizontal movement (LEFT/RIGHT) requires vertical alignment (y is integer)
 * - Vertical movement (UP/DOWN) requires horizontal alignment (x is integer)
 * 
 * When player presses a direction that's not valid yet, the system remembers it
 * in PlayerIntent.desiredDirection and applies it when alignment allows.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import { Direction } from '@custom-types/gameComponents';
import type {
  InputState,
  ContinuousPosition,
  PlayerIntent,
  MovementIntent
} from '@custom-types/components';

const INPUT_ENTITY_ID = 'input_singleton';

/**
 * Check if a number is an integer (aligned to grid)
 */
function isAligned(value: number): boolean {
return Math.abs(value - Math.round(value)) < 0.1;
}

/**
 * Check if a direction change is valid given current position
 */
function isDirectionValid(
  direction: Direction,
  position: ContinuousPosition
): boolean {
  switch (direction) {
    case Direction.UP:
    case Direction.DOWN:
      // Vertical movement requires horizontal alignment
      return isAligned(position.x);
    case Direction.LEFT:
    case Direction.RIGHT:
      // Horizontal movement requires vertical alignment
      return isAligned(position.y);
    default:
      return false;
  }
}

/**
 * Get direction from input state (priority: up > down > left > right)
 */
function getInputDirection(input: InputState): Direction | null {
  if (input.up) return Direction.UP;
  if (input.down) return Direction.DOWN;
  if (input.left) return Direction.LEFT;
  if (input.right) return Direction.RIGHT;
  return null;
}

/**
 * Check if any input is pressed
 */
function hasInput(input: InputState): boolean {
  return input.up || input.down || input.left || input.right;
}

/**
 * Determines movement intent for playable entities based on input
 * 
 * @param gameWorld - The ECS world
 */
export function playerIntentSystem(gameWorld: GameWorld): void {
  // Get input state from singleton
  const inputState = gameWorld.getComponent(INPUT_ENTITY_ID, ComponentType.INPUT_STATE);
  if (!inputState) return;

  // Query all playable entities with required components
  const playableEntities = gameWorld.query(
    ComponentType.PLAYABLE,
    ComponentType.CONTINUOUS_POSITION,
    ComponentType.PLAYER_INTENT
  );

  for (const entityId of playableEntities) {
    const position = gameWorld.getComponent(entityId, ComponentType.CONTINUOUS_POSITION);
    const playerIntent = gameWorld.getComponent(entityId, ComponentType.PLAYER_INTENT);

    if (!position || !playerIntent) continue;

    // Get desired direction from input
    const inputDirection = getInputDirection(inputState);

    // Update desired direction
    const newDesiredDirection = inputDirection !== null ? inputDirection : playerIntent.desiredDirection;

    // Determine actual movement intent
    let actualDirection: Direction | null = null;

    if (newDesiredDirection !== null) {
      // Check if desired direction is valid
      if (isDirectionValid(newDesiredDirection, position)) {
        // Can move in desired direction
        actualDirection = newDesiredDirection;
      } else {
        // Can't move in desired direction yet
        // Keep moving in last valid direction if player is holding input
        if (hasInput(inputState) && playerIntent.lastValidDirection !== null) {
          actualDirection = playerIntent.lastValidDirection;
        } else if (!hasInput(inputState) && playerIntent.lastValidDirection !== null) {
          // No input - alignment system will handle sliding
          actualDirection = null;
        }
      }
    } else {
      // No desired direction - continue with last valid or stop
      if (!hasInput(inputState)) {
        actualDirection = null; // Stop or let alignment system handle
      } else if (playerIntent.lastValidDirection !== null) {
        actualDirection = playerIntent.lastValidDirection;
      }
    }

    // Update PlayerIntent
    const updatedPlayerIntent: PlayerIntent = {
      desiredDirection: newDesiredDirection,
      lastValidDirection: actualDirection !== null ? actualDirection : playerIntent.lastValidDirection
    };

    gameWorld.setComponent(entityId, ComponentType.PLAYER_INTENT, updatedPlayerIntent);

    // Update MovementIntent
    const movementIntent: MovementIntent = {
      direction: actualDirection
    };

    gameWorld.setComponent(entityId, ComponentType.MOVEMENT_INTENT, movementIntent);
  }
}
