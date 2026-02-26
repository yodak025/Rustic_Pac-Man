/**
 * Hot State - Zustand store for React rendering
 * 
 * This store contains a snapshot of the game state that React components
 * can subscribe to for reactive updates. It is synchronized from GameWorld
 * once per frame by the SyncToHotStateSystem.
 * 
 * IMPORTANT:
 * - This store is READ-ONLY for React components (except sync action)
 * - The sync action should ONLY be called by SyncToHotStateSystem
 * - For writing game state, use GameWorld via GameWorldContext (debug only)
 * 
 * @see /docs/ECS_ARCHITECTURE_DESIGN.md for architecture details
 */

import { create } from 'zustand';
import { Direction, BehaviorMode } from '@custom-types/gameComponents';
import GameStatus from '@custom-types/gameStatus';
import type { PositionKey } from '@custom-types/componentTypes';
import * as gameDefaults from '@config/gameDefaults.json';

// ============================================================================
// GHOST RENDER STATE
// ============================================================================

export interface GhostRenderState {
  position: { x: number; y: number };
  mode: BehaviorMode;
  direction: Direction | null;
  timer: {
    elapsed: number;
    interval: number;
  };
}

// ============================================================================
// ECHO RENDER STATE
// ============================================================================

export interface EchoRenderState {
  position: { x: number; y: number };
  mode: BehaviorMode;
  direction: Direction | null;
  collectedScore: number;
  timer: {
    elapsed: number;
    interval: number;
  };
}

// ============================================================================
// PACMAN RENDER STATE
// ============================================================================

export interface PacmanRenderState {
  position: { x: number; y: number };
  health: number;
  isInvulnerable: boolean;
  direction: Direction | null;
}

// ============================================================================
// MAZE RENDER STATE
// ============================================================================

export interface MazeRenderState {
  isLoaded: boolean;
  walls: Set<PositionKey>;
  floorTiles: Set<PositionKey>;  // Static floor positions (never updated after init)
  pacDots: Set<PositionKey>;
  powerPellets: Set<PositionKey>;
  pacDotsCollected: number;
  pacDotsTotal: number;
  powerPelletsTotal: number;
}

// ============================================================================
// GAME RENDER STATE
// ============================================================================

export interface GameRenderState {
  status: GameStatus;
  score: number;
  level: number;
}

// ============================================================================
// FULL HOT STATE INTERFACE
// ============================================================================

export interface HotState {
  // Entity states
  pacman: PacmanRenderState;
  ghosts: {
    blinky: GhostRenderState;
    pinky: GhostRenderState;
    inky: GhostRenderState;
    clyde: GhostRenderState;
  };
  echos: Map<string, EchoRenderState>; // Dynamic map of echo entities

  // Maze state
  maze: MazeRenderState;

  // Game state
  game: GameRenderState;

  // Sync action (called by SyncToHotStateSystem at end of each frame)
  sync: (partial: Partial<HotStateSyncPayload>) => void;

  // Initialize floor tiles (called once after maze loads, never updated)
  initializeFloorTiles: (floorPositions: Set<PositionKey>) => void;

  // Reset action (called when game restarts)
  reset: () => void;
}

// ============================================================================
// SYNC PAYLOAD TYPE (what can be synced)
// ============================================================================

export interface HotStateSyncPayload {
  pacman: Partial<PacmanRenderState>;
  ghosts: Partial<{
    blinky: Partial<GhostRenderState>;
    pinky: Partial<GhostRenderState>;
    inky: Partial<GhostRenderState>;
    clyde: Partial<GhostRenderState>;
  }>;
  echos: Map<string, EchoRenderState>;
  maze: Partial<MazeRenderState>;
  game: Partial<GameRenderState>;
}

// ============================================================================
// INITIAL STATE FACTORY (from config)
// ============================================================================

function createInitialPacmanState(): PacmanRenderState {
  return {
    position: { ...gameDefaults.pacman.initialPosition },
    health: gameDefaults.pacman.initialHealth,
    isInvulnerable: false,
    direction: null,
  };
}

function createInitialGhostState(): GhostRenderState {
  return {
    position: { x: 0, y: 0 },
    mode: BehaviorMode.HOUSE,
    direction: null,
    timer: {
      elapsed: 0,
      interval: 100,
    },
  };
}

