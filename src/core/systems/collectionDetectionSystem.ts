/**
 * Collection Detection System
 * 
 * PHASE: DETECTION (4)
 * RESPONSIBILITY: Detect items at Pacman's position
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { DiscretePosition, Collector, CollectionEvent } from '@custom-types/components';

/**
 * Detect collectables at Pacman's discrete position
 */
export function collectionDetectionSystem(gameWorld: GameWorld): void {
  const collectorEntities = gameWorld.query(
    ComponentType.COLLECTOR,
    ComponentType.DISCRETE_POSITION
  );

  for (const collectorId of collectorEntities) {
    const collector = gameWorld.getComponent(
      collectorId,
      ComponentType.COLLECTOR
    ) as Collector | undefined;
    const position = gameWorld.getComponent(
      collectorId,
      ComponentType.DISCRETE_POSITION
    ) as DiscretePosition | undefined;

    if (!collector) {
      console.error(`[collectionDetectionSystem] Entity ${collectorId} missing Collector component`);
      continue;
    }
    if (!position) {
      console.error(`[collectionDetectionSystem] Entity ${collectorId} missing DiscretePosition component`);
      continue;
    }

    const collectableKind = gameWorld.getCollectableAt(position.x, position.y);

    if (collectableKind && collector.canCollect.includes(collectableKind)) {
      const collectionEvent: CollectionEvent = {
        collectableId: `collectable-${position.x}-${position.y}`,
        kind: collectableKind,
        position: { x: position.x, y: position.y }
      };

      gameWorld.addComponent(
        collectorId,
        ComponentType.COLLECTION_EVENT,
        collectionEvent
      );
    }
  }
}
