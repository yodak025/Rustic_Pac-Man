/**
 * GameWorldContext - Provides access to game engine commands
 * 
 * This context exposes command methods that React components can call
 * to control the game engine (pause, resume, restart, exit).
 * 
 * Commands execute synchronously and modify the GameWorld state.
 * State changes are then synced to HotState for React rendering.
 */

import { createContext, useContext } from 'react';
import type { GameWorld } from '@core/GameWorld';

export interface GameWorldContextValue {
  /** Access to GameWorld (for debug tools only, not for general use) */
  gameWorld: GameWorld | null;
  
  /** Start a new game (load maze and initialize entities) - async */
  startNewGame: () => Promise<void>;
  
  /** Begin playing the game (start game loop after assets loaded) */
  beginGame: () => void;
  
  /** Pause the game */
  pauseGame: () => void;
  
  /** Resume the game */
  resumeGame: () => void;
  
  /** Restart the current level */
  restartGame: () => Promise<void>;
  
  /** Start restarting current level (triggers LOADING_GAME view) */
  startRestartLevel: () => void;
  
  /** Exit to main menu */
  exitToMenu: () => void;
  
  /** Start loading next level (called from VictoryScreen) */
  startNextLevel: () => void;
  
  /** Load next level (internal, used by GameApp) */
  loadNextLevel: (autoStart: boolean) => Promise<void>;
}

const GameWorldContext = createContext<GameWorldContextValue | null>(null);

export const GameWorldProvider = GameWorldContext.Provider;

/**
 * Hook to access game engine commands from React components
 */
export function useGameWorldContext(): GameWorldContextValue {
  const context = useContext(GameWorldContext);
  
  if (!context) {
    throw new Error('useGameWorldContext must be used within GameWorldProvider');
  }
  
  return context;
}

export default GameWorldContext;
