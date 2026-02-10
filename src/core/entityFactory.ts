/**
 * Entity Factory Helpers
 * 
 * Helper functions to create entities with all their required components.
 * These functions encapsulate the boilerplate of component initialization.
 * 
 * RESPONSIBILITY: Entity creation logic
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, type EntityId } from '@custom-types/componentTypes';
import { GhostBehaviorMode, TargetKind, type GhostBehaviorKind } from '@custom-types/gameComponents';
import * as config from '@config/ghostBehavior.json';

const HOUSE_POSITION = config.DEFAULT_POSITIONS.HOME;

/**
 * Create a ghost entity with all required components
 * 
 * @param gameWorld - The GameWorld instance
 * @param entityId - Unique ID for the ghost (e.g., 'blinky')
 * @param ghostKind - Ghost behavior kind (BLINKY, PINKY, INKY, CLYDE)
 * @param position - Starting discrete position {x, y}
 * @param movementInterval - Milliseconds between movements
 * @param initialTicks - Ticks to stay in HOUSE before exiting
 */
export function createGhostEntity(
  gameWorld: GameWorld,
  entityId: EntityId,
  ghostKind: GhostBehaviorKind,
  position: { x: number; y: number },
  movementInterval: number,
  initialTicks: number
): void {
  // Create entity
  gameWorld.createEntity(entityId);

  // Add ghost tag
  gameWorld.addComponent(entityId, ComponentType.GHOST_TAG, { kind: ghostKind });

  // Add position
  gameWorld.addComponent(entityId, ComponentType.DISCRETE_POSITION, {
    x: position.x,
    y: position.y
  });

  // Add movement components
  gameWorld.addComponent(entityId, ComponentType.TIMER, {
    elapsed: 0,
    interval: movementInterval,
    isTimeToMove: false
  });

  gameWorld.addComponent(entityId, ComponentType.MOVEMENT_INTENT, {
    direction: null
  });

  gameWorld.addComponent(entityId, ComponentType.CURRENT_DIRECTION, {
    direction: null
  });

  // Add behavior components
  gameWorld.addComponent(entityId, ComponentType.BEHAVIOR_MODE, {
    mode: GhostBehaviorMode.HOUSE
  });

  gameWorld.addComponent(entityId, ComponentType.BEHAVIOR_COUNTER, {
    ticksRemaining: initialTicks
  });

  // Set initial target to house position
  const housePos = HOUSE_POSITION[ghostKind];
  gameWorld.addComponent(entityId, ComponentType.TARGET_POSITION, {
    x: housePos.x,
    y: housePos.y,
    kind: TargetKind.HOUSE
  });

  // Mark as renderable
  gameWorld.addComponent(entityId, ComponentType.RENDERABLE, {
    _tag: 'renderable' as const
  });
}
