/**
 * Collection Effect System
 *
 * PHASE: EFFECTS (5)
 * RESPONSIBILITY: Remove collectables and update score / player inventory
 *
 * Handles both Chomp and Echo collections:
 * - Chomp ESSENCE: add score + dash energy (or medallion XP if bar full)
 * - Chomp WHITE_NOISE_BALL: add score + WNB stock
 * - Chomp MEDALLION_*: add medallion to rack (if not already present)
 * - Chomp POWER_UP_*: load power-up into essence bar
 * - Echo ESSENCE: points go to Echo's COLLECTED_SCORE component
 *
 * Medallion charging rules:
 *   HEALTH (special, no leveling):
 *     - Accumulates chargeXP up to activationCost.
 *     - When chargeXP >= activationCost, automatically grants +1 HP and resets XP.
 *     - No player input required.
 *   Standard medallions (levels 0–4):
 *     - Each essence dot adds xpPerEssence to chargeXP.
 *     - When chargeXP >= xpToNextLevel[currentLevel], level up and carry over excess XP.
 *     - Passive attribute improvement applies automatically (playerAttributeSystem reads levels).
 *   Standard medallion at level 5 (max level):
 *     - Continues accumulating chargeXP up to activationCost.
 *     - Does NOT auto-activate — waits for player input (medallionActivateSystem).
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { CollectionEvent } from '@custom-types/components';
import { CollectableKind, MedallionKind, PowerUpKind, MEDALLION_COLLECTABLE_SET, medallionKindFromCollectable } from '@custom-types/gameComponents';
import gameDefaults from '@config/gameDefaults.json';
import { chargeMedallion } from './helpers/medallionCharge';

const POINT_VALUES = gameDefaults.game.pointValues;
const ABILITIES_CFG = gameDefaults.abilities;


/**
 * Process collection events: remove collectables and update game/player state
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

    // Check if collector is an Echo or Chomp
    const isEcho = gameWorld.hasComponent(entityId, ComponentType.ECHO_TAG);

    if (isEcho) {
      // Echos only collect ESSENCE — points go to Echo's COLLECTED_SCORE
      if (kind === CollectableKind.ESSENCE) {
        const collectedScore = gameWorld.getComponent(entityId, ComponentType.COLLECTED_SCORE);
        if (collectedScore) {
          gameWorld.setComponent(entityId, ComponentType.COLLECTED_SCORE, {
            points: collectedScore.points + POINT_VALUES.essence
          });
        }
      }
      continue;
    }

    // ── Chomp collections ──────────────────────────────────────────────────

    switch (kind) {
      case CollectableKind.ESSENCE: {
        // Add score
        gameWorld.setScore(gameWorld.getGameState().score + POINT_VALUES.essence);

        // Charge dash energy using essenceMultiplier from PLAYER_STATS;
        // if bar is full, charge the selected medallion instead.
        const dashState = gameWorld.getComponent(entityId, ComponentType.DASH_STATE);
        if (dashState) {
          const playerStats = gameWorld.getComponent(entityId, ComponentType.PLAYER_STATS);
          const energyGain = playerStats
            ? ABILITIES_CFG.dash.energyPerEssence * playerStats.essenceMultiplier
            : ABILITIES_CFG.dash.energyPerEssence;

          if (dashState.energy < dashState.maxEnergy) {
            const newEnergy = Math.min(
              dashState.energy + energyGain,
              dashState.maxEnergy
            );
            gameWorld.setComponent(entityId, ComponentType.DASH_STATE, {
              ...dashState,
              energy: newEnergy
            });
          } else {
            // Bar full — route XP to selected medallion
            chargeMedallion(gameWorld, entityId, ABILITIES_CFG.medallions.xpPerEssence);
          }
        }
        break;
      }

      case CollectableKind.WHITE_NOISE_BALL: {
        // Add score + increment WNB stock
        gameWorld.setScore(gameWorld.getGameState().score + POINT_VALUES.whiteNoiseBall);
        const wnbStock = gameWorld.getComponent(entityId, ComponentType.WNB_STOCK);
        if (wnbStock) {
          gameWorld.setComponent(entityId, ComponentType.WNB_STOCK, {
            count: wnbStock.count + 1
          });
        }
        break;
      }

      default: {
        // Medallion collectables
        if (MEDALLION_COLLECTABLE_SET.has(kind)) {
          const mk = medallionKindFromCollectable(kind) as MedallionKind;
          const rack = gameWorld.getComponent(entityId, ComponentType.MEDALLION_RACK);
          if (rack) {
            const alreadyHas = rack.slots.some(s => s.kind === mk);
            if (!alreadyHas) {
              gameWorld.setComponent(entityId, ComponentType.MEDALLION_RACK, {
                ...rack,
                slots: [...rack.slots, { kind: mk, level: 1, chargeXP: 0 }]
              });
            }
          }
          break;
        }

        // Power-up collectables
        if (kind === CollectableKind.POWER_UP_SUPER_DASH) {
          const essenceBar = gameWorld.getComponent(entityId, ComponentType.ESSENCE_BAR);
          if (essenceBar && essenceBar.activePowerUp === null) {
            gameWorld.setComponent(entityId, ComponentType.ESSENCE_BAR, {
              ...essenceBar,
              activePowerUp: PowerUpKind.SUPER_DASH
            });
          }
        }
        break;
      }
    }
  }
}


