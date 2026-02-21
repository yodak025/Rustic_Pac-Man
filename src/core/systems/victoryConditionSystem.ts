/**
 * Victory Condition System
 * 
 * PHASE: GAME STATE (6)
 * RESPONSIBILITY: Check if player reached end of maze
 */

import type { GameWorld } from '../GameWorld';
import GameStatus from '@custom-types/gameStatus';
import { ComponentType, PACMAN_ENTITY_ID } from '@custom-types/componentTypes';

// TODO: Calculate dynamically from maze dimensions
// Giant maze with 2 layers: ~112 tiles wide (56 per layer)
const MAZE_END_X = 127;

/**
 * Check if player reached the end of the maze (victory condition)
 */
export function victoryConditionSystem(gameWorld: GameWorld): void {
  const gameState = gameWorld.getGameState();

  // Only check victory condition when actively playing
  if (gameState.status !== GameStatus.PLAYING) return;

  const pacmanPosition = gameWorld.getComponent(PACMAN_ENTITY_ID, ComponentType.DISCRETE_POSITION);

  if (!pacmanPosition) return;

  // Player wins when reaching the right end of the maze
  if (pacmanPosition.x >= MAZE_END_X) {
    gameWorld.setGameStatus(GameStatus.WON);
  }
}
