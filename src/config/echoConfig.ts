/**
 * Echo Configuration
 * 
 * Configuration constants for Echo entities (enemies).
 * These values control Echo behavior, movement, and AI decision-making.
 */

// ============================================================================
// SINUSOID ECHO CONFIGURATION
// ============================================================================

/**
 * Sinusoid Echo - The basic wandering enemy
 * 
 * Behavior:
 * - IDLE: Stands still for a duration
 * - SCATTER: Wanders randomly at slow speed
 * - CHASE: Pursues Chomp when within agro range
 * - FRIGHTEN: Flees from Chomp when PowerPellet is active
 * - EATEN: Remains stationary after being caught
 */
export const SINUSOID_CONFIG = {
  // ──────────────────────────────────────────────────────────────────────────
  // AGRO DISTANCES (in tiles)
  // ──────────────────────────────────────────────────────────────────────────

  /** Distance at which Echo enters CHASE mode (starts pursuing Chomp) */
  AGRO_TRIGGER_DISTANCE: 8,

  /** Distance at which Echo exits CHASE mode (returns to SCATTER) */
  AGRO_COOL_DISTANCE: 8,

  /** 
   * Distance threshold for FRIGHTEN behavior:
   * - If Chomp is closer than this: flee actively
   * - If Chomp is farther than this: wander at high speed
   */
  FRIGHTEN_EXIT_DISTANCE: 8,

  // ──────────────────────────────────────────────────────────────────────────
  // IDLE BEHAVIOR
  // ──────────────────────────────────────────────────────────────────────────

  /** 
   * Probability of entering IDLE state on each movement decision 
   * 0.005 = 0.5% chance per tick
   */
  IDLE_PROBABILITY: 0.005,

  /** Duration of IDLE state in ticks (at 60fps, 50 ticks ≈ 0.83 seconds) */
  IDLE_DURATION_TICKS: 50,

  // ──────────────────────────────────────────────────────────────────────────
  // FRIGHTENED BEHAVIOR
  // ──────────────────────────────────────────────────────────────────────────

  /** Duration of FRIGHTENED state in ticks (testing with 30 ticks ≈ 0.5 seconds) */
  FRIGHTENED_DURATION_TICKS: 30,

  // ──────────────────────────────────────────────────────────────────────────
  // MOVEMENT SPEEDS
  // ──────────────────────────────────────────────────────────────────────────

  /** 
   * Speed multipliers (relative to base speed)
   * Base speed is defined in gameDefaults.json
   */
  SPEED_SCATTER: 0.6,    // Very slow wandering
  SPEED_CHASE: 1.1,      // Slightly faster than Chomp
  SPEED_FRIGHTEN: 2,   // Much faster when fleeing

  // ──────────────────────────────────────────────────────────────────────────
  // TIMING
  // ──────────────────────────────────────────────────────────────────────────

  /** Movement interval in milliseconds (same as ghosts for consistency) */
  MOVEMENT_INTERVAL: 200,

  // ──────────────────────────────────────────────────────────────────────────
  // SCORING
  // ──────────────────────────────────────────────────────────────────────────

  /** Base points awarded when Echo is eaten (before adding collected score) */
  BASE_POINTS_ON_EATEN: 200,
} as const;

// ============================================================================
// FUTURE ECHO TYPES (placeholders for extensibility)
// ============================================================================

/*
export const RESONANCE_CONFIG = {
  // TODO: Define config for Resonance Echo type
} as const;

export const HARMONIC_CONFIG = {
  // TODO: Define config for Harmonic Echo type
} as const;
*/
