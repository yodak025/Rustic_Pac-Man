/**
 * Player Attribute System
 *
 * PHASE: PRE-UPDATE (runs at the start of the game loop, before movement/ability systems)
 * RESPONSIBILITY:
 *   1. Derive PLAYER_STATS from the current MEDALLION_RACK levels.
 *   2. Apply passive attribute side-effects (MOVEMENT_SPEED, DASH_STATE.maxEnergy).
 *   3. Apply active ability overrides when ACTIVE_ABILITY_TIMER is running.
 *   4. Decrement ACTIVE_ABILITY_TIMER each frame; remove it when expired.
 *   5. Cancel VISION active if the player has moved (ticksRemaining === -1 guard).
 *
 * Each medallion kind maps to one attribute scalar. The system reads the medallion
 * level (0–5) and looks up the corresponding value in MEDALLION_ATTRIBUTES.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import { MedallionKind } from '@custom-types/gameComponents';
import { MEDALLION_ATTRIBUTES } from '@config/medallionAttributes';

// ============================================================================
// HELPERS
// ============================================================================

/** Returns the level of a specific medallion kind, or 0 if not in the rack. */
function getMedallionLevel(rack: { slots: { kind: MedallionKind; level: number }[] }, kind: MedallionKind): number {
  const slot = rack.slots.find(s => s.kind === kind);
  return slot ? slot.level : 0;
}

// ============================================================================
// SYSTEM
// ============================================================================

export function playerAttributeSystem(gameWorld: GameWorld): void {
  const rack = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.MEDALLION_RACK);
  if (!rack) return;

  const dashState = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE);
  if (!dashState) return;

  const movementSpeed = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_SPEED);
  if (!movementSpeed) return;

  // Read medallion levels
  const stealthLevel  = getMedallionLevel(rack, MedallionKind.STEALTH);
  const visionLevel   = getMedallionLevel(rack, MedallionKind.VISION);
  const shoutLevel    = getMedallionLevel(rack, MedallionKind.SHOUT);
  const speedLevel    = getMedallionLevel(rack, MedallionKind.SPEED);
  const essenceLevel  = getMedallionLevel(rack, MedallionKind.ESSENCE);

  // Derive base attribute values from scaling table
  let agroRadius       = MEDALLION_ATTRIBUTES.agroRadiusPerLevel[stealthLevel];
  const visionRadius   = MEDALLION_ATTRIBUTES.visionRadiusPerLevel[visionLevel];
  const frightDuration = MEDALLION_ATTRIBUTES.frightDurationPerLevel[shoutLevel];
  let speedMultiplier  = MEDALLION_ATTRIBUTES.speedMultiplierPerLevel[speedLevel];
  const essenceMultiplier = MEDALLION_ATTRIBUTES.essenceMultiplierPerLevel[essenceLevel];
  const dashMaxEnergy  = MEDALLION_ATTRIBUTES.dashMaxEnergyPerLevel[essenceLevel];

  // ── Active ability overrides ──────────────────────────────────────────────
  const activeTimer = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.ACTIVE_ABILITY_TIMER);

  if (activeTimer) {
    switch (activeTimer.kind) {
      case MedallionKind.STEALTH:
        agroRadius = MEDALLION_ATTRIBUTES.agroRadiusActive;
        break;

      case MedallionKind.SPEED:
        speedMultiplier = MEDALLION_ATTRIBUTES.speedMultiplierActive;
        break;

      case MedallionKind.VISION: {
        // Bird's-eye view: cancel when the player presses a new direction after
        // activation. We compare the current lastValidDirection against the
        // snapshot taken at activation time. If they differ, the player has moved.
        const playerIntent = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_INTENT);
        const currentDir = playerIntent?.lastValidDirection ?? null;
        if (currentDir !== activeTimer.directionAtActivation) {
          // Player moved — cancel vision active
          gameWorld.removeComponent(PACMAN_ENTITY_ID, ComponentType.ACTIVE_ABILITY_TIMER);
        }
        break;
      }

      default:
        break;
    }

    // Tick down timed actives (ticksRemaining > 0)
    if (activeTimer.ticksRemaining > 0) {
      const newTicks = activeTimer.ticksRemaining - 1;
      if (newTicks <= 0) {
        gameWorld.removeComponent(PACMAN_ENTITY_ID, ComponentType.ACTIVE_ABILITY_TIMER);
      } else {
        gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.ACTIVE_ABILITY_TIMER, {
          ...activeTimer,
          ticksRemaining: newTicks,
        });
      }
    }
    // ticksRemaining === -1 means indefinite — no countdown
  }

  // ── Write PLAYER_STATS ────────────────────────────────────────────────────
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_STATS, {
    agroRadius,
    visionRadius,
    frightDuration,
    speedMultiplier,
    essenceMultiplier,
    dashMaxEnergy,
  });

  // ── Apply passive side-effects ────────────────────────────────────────────
  // SPEED: update current movement speed — skip if a dash boost is active, since
  // dashSystem has already multiplied current and dashEnergySystem will restore it
  // on expiry using speedMultiplier. Overwriting here would cancel the boost instantly.
  if (!dashState.isDashing) {
    const newSpeed = movementSpeed.base * speedMultiplier;
    if (movementSpeed.current !== newSpeed) {
      gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_SPEED, {
        ...movementSpeed,
        current: newSpeed,
      });
    }
  }

  // ESSENCE: update dash bar max capacity; clamp current energy if it now exceeds new max
  if (dashState.maxEnergy !== dashMaxEnergy) {
    gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE, {
      ...dashState,
      maxEnergy: dashMaxEnergy,
      energy: Math.min(dashState.energy, dashMaxEnergy),
    });
  }
}
