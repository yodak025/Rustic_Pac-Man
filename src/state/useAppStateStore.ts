/**
 * App State Store - React application orchestration state
 *
 * This store manages UI-level navigation and application state.
 * It controls which screen is displayed (main menu, tutorial, game canvas, etc.)
 * but does NOT control game engine state (playing, paused, won, lost).
 *
 * RESPONSIBILITIES:
 * - UI routing and view transitions
 * - Application loading states (Pyodide, engine initialization)
 * - Debug tool visibility
 *
 * NOT RESPONSIBLE FOR:
 * - Game state (score, level) - see GameWorld
 * - Game status (playing, paused) - see GameWorld → HotState
 * - Entity states - see GameWorld → HotState
 */

import { create } from "zustand";
import AppView from "@custom-types/appView";

interface AppStateStore {
  /** Current view/screen being displayed */
  view: AppView;

  /** Whether Pyodide has finished loading */
  isPyodideReady: boolean;

  /** Whether game engine has been initialized */
  isEngineReady: boolean;

  /** Whether currently transitioning between levels */
  isLevelTransition: boolean;

  /** Whether currently restarting the current level */
  isRestarting: boolean;

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════

  /** Set the current view */
  setView: (view: AppView) => void;

  /** Mark Pyodide as ready */
  setPyodideReady: (ready: boolean) => void;

  /** Mark engine as ready */
  setEngineReady: (ready: boolean) => void;

  /** Mark level transition state */
  setIsLevelTransition: (isTransition: boolean) => void;

  /** Mark restart state */
  setIsRestarting: (isRestarting: boolean) => void;

  /** Navigate to main menu */
  goToMainMenu: () => void;

  /** Navigate to game (starts loading) */
  goToGame: () => void;

  /** Show game canvas (after loading complete) */
  showGameCanvas: () => void;

  /** Navigate to tutorial */
  goToTutorial: () => void;

  /** Navigate to debug maze analyzer */
  goToDebugMazeAnalyzer: () => void;

  /** Reset app state (for cleanup) */
  reset: () => void;
}

const useAppStateStore = create<AppStateStore>((set) => ({
  view: AppView.LOADING_PYODIDE,
  isPyodideReady: false,
  isEngineReady: false,
  isLevelTransition: false,
  isRestarting: false,

  setView: (view) => set({ view }),

  setPyodideReady: (ready) => set({ isPyodideReady: ready }),

  setEngineReady: (ready) => set({ isEngineReady: ready }),

  setIsLevelTransition: (isTransition) =>
    set({ isLevelTransition: isTransition }),

  setIsRestarting: (isRestarting) => set({ isRestarting: isRestarting }),

  goToMainMenu: () => set({ view: AppView.MAIN_MENU }),

  goToGame: () => set({ view: AppView.LOADING_GAME }),

  showGameCanvas: () => set({ view: AppView.GAME_CANVAS }),

  goToTutorial: () => set({ view: AppView.TUTORIAL }),

  goToDebugMazeAnalyzer: () => set({ view: AppView.DEBUG_MAZE_ANALYZER }),

  reset: () =>
    set({
      view: AppView.MAIN_MENU,
      isPyodideReady: false,
      isEngineReady: false,
      isLevelTransition: false,
      isRestarting: false,
    }),
}));

export default useAppStateStore;
