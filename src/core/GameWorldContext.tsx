'use client';

/**
 * GameWorld React Context
 * 
 * Provides access to the GameWorld (Cold State) for React components.
 * 
 * USAGE:
 * - Debug tools: Can read and write to GameWorld for inspection/modification
 * - Regular components: Should NOT use this directly - use useHotState instead
 * 
 * The GameWorld is the source of truth for game logic. React components
 * receive a synced snapshot via useHotState (synced once per frame).
 * 
 * @see /docs/ECS_ARCHITECTURE_DESIGN.md for architecture details
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import type { GameWorld } from './GameWorld';

// ============================================================================
// CONTEXT
// ============================================================================

const GameWorldContext = createContext<GameWorld | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export interface GameWorldProviderProps {
  gameWorld: GameWorld;
  children: ReactNode;
}

/**
 * Provider component that makes GameWorld available to the component tree
 */
export const GameWorldProvider: React.FC<GameWorldProviderProps> = ({ 
  gameWorld, 
  children 
}) => {
  return (
    <GameWorldContext.Provider value={gameWorld}>
      {children}
    </GameWorldContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access the GameWorld instance
 * 
 * WARNING: This should only be used by debug tools and development utilities.
 * Regular game components should use useHotState for reactive updates.
 * 
 * @throws Error if used outside of GameWorldProvider
 */
export const useGameWorld = (): GameWorld => {
  const ctx = useContext(GameWorldContext);
  
  if (!ctx) {
    throw new Error(
      'useGameWorld must be used within a GameWorldProvider. ' +
      'Make sure GameWorldProvider is an ancestor of this component.'
    );
  }
  
  return ctx;
};

/**
 * Hook to optionally access the GameWorld instance
 * Returns null if not within a GameWorldProvider
 * 
 * Useful for components that can work with or without GameWorld access
 */
export const useGameWorldOptional = (): GameWorld | null => {
  return useContext(GameWorldContext);
};

// ============================================================================
// EXPORTS
// ============================================================================

export { GameWorldContext };
