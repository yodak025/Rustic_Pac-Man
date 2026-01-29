/**
 * Discrete Position Sync System
 * 
 * PHASE: DISCRETE_POSITION_SYNC
 * RESPONSIBILITY: Keep DiscretePosition synced with ContinuousPosition
 * 
 * This system maintains the DiscretePosition component for entities that have
 * both continuous and discrete positions (i.e., Pacman).
 * 
 * The discrete position is used by:
 * - Ghost targeting systems (to chase Pacman)
 * - Collision detection (ghost-pacman collisions)
 * - Collection detection (picking up dots/pellets)
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { ContinuousPosition, DiscretePosition } from '@custom-types/components';

/**
 * Sync discrete position from continuous position
 * 
 * @param gameWorld - The ECS world
 */
export function discretePositionSyncSystem(gameWorld: GameWorld): void {
  // Query entities that have both position types
  const entities = gameWorld.query(
    ComponentType.CONTINUOUS_POSITION,
    ComponentType.DISCRETE_POSITION
  );

  for (const entityId of entities) {
    const continuousPos = gameWorld.getComponent(entityId, ComponentType.CONTINUOUS_POSITION);
    
    if (!continuousPos) continue;

    // Convert continuous to discrete (round to nearest integer)
    const discretePos: DiscretePosition = {
      x: Math.round(continuousPos.x),
      y: Math.round(continuousPos.y)
    };

    // Update discrete position
    gameWorld.setComponent(entityId, ComponentType.DISCRETE_POSITION, discretePos);
  }
}
