/**
 * Super Dash System
 * 
 * PHASE: EFFECTS
 * RESPONSIBILITY: Power-Up PoC — execute a Super Dash when the essence bar is full
 * 
 * Conditions:
 * - essenceBar.activePowerUp === PowerUpKind.SUPER_DASH
 * - essenceBar.current >= essenceBar.max
 * - PlayerAbilityInput.dash is true (reuses the dash action)
 * 
 * Effect:
 * - Teleport Chomp to the farthest reachable tile in the current direction
 *   (unlimited distance, stops one tile before the first wall/house)
 * - Clear activePowerUp and reset current to 0
 * 
 * Note: Regular dashSystem runs first in MOVEMENT phase. This system fires in
 * EFFECTS phase so it only activates when the power-up is explicitly loaded
 * and the bar is at max — it is independent of dash energy.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import { Direction, PowerUpKind } from '@custom-types/gameComponents';

const MAX_SCAN_TILES = 256; // Safety cap to avoid infinite loops

function directionVector(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case Direction.UP:    return { dx: 0, dy: -1 };
    case Direction.DOWN:  return { dx: 0, dy:  1 };
    case Direction.LEFT:  return { dx: -1, dy: 0 };
    case Direction.RIGHT: return { dx:  1, dy: 0 };
    default:              return { dx: 0, dy: 0 };
  }
}

export function superDashSystem(gameWorld: GameWorld): void {
  const abilityInput = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_ABILITY_INPUT);
  if (!abilityInput?.dash) return;

  const essenceBar = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.ESSENCE_BAR);
  if (!essenceBar) return;
  if (essenceBar.activePowerUp !== PowerUpKind.SUPER_DASH) return;
  if (essenceBar.current < essenceBar.max) return;

  const playerIntent = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_INTENT);
  const dir = playerIntent?.lastValidDirection;
  if (!dir) return;

  const pos = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.CONTINUOUS_POSITION);
  if (!pos) return;

  const { dx, dy } = directionVector(dir);
  const tileX = Math.round(pos.x);
  const tileY = Math.round(pos.y);
  let landX = tileX;
  let landY = tileY;

  for (let i = 1; i <= MAX_SCAN_TILES; i++) {
    const nextX = tileX + dx * i;
    const nextY = tileY + dy * i;
    if (gameWorld.isWallAt(nextX, nextY) || gameWorld.isHouseAt(nextX, nextY)) {
      break;
    }
    landX = nextX;
    landY = nextY;
  }

  // Teleport
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.CONTINUOUS_POSITION, { x: landX, y: landY });
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.DISCRETE_POSITION, { x: landX, y: landY });

  // Mark as dashing (visual feedback)
  const dashState = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE);
  if (dashState) {
    gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE, {
      ...dashState,
      isDashing: true
    });
  }

  // Consume the power-up
  gameWorld.setComponent(PACMAN_ENTITY_ID, ComponentType.ESSENCE_BAR, {
    ...essenceBar,
    current: 0,
    activePowerUp: null
  });
}
