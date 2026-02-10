/**
 * State Management Exports
 * 
 * This file exports all Zustand stores used in the application.
 * Legacy stores have been removed - use HotState for game state.
 */

// Modern ECS state
export { useHotState, usePacmanHotState, useGhostHotState, useGhostsHotState, useMazeHotState, useGameHotState } from './useHotState';

// App-level state
export { default as useAppStateStore } from './useAppStateStore';

// Debug/config state
export { default as useDebugConfigStore } from './useDebugConfigStore';
