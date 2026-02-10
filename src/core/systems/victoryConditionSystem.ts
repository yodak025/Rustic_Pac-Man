/**
 * Victory Condition System
 * 
 * PHASE: GAME STATE (6)
 * RESPONSIBILITY: Check if all pac-dots collected
 */

import type { GameWorld } from '../GameWorld';
import GameStatus from '@custom-types/gameStatus';

/**
 * Check if all pac-dots have been collected (victory condition)
 */
export function victoryConditionSystem(gameWorld: GameWorld): void {
  const mazeInfo = gameWorld.getMazeInfo();

  if (mazeInfo.pacDots.current >= mazeInfo.pacDots.total) {
    gameWorld.setGameStatus(GameStatus.WON);
  }
}
