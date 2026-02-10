/**
 * GameStatus - Game engine state values
 * 
 * These values represent the internal state of the game engine itself.
 * They are managed by the engine and systems, synchronized to React
 * via HotState for rendering purposes.
 * 
 * This is NOT for UI navigation - see AppView for that.
 */

enum GameStatus {
  /** Engine is loading/initializing */
  LOADING = "LOADING",
  
  /** Engine ready but not actively running game loop */
  READY = "READY",
  
  /** Game loop active, game in progress */
  PLAYING = "PLAYING",
  
  /** Game loop paused by user */
  PAUSED = "PAUSED",
  
  /** Victory condition met */
  WON = "WON",
  
  /** Defeat condition met */
  LOST = "LOST",
}

export default GameStatus;
