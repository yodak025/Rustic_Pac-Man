/**
 * Echo Eaten System
 *
 * PHASE: EFFECTS (5)
 * RESPONSIBILITY: Process echo eaten events — award points, grant dash energy
 *                 (and medallion XP overflow), then set the echo to EATEN state.
 *
 * Energy routing when Chomp eats an Echo:
 *   totalPoints = BASE_POINTS_ON_EATEN + echo.collectedScore
 *
 *   1. Convert totalPoints to dash energy (totalPoints * dashEnergyPerPoint).
 *   2. If the energy gain fits within the remaining capacity → all goes to dash.
 *   3. If the energy gain would exceed the cap:
 *        a. Fill the dash bar to maxEnergy.
 *        b. Convert the leftover points to medallion XP
 *           (remainingPoints * xpPerEchoPoint) and charge the selected medallion.
 *           This XP can trigger level-ups with carry-over (chargeStandard handles it).
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import type { EchoEatenEvent, CurrentDirection } from '@custom-types/components';
import { BehaviorMode } from '@custom-types/gameComponents';
import { SINUSOID_CONFIG } from '@config/echoConfig';
import gameDefaults from '@config/gameDefaults.json';
import { chargeMedallion } from './helpers/medallionCharge';

const DASH_ENERGY_PER_POINT = gameDefaults.abilities.dash.dashEnergyPerPoint;
const MEDALLION_XP_PER_ECHO_POINT = gameDefaults.abilities.medallions.xpPerEchoPoint;

/**
 * When Chomp eats an Echo:
 * - Award base points (200) + Echo's collected score to Chomp.
 * - Grant dash energy proportional to total points awarded.
 *   Any energy overflow above maxEnergy is converted to medallion XP.
 * - Set Echo to EATEN mode (stationary, gray).
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

    // Route energy: fill dash bar first; overflow flows into selected medallion XP
    const dashState = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE);
    if (dashState) {
      const energyGain = totalPoints * DASH_ENERGY_PER_POINT;
      const dashCapacity = dashState.maxEnergy - dashState.energy;

      if (energyGain <= dashCapacity) {
        // All energy fits in the dash bar
        gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE, {
          ...dashState,
          energy: dashState.energy + energyGain,
        });
      } else {
        // Fill the dash bar to the cap, then convert remaining points to medallion XP
        gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE, {
          ...dashState,
          energy: dashState.maxEnergy,
        });

        // Points that would have exceeded the dash bar capacity
        const pointsUsedForDash = dashCapacity / DASH_ENERGY_PER_POINT;
        const overflowPoints = totalPoints - pointsUsedForDash;
        const medallionXP = overflowPoints * MEDALLION_XP_PER_ECHO_POINT;

        chargeMedallion(gameWorld, PACMAN_ENTITY_ID, medallionXP);
      }
    }

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
