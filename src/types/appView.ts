/**
 * AppView - UI orchestration states for the React application
 * 
 * These values control which screen/view is displayed to the user.
 * They are managed by React components and represent application-level
 * navigation, NOT game engine state.
 */

enum AppView {
  LOADING_PYODIDE = "LOADING_PYODIDE",
  MAIN_MENU = "MAIN_MENU",
  TUTORIAL = "TUTORIAL",
  DEBUG_MAZE_ANALYZER = "DEBUG_MAZE_ANALYZER",
  LOADING_GAME = "LOADING_GAME",
  GAME_CANVAS = "GAME_CANVAS",
}

export default AppView;
