/**
 * Dash Energy System
 *
 * PHASE: MOVEMENT (runs before dashSystem each frame)
 * RESPONSIBILITY: Decrement dash timers using real elapsed time, restore speed on expiry
 *
 * Both timers use milliseconds and are decremented by deltaTime each frame, keeping
 * the dash duration and cooldown framerate-independent — consistent with how
 * continuousMovementSystem drives Chomp's movement.
 *
 * Each frame this system:
 * 1. Decrements dashTimeRemaining by deltaTime (if > 0).
 *    - When it reaches 0: restores MOVEMENT_SPEED.current to base * PLAYER_STATS.speedMultiplier
 *      so the SPEED medallion passive bonus is preserved after the dash expires.
 *    - Sets isDashing = false.
 * 2. Decrements cooldownTimeRemaining by deltaTime independently (if > 0).
 *    Both timers start simultaneously on dash activation (see dashSystem.ts),
 *    so cooldownTimeRemaining always expires after dashTimeRemaining.
 *
 * Wall impact during dash: continuousMovementSystem naturally clamps Chomp against
 * walls, so the player halts until dashTimeRemaining hits 0. With a short durationMs
 * this reads as a sharp, snappy stop rather than a bug.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';

export function dashEnergySystem(gameWorld: GameWorld, deltaTime: number): void {
  const dashState = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE);
  if (!dashState) return;

  let { isDashing, dashTimeRemaining, cooldownTimeRemaining } = dashState;

  // --- Boost timer ---
  if (dashTimeRemaining > 0) {
    dashTimeRemaining = Math.max(0, dashTimeRemaining - deltaTime);

    if (dashTimeRemaining === 0) {
      // Boost expired — restore speed using PLAYER_STATS so the SPEED medallion
      // passive multiplier is honoured rather than blindly resetting to raw base.
      const movementSpeed = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_SPEED);
      const playerStats = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_STATS);

      if (movementSpeed && playerStats) {
        gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_SPEED, {
          ...movementSpeed,
          current: movementSpeed.base * playerStats.speedMultiplier,
        });
      }

      isDashing = false;
    }
  }

  // --- Cooldown timer (independent — always counts down regardless of boost state) ---
  if (cooldownTimeRemaining > 0) {
    cooldownTimeRemaining = Math.max(0, cooldownTimeRemaining - deltaTime);
  }

  // Write back only if something changed
  if (
    dashState.dashTimeRemaining !== dashTimeRemaining ||
    dashState.cooldownTimeRemaining !== cooldownTimeRemaining ||
    dashState.isDashing !== isDashing
  ) {
    gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE, {
      ...dashState,
      isDashing,
      dashTimeRemaining,
      cooldownTimeRemaining,
    });
  }
}
