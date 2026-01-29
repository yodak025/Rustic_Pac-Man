/**
 * Sync To Hot State System
 * 
 * PHASE: SYNC_TO_HOT_STATE
 * RESPONSIBILITY: Synchronize GameWorld data to Zustand Hot State for React rendering
 * 
 * This system runs once per frame at the end of the game loop.
 * It copies necessary data from GameWorld (Cold State) to useHotState (Hot State)
 * for React components to render.
 * 
 * Phase 3: Only syncs Pacman data. Ghosts still use legacy stores.
 */

import type { GameWorld } from '@core/GameWorld';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';
import { useHotState } from '@state/useHotState';
import type {
  ContinuousPosition,
  Health,
  Invulnerability,
  PlayerIntent
} from '@custom-types/components';

/**
 * Sync Pacman data from GameWorld to Hot State
 * 
 * @param gameWorld - The ECS world
 */
export function syncToHotStateSystem(gameWorld: GameWorld): void {
  // Get Pacman components from GameWorld
  const position = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.CONTINUOUS_POSITION);
  const health = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.HEALTH);
  const invulnerability = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.INVULNERABILITY);
  const playerIntent = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_INTENT);

  // Build sync payload for Pacman
  const syncPayload: any = {};

  if (position || health || invulnerability || playerIntent) {
    syncPayload.pacman = {};

    if (position) {
      syncPayload.pacman.position = { x: position.x, y: position.y };
    }

    if (health) {
      syncPayload.pacman.health = health.current;
    }

    if (invulnerability) {
      syncPayload.pacman.isInvulnerable = invulnerability.ticksRemaining > 0;
    }

    if (playerIntent && playerIntent.lastValidDirection) {
      syncPayload.pacman.direction = playerIntent.lastValidDirection;
    }
  }

  // Sync to Hot State if there's data to sync
  if (Object.keys(syncPayload).length > 0) {
    useHotState.getState().sync(syncPayload);
  }
}
