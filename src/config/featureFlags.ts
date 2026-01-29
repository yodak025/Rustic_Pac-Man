/**
 * Feature Flags for Chomp Crawler
 * 
 * These flags control the incremental migration from the legacy architecture
 * to the new ECS architecture. They allow us to:
 * 
 * 1. Develop new features alongside legacy code
 * 2. Toggle between implementations for testing
 * 3. Gradually migrate without breaking the game
 * 
 * MIGRATION PATTERN (Strangler Fig):
 * - New code is built in parallel with legacy
 * - Feature flags control which code path executes
 * - Once new code is stable, legacy is removed
 * 
 * @see /docs/MIGRATION_PLAN.md for migration details
 */

// ============================================================================
// ECS MIGRATION FLAGS
// ============================================================================

/**
 * Master switch for the new ECS architecture
 * 
 * When false (default during migration):
 * - Legacy Zustand stores are used for game logic
 * - GameWorld exists but is not used in the game loop
 * - Useful for development and testing of new infrastructure
 * 
 * When true (after migration complete):
 * - GameWorld is the source of truth
 * - Legacy stores are deprecated
 * - HotState is synced from GameWorld each frame
 */
export const USE_NEW_ECS = false;

/**
 * Enable GameWorld for maze data
 * Phase 1 of migration
 */
export const USE_ECS_MAZE = true;

/**
 * Enable GameWorld for game status and score
 * Phase 2 of migration
 */
export const USE_ECS_GAME_STATUS = true;

/**
 * Enable GameWorld for Pacman entity
 * Phase 3 of migration - CONTINUOUS MOVEMENT MODEL
 */
export const USE_ECS_PACMAN = true;

/**
 * Enable GameWorld for Ghost entities
 * Phase 4 of migration
 */
export const USE_ECS_GHOSTS = false;

/**
 * Enable new collision and effects systems
 * Phase 5 of migration
 */
export const USE_ECS_COLLISIONS = false;

// ============================================================================
// DEBUG FLAGS
// ============================================================================

/**
 * Log GameWorld state to console each frame
 * Useful for debugging the new ECS architecture
 */
export const DEBUG_LOG_GAME_WORLD = false;

/**
 * Show ECS debug panel in the UI
 */
export const DEBUG_SHOW_ECS_PANEL = false;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if any ECS feature is enabled
 */
export function isAnyEcsEnabled(): boolean {
  return (
    USE_NEW_ECS ||
    USE_ECS_MAZE ||
    USE_ECS_GAME_STATUS ||
    USE_ECS_PACMAN ||
    USE_ECS_GHOSTS ||
    USE_ECS_COLLISIONS
  );
}

/**
 * Check if full ECS migration is complete
 */
export function isEcsMigrationComplete(): boolean {
  return (
    USE_NEW_ECS &&
    USE_ECS_MAZE &&
    USE_ECS_GAME_STATUS &&
    USE_ECS_PACMAN &&
    USE_ECS_GHOSTS &&
    USE_ECS_COLLISIONS
  );
}
