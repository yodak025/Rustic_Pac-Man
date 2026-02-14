/**
 * Defeat Condition System
 * 
 * PHASE: GAME STATE (6)
 * RESPONSIBILITY: Check if health reaches 0
 */

import type { GameWorld } from '../GameWorld';
import { ComponentType } from '@custom-types/componentTypes';
import type { Health } from '@custom-types/components';
import GameStatus from '@custom-types/gameStatus';

/**
 * Check if player health has reached 0 (defeat condition)
 */
export function defeatConditionSystem(gameWorld: GameWorld): void {
  const gameState = gameWorld.getGameState();
  
  // Only check defeat condition when actively playing
  if (gameState.status !== GameStatus.PLAYING) return;
  
  const playerEntities = gameWorld.query(
    ComponentType.PLAYER_TAG,
    ComponentType.HEALTH
  );

  if (playerEntities.length === 0) {
    console.error('[defeatConditionSystem] No player entity found in GameWorld!');
    return;
  }

  const playerId = playerEntities[0];
  const health = gameWorld.getComponent(
    playerId,
    ComponentType.HEALTH
  ) as Health | undefined;

  if (!health) {
    console.error('[defeatConditionSystem] Player entity missing Health component');
    return;
  }

  if (health.current <= 0) {
    gameWorld.setGameStatus(GameStatus.LOST);
  }
}
