/**
 * Power Pellet Effect System
 * 
 * PHASE: EFFECTS (5)
 * RESPONSIBILITY: Frighten ghosts when power pellet is collected
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { CollectionEvent, BehaviorMode, TargetPosition } from '@custom-types/components';
import { CollectableKind, GhostBehaviorMode, TargetKind } from '@custom-types/gameComponents';
import * as config from '@config/ghostBehavior.json';

const EXIT_POSITIONS = config.DEFAULT_POSITIONS.EXIT_HOME;

/**
 * When a power pellet is collected, frighten all active ghosts
 */
export function powerPelletEffectSystem(gameWorld: GameWorld): void {
  const entitiesWithCollection = gameWorld.query(ComponentType.COLLECTION_EVENT);

  let powerPelletCollected = false;

  for (const entityId of entitiesWithCollection) {
    const collectionEvent = gameWorld.getComponent(
      entityId,
      ComponentType.COLLECTION_EVENT
    ) as CollectionEvent | undefined;

    if (!collectionEvent) {
      continue;
    }

    if (collectionEvent.kind === CollectableKind.POWER_PELLET) {
      powerPelletCollected = true;
      break;
    }
  }

  if (!powerPelletCollected) {
    return;
  }

  const ghostEntities = gameWorld.query(
    ComponentType.GHOST_TAG,
    ComponentType.BEHAVIOR_MODE
  );

  for (const ghostId of ghostEntities) {
    const ghostBehavior = gameWorld.getComponent(
      ghostId,
      ComponentType.BEHAVIOR_MODE
    ) as BehaviorMode | undefined;

    if (!ghostBehavior) {
      console.error(`[powerPelletEffectSystem] Ghost ${ghostId} missing BehaviorMode component`);
      continue;
    }

    const isActive = 
      ghostBehavior.mode !== GhostBehaviorMode.HOUSE &&
      ghostBehavior.mode !== GhostBehaviorMode.EXITING_HOUSE &&
      ghostBehavior.mode !== GhostBehaviorMode.EATEN;

    if (isActive) {
      gameWorld.setComponent(ghostId, ComponentType.BEHAVIOR_MODE, {
        mode: GhostBehaviorMode.FRIGHTENED
      });

      const ghostKind = ghostId.toUpperCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exitPos = (EXIT_POSITIONS as any)[ghostKind];

      if (exitPos) {
        gameWorld.setComponent(ghostId, ComponentType.TARGET_POSITION, {
          x: exitPos.x,
          y: exitPos.y,
          kind: TargetKind.HOUSE
        } as TargetPosition);
      }
    }
  }
}
