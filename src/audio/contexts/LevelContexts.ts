import type { LevelContextPreset } from '../theory/MusicContext'
import { Mode } from '../theory/Scale'

/**
 * LevelContexts
 *
 * Musical context definitions for each game scenario.
 * Each entry is a plain `LevelContextPreset` object consumed by
 * `MusicContext.fromPreset()` to produce an immutable MusicContext.
 *
 * Design intent:
 *  - Contexts are pure data (no Tone.js, no imports from instruments).
 *  - Naming mirrors game progression: early exploration → rising tension →
 *    combat peaks → rest moments → boss climax → post-game resolution.
 *  - Modal choices reinforce the emotional colour:
 *    Dorian / Ionian         → neutral exploration
 *    Phrygian / Aeolian      → menace, unease
 *    Lydian / MelodicMinor   → magical, hopeful
 *    HarmonicMinor / PhrygianDominant → boss, horror
 *    Mixolydian              → action, driving energy
 *    LydianFlat7             → mysterious, jazzy
 *
 * How to use:
 * ```ts
 * import { LEVEL_CONTEXTS } from '@audio/contexts'
 * import { MusicContext } from '@audio'
 *
 * const ctx = MusicContext.fromPreset(LEVEL_CONTEXTS.exploration)
 * orchestrator.setLevelContext(ctx)
 * ```
 */
export const LEVEL_CONTEXTS: Record<string, LevelContextPreset> = {
  // ---------------------------------------------------------------------------
  // Exploration – the player wanders the maze, low threat
  // Dorian: minor feel but with a raised 6th that adds subtle brightness
  // ---------------------------------------------------------------------------
  exploration: {
    key: 'A',
    mode: Mode.Dorian,
    bpm: 100,
    progressionPreset: 'i-iv-VII-III',
    intensity: 0.35,
    texture: 'sparse',
    tension: 0.0,
    noteRange: ['C3', 'C6'],
  },

  // ---------------------------------------------------------------------------
  // Ambient – title screen / waiting state
  // Lydian: ethereal, floating quality from the raised 4th
  // ---------------------------------------------------------------------------
  ambient: {
    key: 'C',
    mode: Mode.Lydian,
    bpm: 80,
    progressionPreset: 'I-IV-V',
    intensity: 0.2,
    texture: 'sparse',
    tension: 0.0,
    noteRange: ['C3', 'C6'],
  },

  // ---------------------------------------------------------------------------
  // Tension – ghosts are nearby, approaching danger
  // Aeolian: pure natural minor, ominous and straightforward
  // ---------------------------------------------------------------------------
  tension: {
    key: 'D',
    mode: Mode.Aeolian,
    bpm: 120,
    progressionPreset: 'i-iv-v',
    intensity: 0.55,
    texture: 'medium',
    tension: 0.3,
    noteRange: ['C2', 'C5'],
  },

  // ---------------------------------------------------------------------------
  // Chase – active pursuit, high adrenaline
  // Phrygian: the flat-2 step creates urgency and dread
  // ---------------------------------------------------------------------------
  chase: {
    key: 'E',
    mode: Mode.Phrygian,
    bpm: 148,
    progressionPreset: 'i-VII-VI-VII',
    intensity: 0.75,
    texture: 'dense',
    tension: 0.5,
    noteRange: ['C2', 'C6'],
  },

  // ---------------------------------------------------------------------------
  // Power-up – player has eaten a power pellet, ghosts are fleeing
  // Mixolydian: energetic major sound with a bluesy flat-7
  // ---------------------------------------------------------------------------
  powerup: {
    key: 'G',
    mode: Mode.Mixolydian,
    bpm: 138,
    progressionPreset: 'I-V-vi-IV',
    intensity: 0.8,
    texture: 'dense',
    tension: 0.1,
    noteRange: ['C3', 'C6'],
  },

  // ---------------------------------------------------------------------------
  // Boss – special high-difficulty encounter
  // HarmonicMinor: raised 7th creates dramatic augmented 2nd interval
  // ---------------------------------------------------------------------------
  boss: {
    key: 'B',
    mode: Mode.HarmonicMinor,
    bpm: 160,
    progressionPreset: 'i-iv-v',
    intensity: 0.9,
    texture: 'dense',
    tension: 0.7,
    noteRange: ['C2', 'C6'],
  },

  // ---------------------------------------------------------------------------
  // Horror – dead end, trapped, near game-over
  // PhrygianDominant: exotic, dissonant, maximum dread
  // ---------------------------------------------------------------------------
  horror: {
    key: 'C',
    mode: Mode.PhrygianDominant,
    bpm: 140,
    progressionPreset: 'i-VII-VI-VII',
    intensity: 0.85,
    texture: 'dense',
    tension: 0.9,
    noteRange: ['C1', 'C5'],
  },

  // ---------------------------------------------------------------------------
  // Mystical – deep maze levels, secret areas
  // LydianFlat7 (Lydian Dominant): jazz/cinematic, curious and otherworldly
  // ---------------------------------------------------------------------------
  mystical: {
    key: 'F',
    mode: Mode.LydianFlat7,
    bpm: 95,
    progressionPreset: 'ii-V-I',
    intensity: 0.45,
    texture: 'medium',
    tension: 0.2,
    noteRange: ['C3', 'C6'],
  },

  // ---------------------------------------------------------------------------
  // Victory – level cleared
  // Ionian: classic major, triumphant and bright
  // ---------------------------------------------------------------------------
  victory: {
    key: 'C',
    mode: Mode.Ionian,
    bpm: 150,
    progressionPreset: 'I-V-vi-IV',
    intensity: 0.9,
    texture: 'dense',
    tension: 0.0,
    noteRange: ['C3', 'C7'],
  },

  // ---------------------------------------------------------------------------
  // Defeat – player lost all lives
  // Locrian: the most dissonant and unresolved mode
  // ---------------------------------------------------------------------------
  defeat: {
    key: 'B',
    mode: Mode.Locrian,
    bpm: 70,
    progressionPreset: 'i-iv-v',
    intensity: 0.25,
    texture: 'sparse',
    tension: 0.6,
    noteRange: ['C2', 'C5'],
  },

  // ---------------------------------------------------------------------------
  // Deep dive – late game, everything is harder
  // MelodicMinor: nuanced, sophisticated, slightly hopeful even in darkness
  // ---------------------------------------------------------------------------
  deepDive: {
    key: 'G',
    mode: Mode.MelodicMinor,
    bpm: 130,
    progressionPreset: 'i-VI-III-VII',
    intensity: 0.65,
    texture: 'medium',
    tension: 0.4,
    noteRange: ['C2', 'C6'],
  },
}

/**
 * Type alias for the keys of LEVEL_CONTEXTS.
 * Use this for type-safe context lookups.
 */
export type LevelContextName = keyof typeof LEVEL_CONTEXTS
