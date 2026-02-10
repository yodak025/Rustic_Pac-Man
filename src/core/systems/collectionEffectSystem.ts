/**
 * Collection Effect System
 * 
 * PHASE: EFFECTS (5)
 * RESPONSIBILITY: Remove collectables and update score
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

    gameWorld.removeCollectable(position.x, position.y);

    const currentScore = gameWorld.getGameState().score;
    let pointsToAdd = 0;

    switch (kind) {
      case CollectableKind.PAC_DOT:
        pointsToAdd = POINT_VALUES.pacDot;
        break;
      case CollectableKind.POWER_PELLET:
        pointsToAdd = POINT_VALUES.powerPellet;
        break;
    }

    gameWorld.setScore(currentScore + pointsToAdd);
  }
}
