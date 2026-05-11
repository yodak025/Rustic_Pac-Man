/**
 * Medallion Charge Helpers
 *
 * Shared logic for charging the selected medallion slot with XP.
 * Used by collectionEffectSystem and echoEatenSystem.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import { MedallionKind } from '@custom-types/gameComponents';
import { getMedallionXpThreshold, getMedallionActivationCost } from '@config/medallionAttributes';

const MAX_MEDALLION_LEVEL = 5;

/**
 * Charge the selected medallion slot with `xpGain` XP.
 * Handles HEALTH auto-activation and standard level-up with XP overflow.
 */
export function chargeMedallion(gameWorld: GameWorld, entityId: string, xpGain: number): void {
  const rack = gameWorld.getComponent(entityId, ComponentType.MEDALLION_RACK);
  if (!rack || rack.slots.length === 0) return;

  const idx = rack.selectedIndex;
  const slot = rack.slots[idx];
  if (!slot) return;

  const newXP = slot.chargeXP + xpGain;

  if (slot.kind === MedallionKind.HEALTH) {
    chargeHealth(gameWorld, entityId, idx, newXP);
  } else {
    chargeStandard(gameWorld, entityId, idx, newXP);
  }
}

/**
 * HEALTH medallion charging:
 * Accumulates up to activationCost, then auto-activates (+1 HP) and resets XP with carry-over.
 */
function chargeHealth(
  gameWorld: GameWorld,
  entityId: string,
  idx: number,
  newXP: number
): void {
  const rack = gameWorld.getComponent(entityId, ComponentType.MEDALLION_RACK);
  if (!rack) return;

  const activationCost = getMedallionActivationCost(MedallionKind.HEALTH);

  if (newXP >= activationCost) {
    const health = gameWorld.getComponent(entityId, ComponentType.HEALTH);
    if (health) {
      gameWorld.setComponent(entityId, ComponentType.HEALTH, { ...health, current: health.current + 1 });
    }
    const newSlots = rack.slots.map((s, i) =>
      i === idx ? { ...s, chargeXP: newXP - activationCost } : s
    );
    gameWorld.setComponent(entityId, ComponentType.MEDALLION_RACK, { ...rack, slots: newSlots });
  } else {
    const newSlots = rack.slots.map((s, i) =>
      i === idx ? { ...s, chargeXP: newXP } : s
    );
    gameWorld.setComponent(entityId, ComponentType.MEDALLION_RACK, { ...rack, slots: newSlots });
  }
}

/**
 * Standard medallion charging with level-up overflow:
 * - Levels 0–4: level up when XP >= xpToNextLevel[currentLevel], carry over excess.
 *   If the overflow itself would trigger another level-up, keep processing (chain).
 * - Level 5 (max): accumulate toward activationCost. Excess XP above activationCost
 *   is discarded (no further benefit until the ability is activated and the cost resets).
 */
function chargeStandard(
  gameWorld: GameWorld,
  entityId: string,
  idx: number,
  newXP: number
): void {
  const rack = gameWorld.getComponent(entityId, ComponentType.MEDALLION_RACK);
  if (!rack) return;

  const slot = rack.slots[idx];
  if (!slot) return;

  let level = slot.level;
  let xp = newXP;

  if (level < MAX_MEDALLION_LEVEL) {
    // Process level-ups, carrying overflow forward
    let threshold = getMedallionXpThreshold(slot.kind, level);
    while (level < MAX_MEDALLION_LEVEL && xp >= threshold) {
      xp -= threshold;
      level += 1;
      threshold = getMedallionXpThreshold(slot.kind, level);
    }

    // At max level now: cap at activationCost, discard excess
    if (level === MAX_MEDALLION_LEVEL) {
      const activationCost = getMedallionActivationCost(slot.kind);
      xp = Math.min(xp, activationCost);
    }
  } else {
    // Already at max level: accumulate toward activationCost, discard excess
    const activationCost = getMedallionActivationCost(slot.kind);
    xp = Math.min(xp, activationCost);
  }

  const newSlots = rack.slots.map((s, i) =>
    i === idx ? { ...s, level, chargeXP: xp } : s
  );
  gameWorld.setComponent(entityId, ComponentType.MEDALLION_RACK, { ...rack, slots: newSlots });
}
