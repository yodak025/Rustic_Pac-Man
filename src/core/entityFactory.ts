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
import { BehaviorMode, TargetKind, type GhostBehaviorKind, type EchoBehaviorKind, CollectableKind } from '@custom-types/gameComponents';
import * as config from '@config/defaultPositions.json';
import { SINUSOID_CONFIG } from '@config/echoConfig';

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
    baseInterval: movementInterval,
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
    mode: BehaviorMode.HOUSE
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

/**
 * Create an Echo entity with all required components
 * 
 * @param gameWorld - The GameWorld instance
 * @param entityId - Unique ID for the echo (e.g., 'echo_0')
 * @param echoKind - Echo behavior kind (SINUSOID, etc.)
 * @param position - Starting discrete position {x, y}
 * @param movementInterval - Milliseconds between movements
 */
export function createEchoEntity(
  gameWorld: GameWorld,
  entityId: EntityId,
  echoKind: EchoBehaviorKind,
  position: { x: number; y: number },
  movementInterval: number
): void {
  // Create entity
  gameWorld.createEntity(entityId);

  // Add echo tag
  gameWorld.addComponent(entityId, ComponentType.ECHO_TAG, { kind: echoKind });

  // Add discrete position (Echos use discrete movement like ghosts)
  gameWorld.addComponent(entityId, ComponentType.DISCRETE_POSITION, {
    x: position.x,
    y: position.y
  });

  // Add movement timer (with baseInterval for speed changes)
  gameWorld.addComponent(entityId, ComponentType.TIMER, {
    elapsed: 0,
    interval: movementInterval / SINUSOID_CONFIG.SPEED_SCATTER, // Start slower in SCATTER
    baseInterval: movementInterval,
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
    mode: BehaviorMode.SCATTER // Echos start in SCATTER mode
  });

  gameWorld.addComponent(entityId, ComponentType.BEHAVIOR_COUNTER, {
    ticksRemaining: 0 // Used for IDLE duration
  });

  gameWorld.addComponent(entityId, ComponentType.TARGET_POSITION, {
    x: position.x,
    y: position.y,
    kind: TargetKind.RANDOM
  });

  // Add collector component (Echos collect PacDots and PowerPellets)
  gameWorld.addComponent(entityId, ComponentType.COLLECTOR, {
    canCollect: [CollectableKind.PAC_DOT, CollectableKind.POWER_PELLET]
  });

  // Add collected score component (tracks points this Echo has collected)
  gameWorld.addComponent(entityId, ComponentType.COLLECTED_SCORE, {
    points: 0
  });

  // Mark as renderable
  gameWorld.addComponent(entityId, ComponentType.RENDERABLE, {
    _tag: 'renderable' as const
  });
}
