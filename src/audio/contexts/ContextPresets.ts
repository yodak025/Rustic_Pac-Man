import { MusicContext } from '../theory/MusicContext'
import { LEVEL_CONTEXTS } from './LevelContexts'

/**
 * ContextPresets
 *
 * Named, ready-to-use MusicContext instances derived from LEVEL_CONTEXTS.
 *
 * These are the contexts most frequently used by the game logic and the
 * testing sandbox. They are evaluated lazily via getter functions so that
 * Tone.js is not required at module-load time.
 *
 * Usage:
 * ```ts
 * import { ContextPresets } from '@audio/contexts'
 *
 * orchestrator.setLevelContext(ContextPresets.exploration())
 * ```
 *
 * If you need to tweak a preset on the fly, use `.derive()`:
 * ```ts
 * const fast = ContextPresets.chase().derive({ bpm: 180 })
 * ```
 */
export const ContextPresets = {
  /** Low-intensity wandering: A Dorian, 100 BPM, sparse. */
  exploration: () => MusicContext.fromPreset(LEVEL_CONTEXTS.exploration),

  /** Title-screen atmosphere: C Lydian, 80 BPM, very sparse. */
  ambient: () => MusicContext.fromPreset(LEVEL_CONTEXTS.ambient),

  /** Approaching danger: D Aeolian, 120 BPM, medium density. */
  tension: () => MusicContext.fromPreset(LEVEL_CONTEXTS.tension),

  /** Active ghost pursuit: E Phrygian, 148 BPM, dense. */
  chase: () => MusicContext.fromPreset(LEVEL_CONTEXTS.chase),

  /** Power pellet active: G Mixolydian, 138 BPM, dense. */
  powerup: () => MusicContext.fromPreset(LEVEL_CONTEXTS.powerup),

  /** High-difficulty encounter: B HarmonicMinor, 160 BPM, dense. */
  boss: () => MusicContext.fromPreset(LEVEL_CONTEXTS.boss),

  /** Near game-over dread: C PhrygianDominant, 140 BPM, maximum tension. */
  horror: () => MusicContext.fromPreset(LEVEL_CONTEXTS.horror),

  /** Deep maze secrets: F LydianFlat7, 95 BPM, medium. */
  mystical: () => MusicContext.fromPreset(LEVEL_CONTEXTS.mystical),

  /** Level cleared celebration: C Ionian, 150 BPM, full arrangement. */
  victory: () => MusicContext.fromPreset(LEVEL_CONTEXTS.victory),

  /** All lives lost: B Locrian, 70 BPM, sparse and bleak. */
  defeat: () => MusicContext.fromPreset(LEVEL_CONTEXTS.defeat),

  /** Late-game complexity: G MelodicMinor, 130 BPM, medium. */
  deepDive: () => MusicContext.fromPreset(LEVEL_CONTEXTS.deepDive),
} as const
