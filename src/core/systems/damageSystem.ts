/**
 * Damage System
 * 
 * PHASE: EFFECTS (5)
 * RESPONSIBILITY: Apply consequences of collisions with ghosts and echos
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import type { CollisionEvent, Health, Invulnerability, BehaviorMode, CurrentDirection, EchoEatenEvent, CollectedScore } from '@custom-types/components';
import { BehaviorMode as BehaviorModeEnum } from '@custom-types/gameComponents';
import gameDefaults from '@config/gameDefaults.json';

const DAMAGE_AMOUNT = 1;
const INVULNERABILITY_TICKS = gameDefaults.pacman.invulnerabilityTicks;

/**
 * Apply damage or ghost/echo-eating based on collision events
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

    // Handle Ghost collisions
    if (collisionEvent.type === 'ghost') {
      const ghostId = collisionEvent.withEntity;
      const ghostBehavior = gameWorld.getComponent(
        ghostId,
        ComponentType.BEHAVIOR_MODE
      ) as BehaviorMode | undefined;

      if (!ghostBehavior) {
        console.error(`[damageSystem] Ghost ${ghostId} missing BehaviorMode component`);
        continue;
      }

      if (ghostBehavior.mode === BehaviorModeEnum.FRIGHTENED) {
        // Chomp eats frightened ghost
        gameWorld.setComponent(ghostId, ComponentType.BEHAVIOR_MODE, {
          mode: BehaviorModeEnum.EATEN
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
        // Ghost damages Chomp
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

    // Handle Echo collisions
    if (collisionEvent.type === 'echo') {
      const echoId = collisionEvent.withEntity;
      const echoBehavior = gameWorld.getComponent(
        echoId,
        ComponentType.BEHAVIOR_MODE
      ) as BehaviorMode | undefined;

      if (!echoBehavior) {
        console.error(`[damageSystem] Echo ${echoId} missing BehaviorMode component`);
        continue;
      }

      if (echoBehavior.mode === BehaviorModeEnum.FRIGHTENED) {
        // Chomp eats frightened echo - generate ECHO_EATEN_EVENT
        const echoCollectedScore = gameWorld.getComponent(
          echoId,
          ComponentType.COLLECTED_SCORE
        ) as CollectedScore | undefined;

        const eatenEvent: EchoEatenEvent = {
          echoId,
          collectedScore: echoCollectedScore?.points || 0
        };

        gameWorld.addComponent(
          PACMAN_ENTITY_ID,
          ComponentType.ECHO_EATEN_EVENT,
          eatenEvent
        );
      } else if (invulnerability.ticksRemaining <= 0) {
        // Echo damages Chomp
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
}
