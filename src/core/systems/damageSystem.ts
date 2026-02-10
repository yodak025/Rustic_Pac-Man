/**
 * Damage System
 * 
 * PHASE: EFFECTS (5)
 * RESPONSIBILITY: Apply consequences of collisions
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { CollisionEvent, Health, Invulnerability, BehaviorMode, CurrentDirection } from '@custom-types/components';
import { GhostBehaviorMode } from '@custom-types/gameComponents';
import * as gameDefaults from '@config/gameDefaults.json';

const DAMAGE_AMOUNT = 1;
const INVULNERABILITY_TICKS = gameDefaults.pacman.invulnerabilityTicks;

/**
 * Apply damage or ghost-eating based on collision events
 */
export function damageSystem(gameWorld: GameWorld): void {
  const entitiesWithCollision = gameWorld.query(
    ComponentType.COLLISION_EVENT,
    ComponentType.HEALTH,
    ComponentType.INVULNERABILITY
  );

  for (const entityId of entitiesWithCollision) {
    const collisionEvent = gameWorld.getComponent(
      entityId,
      ComponentType.COLLISION_EVENT
    ) as CollisionEvent | undefined;
    const invulnerability = gameWorld.getComponent(
      entityId,
      ComponentType.INVULNERABILITY
    ) as Invulnerability | undefined;
    const health = gameWorld.getComponent(
      entityId,
      ComponentType.HEALTH
    ) as Health | undefined;

    if (!collisionEvent) {
      continue;
    }
    if (!invulnerability) {
      console.error(`[damageSystem] Entity ${entityId} missing Invulnerability component`);
      continue;
    }
    if (!health) {
      console.error(`[damageSystem] Entity ${entityId} missing Health component`);
      continue;
    }

    if (collisionEvent.type !== 'ghost') {
      continue;
    }

    const ghostId = collisionEvent.withEntity;
    const ghostBehavior = gameWorld.getComponent(
      ghostId,
      ComponentType.BEHAVIOR_MODE
    ) as BehaviorMode | undefined;

    if (!ghostBehavior) {
      console.error(`[damageSystem] Ghost ${ghostId} missing BehaviorMode component`);
      continue;
    }

    if (ghostBehavior.mode === GhostBehaviorMode.FRIGHTENED) {
      gameWorld.setComponent(ghostId, ComponentType.BEHAVIOR_MODE, {
        mode: GhostBehaviorMode.EATEN
      });

      const ghostDir = gameWorld.getComponent(
        ghostId,
        ComponentType.CURRENT_DIRECTION
      ) as CurrentDirection | undefined;

      if (ghostDir) {
        gameWorld.setComponent(ghostId, ComponentType.CURRENT_DIRECTION, {
          direction: null
        });
      }
    } else if (invulnerability.ticksRemaining <= 0) {
      const newHealth = Math.max(0, health.current - DAMAGE_AMOUNT);
      gameWorld.setComponent(entityId, ComponentType.HEALTH, {
        current: newHealth,
        max: health.max
      });

      gameWorld.setComponent(entityId, ComponentType.INVULNERABILITY, {
        ticksRemaining: INVULNERABILITY_TICKS
      });
    }
  }
}
