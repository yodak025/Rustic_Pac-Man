/**
 * Medallion Activate System
 *
 * PHASE: EFFECTS (runs after collectionEffectSystem)
 * RESPONSIBILITY: Trigger the active ability of the currently selected medallion
 *                 when the player presses the activate key ('.').
 *
 * Gate conditions (all must pass):
 *   1. PlayerAbilityInput.activateAbility is true.
 *   2. Selected slot exists.
 *   3. slot.level === 5 (max level).
 *   4. slot.chargeXP >= activationCost for that medallion kind.
 *
 * NOTE: HEALTH medallion is excluded here — it auto-activates in collectionEffectSystem.
 *
 * On activation:
 *   - Reset slot.chargeXP to 0.
 *   - For timed actives (STEALTH, SPEED): set ACTIVE_ABILITY_TIMER component.
 *   - For instant actives (SHOUT, ESSENCE): apply effect immediately.
 *   - For VISION (bird's-eye): set ACTIVE_ABILITY_TIMER with ticksRemaining = -1
 *     (lasts until player moves — cancelled in playerAttributeSystem on movement).
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import { MedallionKind } from '@custom-types/gameComponents';
import { getMedallionActivationCost, MEDALLION_ATTRIBUTES } from '@config/medallionAttributes';

const MAX_MEDALLION_LEVEL = 5;

export function medallionActivateSystem(gameWorld: GameWorld): void {
  const abilityInput = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_ABILITY_INPUT);
  if (!abilityInput?.activateAbility) return;

  const rack = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.MEDALLION_RACK);
  if (!rack || rack.slots.length === 0) return;

  const slot = rack.slots[rack.selectedIndex];
  if (!slot) return;

  // HEALTH auto-activates in collectionEffectSystem — skip here
  if (slot.kind === MedallionKind.HEALTH) return;

  // Require max level
  if (slot.level < MAX_MEDALLION_LEVEL) return;

  // Require full charge
  const activationCost = getMedallionActivationCost(slot.kind);
  if (slot.chargeXP < activationCost) return;

  // Consume charge
  const newSlots = rack.slots.map((s, i) =>
    i === rack.selectedIndex ? { ...s, chargeXP: 0 } : s
  );
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.MEDALLION_RACK, {
    ...rack,
    slots: newSlots
  });

  // Fire active ability
  switch (slot.kind) {
    case MedallionKind.STEALTH:  activateStealth(gameWorld);  break;
    case MedallionKind.VISION:   activateVision(gameWorld);   break;
    case MedallionKind.SHOUT:    activateShout(gameWorld);    break;
    case MedallionKind.SPEED:    activateSpeed(gameWorld);    break;
    case MedallionKind.ESSENCE:  activateEssence(gameWorld);  break;
  }
}

// ── Implementations ──────────────────────────────────────────────────────────

/**
 * STEALTH active: drastically reduce detection radius for stealthActiveDurationTicks.
 */
function activateStealth(gameWorld: GameWorld): void {
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.ACTIVE_ABILITY_TIMER, {
    kind: MedallionKind.STEALTH,
    ticksRemaining: MEDALLION_ATTRIBUTES.stealthActiveDurationTicks,
    directionAtActivation: null,
  });
}

/**
 * VISION active: bird's-eye view until the player presses a new direction.
 * ticksRemaining = -1 signals indefinite duration.
 * directionAtActivation snapshots the current lastValidDirection so
 * playerAttributeSystem can detect when the player has actually moved.
 */
function activateVision(gameWorld: GameWorld): void {
  const playerIntent = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_INTENT);
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.ACTIVE_ABILITY_TIMER, {
    kind: MedallionKind.VISION,
    ticksRemaining: -1,
    directionAtActivation: playerIntent?.lastValidDirection ?? null,
  });
}

/**
 * SHOUT active: instantly grant 1 White Noise Ball.
 */
function activateShout(gameWorld: GameWorld): void {
  const wnbStock = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.WNB_STOCK);
  if (wnbStock) {
    gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.WNB_STOCK, {
      count: wnbStock.count + 1
    });
  }
}

/**
 * SPEED active: extreme speed boost for speedActiveDurationTicks.
 */
function activateSpeed(gameWorld: GameWorld): void {
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.ACTIVE_ABILITY_TIMER, {
    kind: MedallionKind.SPEED,
    ticksRemaining: MEDALLION_ATTRIBUTES.speedActiveDurationTicks,
    directionAtActivation: null,
  });
}

/**
 * ESSENCE active: fill the essence bar to maximum.
 */
function activateEssence(gameWorld: GameWorld): void {
  const essenceBar = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.ESSENCE_BAR);
  if (essenceBar) {
    gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.ESSENCE_BAR, {
      ...essenceBar,
      current: essenceBar.max
    });
  }
}
