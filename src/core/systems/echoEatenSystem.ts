/**
 * Echo Eaten System
 * 
 * PHASE: EFFECTS (5)
 * RESPONSIBILITY: Process echo eaten events - award points and set echo to EATEN state
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { EchoEatenEvent, CurrentDirection } from '@custom-types/components';
import { BehaviorMode } from '@custom-types/gameComponents';
import { SINUSOID_CONFIG } from '@config/echoConfig';

/**
 * When Chomp eats an Echo:
 * - Award base points (200) + Echo's collected score to Chomp
 * - Set Echo to EATEN mode (stationary, gray)
 */
export function echoEatenSystem(gameWorld: GameWorld): void {
  const entitiesWithEatenEvent = gameWorld.query(ComponentType.ECHO_EATEN_EVENT);

  for (const entityId of entitiesWithEatenEvent) {
    const eatenEvent = gameWorld.getComponent(
      entityId,
      ComponentType.ECHO_EATEN_EVENT
    ) as EchoEatenEvent | undefined;

    if (!eatenEvent) {
      continue;
    }

    const { echoId, collectedScore } = eatenEvent;

    // Award points to Chomp (base + collected)
    const totalPoints = SINUSOID_CONFIG.BASE_POINTS_ON_EATEN + collectedScore;
    const currentScore = gameWorld.getGameState().score;
    gameWorld.setScore(currentScore + totalPoints);

    // Set Echo to EATEN mode
    gameWorld.setComponent(echoId, ComponentType.BEHAVIOR_MODE, {
      mode: BehaviorMode.EATEN
    });

    // Stop Echo movement
    const echoDir = gameWorld.getComponent(
      echoId,
      ComponentType.CURRENT_DIRECTION
    ) as CurrentDirection | undefined;

    if (echoDir) {
      gameWorld.setComponent(echoId, ComponentType.CURRENT_DIRECTION, {
        direction: null
      });
    }
  }
}
