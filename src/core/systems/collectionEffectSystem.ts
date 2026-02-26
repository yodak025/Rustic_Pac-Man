/**
 * Collection Effect System
 * 
 * PHASE: EFFECTS (5)
 * RESPONSIBILITY: Remove collectables and update score
 * 
 * Handles both Chomp and Echo collections:
 * - Chomp: Points go to global score
 * - Echo: Points go to Echo's COLLECTED_SCORE component
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { CollectionEvent } from '@custom-types/components';
import { CollectableKind } from '@custom-types/gameComponents';
import * as gameDefaults from '@config/gameDefaults.json';

const POINT_VALUES = gameDefaults.game.pointValues;

/**
 * Process collection events: remove collectables and increment score
 */
export function collectionEffectSystem(gameWorld: GameWorld): void {
  const entitiesWithCollection = gameWorld.query(ComponentType.COLLECTION_EVENT);

  for (const entityId of entitiesWithCollection) {
    const collectionEvent = gameWorld.getComponent(
      entityId,
      ComponentType.COLLECTION_EVENT
    ) as CollectionEvent | undefined;

    if (!collectionEvent) {
      continue;
    }

    const { position, kind } = collectionEvent;

    // Remove collectable from the map
    gameWorld.removeCollectable(position.x, position.y);

    // Calculate points based on collectable type
    let pointsToAdd = 0;

    switch (kind) {
      case CollectableKind.PAC_DOT:
        pointsToAdd = POINT_VALUES.pacDot;
        break;
      case CollectableKind.POWER_PELLET:
        pointsToAdd = POINT_VALUES.powerPellet;
        break;
    }

    // Check if collector is an Echo
    const isEcho = gameWorld.hasComponent(entityId, ComponentType.ECHO_TAG);

    if (isEcho) {
      // Add points to Echo's COLLECTED_SCORE
      const collectedScore = gameWorld.getComponent(entityId, ComponentType.COLLECTED_SCORE);
      if (collectedScore) {
        gameWorld.setComponent(entityId, ComponentType.COLLECTED_SCORE, {
          points: collectedScore.points + pointsToAdd
        });
      }
    } else {
      // Add points to global score (Chomp collection)
      const currentScore = gameWorld.getGameState().score;
      gameWorld.setScore(currentScore + pointsToAdd);
    }
  }
}
