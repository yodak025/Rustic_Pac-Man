/**
 * Cleanup Events System
 * 
 * PHASE: CLEANUP (8)
 * RESPONSIBILITY: Remove one-frame event components
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType } from '@custom-types/componentTypes';

/**
 * Remove all event components (CollisionEvent, CollectionEvent, EchoEatenEvent)
 * These are one-frame components that must be cleared each frame
 */
export function cleanupEventsSystem(gameWorld: GameWorld): void {
  const entitiesWithCollision = gameWorld.query(ComponentType.COLLISION_EVENT);
  for (const entityId of entitiesWithCollision) {
    gameWorld.removeComponent(entityId, ComponentType.COLLISION_EVENT);
  }

  const entitiesWithCollection = gameWorld.query(ComponentType.COLLECTION_EVENT);
  for (const entityId of entitiesWithCollection) {
    gameWorld.removeComponent(entityId, ComponentType.COLLECTION_EVENT);
  }

  const entitiesWithEchoEaten = gameWorld.query(ComponentType.ECHO_EATEN_EVENT);
  for (const entityId of entitiesWithEchoEaten) {
    gameWorld.removeComponent(entityId, ComponentType.ECHO_EATEN_EVENT);
  }
}
