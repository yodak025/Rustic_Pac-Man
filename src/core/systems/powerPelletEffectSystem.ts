/**
 * Power Pellet Effect System
 * 
 * PHASE: EFFECTS (5)
 * RESPONSIBILITY: Frighten ghosts and echos when power pellet is collected
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import type { CollectionEvent, BehaviorMode, TargetPosition, MovementTimer } from '@custom-types/components';
import { CollectableKind, BehaviorMode as BehaviorModeEnum, TargetKind } from '@custom-types/gameComponents';
import * as config from '@config/defaultPositions.json';
import { SINUSOID_CONFIG } from '@config/echoConfig';

const EXIT_POSITIONS = config.DEFAULT_POSITIONS.EXIT_HOME;

/**
 * When a power pellet is collected BY CHOMP, frighten all active ghosts and echos
 */
export function powerPelletEffectSystem(gameWorld: GameWorld): void {
  // Check if Chomp collected a PowerPellet
  const chompCollectionEvent = gameWorld.getComponent(
    PACMAN_ENTITY_ID,
    ComponentType.COLLECTION_EVENT
  ) as CollectionEvent | undefined;

  const powerPelletCollectedByChomp = 
    chompCollectionEvent?.kind === CollectableKind.POWER_PELLET;

  if (!powerPelletCollectedByChomp) {
    return;
  }

  // Frighten all active ghosts
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
      ghostBehavior.mode !== BehaviorModeEnum.HOUSE &&
      ghostBehavior.mode !== BehaviorModeEnum.EXITING_HOUSE &&
      ghostBehavior.mode !== BehaviorModeEnum.EATEN;

    if (isActive) {
      gameWorld.setComponent(ghostId, ComponentType.BEHAVIOR_MODE, {
        mode: BehaviorModeEnum.FRIGHTENED
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

  // Frighten all active echos
  const echoEntities = gameWorld.query(
    ComponentType.ECHO_TAG,
    ComponentType.BEHAVIOR_MODE,
    ComponentType.BEHAVIOR_COUNTER,
    ComponentType.TIMER
  );

  for (const echoId of echoEntities) {
    const echoBehavior = gameWorld.getComponent(
      echoId,
      ComponentType.BEHAVIOR_MODE
    ) as BehaviorMode | undefined;

    const echoTimer = gameWorld.getComponent(
      echoId,
      ComponentType.TIMER
    ) as MovementTimer | undefined;

    if (!echoBehavior || !echoTimer) {
      console.error(`[powerPelletEffectSystem] Echo ${echoId} missing components`);
      continue;
    }

    const isActive = echoBehavior.mode !== BehaviorModeEnum.EATEN;

    if (isActive) {
      // Set Echo to FRIGHTENED mode
      gameWorld.setComponent(echoId, ComponentType.BEHAVIOR_MODE, {
        mode: BehaviorModeEnum.FRIGHTENED
      });

      // Initialize FRIGHTENED duration counter
      gameWorld.setComponent(echoId, ComponentType.BEHAVIOR_COUNTER, {
        ticksRemaining: SINUSOID_CONFIG.FRIGHTENED_DURATION_TICKS
      });

      // Set high speed for FRIGHTENED mode (interval = baseInterval / SPEED_FRIGHTEN)
      const newInterval = echoTimer.baseInterval / SINUSOID_CONFIG.SPEED_FRIGHTEN;
      gameWorld.setComponent(echoId, ComponentType.TIMER, {
        elapsed: echoTimer.elapsed,
        interval: newInterval,
        baseInterval: echoTimer.baseInterval,
        isTimeToMove: echoTimer.isTimeToMove
      });
    }
  }
}