function createInitialMazeState(): MazeRenderState {
  return {
    isLoaded: false,
    walls: new Set(),
    floorTiles: new Set(),
    pacDots: new Set(),
    powerPellets: new Set(),
    pacDotsCollected: 0,
    pacDotsTotal: 0,
    powerPelletsTotal: 0,
  };
}

function createInitialGameState(): GameRenderState {
  return {
    status: GameStatus.LOADING,
    score: gameDefaults.game.initialScore,
    level: gameDefaults.game.initialLevel,
  };
}

function createInitialGhostsState() {
  return {
    blinky: createInitialGhostState(),
    pinky: createInitialGhostState(),
    inky: createInitialGhostState(),
    clyde: createInitialGhostState(),
  };
}

// ============================================================================
// STORE CREATION
// ============================================================================

export const useHotState = create<HotState>((set) => ({
  // Initial entity states
  pacman: createInitialPacmanState(),
  ghosts: createInitialGhostsState(),
  echos: new Map<string, EchoRenderState>(), // Start with empty map

  // Initial maze state
  maze: createInitialMazeState(),

  // Initial game state
  game: createInitialGameState(),

  // Sync action - merges partial state updates
  sync: (partial) => set((state) => {
    const newState: Partial<HotState> = {};

    // Sync pacman if provided
    if (partial.pacman) {
      newState.pacman = { ...state.pacman, ...partial.pacman };
    }

    // Sync ghosts if provided
    if (partial.ghosts) {
      newState.ghosts = {
        blinky: partial.ghosts.blinky
          ? { ...state.ghosts.blinky, ...partial.ghosts.blinky }
          : state.ghosts.blinky,
        pinky: partial.ghosts.pinky
          ? { ...state.ghosts.pinky, ...partial.ghosts.pinky }
          : state.ghosts.pinky,
        inky: partial.ghosts.inky
          ? { ...state.ghosts.inky, ...partial.ghosts.inky }
          : state.ghosts.inky,
        clyde: partial.ghosts.clyde
          ? { ...state.ghosts.clyde, ...partial.ghosts.clyde }
          : state.ghosts.clyde,
      };
    }

    // Sync echos if provided (replace entire map)
    if (partial.echos) {
      newState.echos = new Map(partial.echos);
    }

    // Sync maze if provided
    if (partial.maze) {
      newState.maze = { ...state.maze, ...partial.maze };
    }

    // Sync game if provided
    if (partial.game) {
      newState.game = { ...state.game, ...partial.game };
    }

    return newState;
  }),

  // Initialize floor tiles - called once after maze loads
  initializeFloorTiles: (floorPositions) => set((state) => ({
    maze: {
      ...state.maze,
      floorTiles: floorPositions
    }
  })),

  // Reset action - returns to initial state using factory functions
  reset: () => set({
    pacman: createInitialPacmanState(),
    ghosts: createInitialGhostsState(),
    echos: new Map<string, EchoRenderState>(),
    maze: createInitialMazeState(),
    game: createInitialGameState(),
  }),
}));

// ============================================================================
// SELECTOR HOOKS (for optimized subscriptions)
// ============================================================================

/**
 * Select pacman state
 */
export const usePacmanHotState = () => useHotState((state) => state.pacman);

/**
 * Select a specific ghost's state
 */
export const useGhostHotState = (ghostId: 'blinky' | 'pinky' | 'inky' | 'clyde') =>
  useHotState((state) => state.ghosts[ghostId]);

/**
 * Select all ghosts state
 */
export const useGhostsHotState = () => useHotState((state) => state.ghosts);

/**
 * Select all echos state
 */
export const useEchosHotState = () => useHotState((state) => state.echos);

/**
 * Select maze state
 */
export const useMazeHotState = () => useHotState((state) => state.maze);

/**
 * Select game state
 */
export const useGameHotState = () => useHotState((state) => state.game);

/**
 * Select game status only
 */
export const useGameStatus = () => useHotState((state) => state.game.status);

/**
 * Select score only
 */
export const useScore = () => useHotState((state) => state.game.score);

/**
 * Select level only
 */
export const useLevel = () => useHotState((state) => state.game.level);
