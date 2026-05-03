/**
 * Dash System
 *
 * PHASE: MOVEMENT (runs after dashEnergySystem, before continuousMovementSystem)
 * RESPONSIBILITY: Activate a speed-boost dash for the player
 *
 * When PlayerAbilityInput.dash is true and the dash is ready (cooldownTimeRemaining === 0)
 * and the player has enough energy:
 * - Consume costPerDash energy from DashState
 * - Set dashTimeRemaining to durationMs
 * - Set cooldownTimeRemaining to durationMs + cooldownMs (starts counting from activation,
 *   so the cooldown window always begins at the same moment as the boost)
 * - Multiply MOVEMENT_SPEED.current by speedMultiplier
 * - Set isDashing = true
 * - Grant invulnerability for the duration of the boost (ceil(durationMs / movementInterval) ticks)
 *
 * dashEnergySystem is responsible for decrementing both timers each frame using real
 * deltaTime (ms), and for restoring MOVEMENT_SPEED.current when dashTimeRemaining hits 0.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import gameDefaults from '@config/gameDefaults.json';

const DASH_CFG = gameDefaults.abilities.dash;
// Invulnerability is tick-based (one tick per movementInterval ms).
// Grant enough ticks to cover the full boost duration.
const DASH_INVULNERABILITY_TICKS = Math.ceil(
  DASH_CFG.durationMs / gameDefaults.pacman.movementInterval
);

export function dashSystem(gameWorld: GameWorld): void {
  const abilityInput = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_ABILITY_INPUT);
  if (!abilityInput?.dash) return;

  const dashState = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE);
  if (!dashState) return;

  // Not ready: still on cooldown or boost already active
  if (dashState.cooldownTimeRemaining > 0 || dashState.dashTimeRemaining > 0) return;

  // Not enough energy
  if (dashState.energy < DASH_CFG.costPerDash) return;

  const movementSpeed = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_SPEED);
  if (!movementSpeed) return;

  // Activate speed boost
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_SPEED, {
    ...movementSpeed,
    current: movementSpeed.current * DASH_CFG.speedMultiplier,
  });

  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE, {
    ...dashState,
    energy: dashState.energy - DASH_CFG.costPerDash,
    isDashing: true,
    dashTimeRemaining: DASH_CFG.durationMs,
    // Cooldown starts at activation: full wait = boost duration + extra cooldown window
    cooldownTimeRemaining: DASH_CFG.durationMs + DASH_CFG.cooldownMs,
  });

  // Grant invulnerability for the duration of the boost.
  // Only increase ticksRemaining — never shorten an existing longer invulnerability window.
  const invulnerability = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.INVULNERABILITY);
  if (invulnerability) {
    gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.INVULNERABILITY, {
      ticksRemaining: Math.max(invulnerability.ticksRemaining, DASH_INVULNERABILITY_TICKS),
    });
  }
}
