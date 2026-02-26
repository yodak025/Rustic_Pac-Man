import { Scale, Mode } from './Scale'
import { Chord, PROGRESSION_PRESETS } from './Chord'
import type { PitchClass, NoteName } from './Note'

// ---------------------------------------------------------------------------
// Texture and tension descriptors
// ---------------------------------------------------------------------------

/** Controls note density: how many events fill the rhythmic grid. */
export type TextureDensity = 'sparse' | 'medium' | 'dense'

/**
 * Shared musical state consumed by every instrument in the hierarchy.
 *
 * Single Responsibility: holds all music-theory and performance parameters
 * needed to generate or mutate a pattern. Does not drive audio directly.
 *
 * All properties are readonly after construction.
 * Use MusicContext.derive() to create modified snapshots.
 */
export class MusicContext {
  // --- Harmony ---------------------------------------------------------------
  readonly scale: Scale
  readonly chordProgression: Chord[]
  readonly currentChordIndex: number

  // --- Tempo -----------------------------------------------------------------
  readonly bpm: number
  /** [numerator, denominator] e.g. [4, 4], [3, 4], [7, 8] */
  readonly timeSignature: readonly [number, number]

  // --- Performance parameters (0–1 normalised) ------------------------------
  /**
   * Overall energy level.
   * 0 = minimal activity (few notes, low velocity)
   * 1 = maximum activity (dense patterns, loud)
   */
  readonly intensity: number

  /**
   * Rhythmic / melodic density.
   * Mapped to note-count multipliers per instrument.
   */
  readonly texture: TextureDensity

  /**
   * Harmonic tension.
   * 0 = strictly diatonic
   * 1 = allow chromatic passing notes and non-chord tones freely
   */
  readonly tension: number

  // --- Range constraint ------------------------------------------------------
  /** Absolute pitch boundaries for note generation [low, high]. */
  readonly noteRange: readonly [NoteName, NoteName]

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------

  constructor(params: {
    scale: Scale
    chordProgression: Chord[]
    currentChordIndex?: number
    bpm: number
    timeSignature?: readonly [number, number]
    intensity?: number
    texture?: TextureDensity
    tension?: number
    noteRange?: readonly [NoteName, NoteName]
  }) {
    this.scale = params.scale
    this.chordProgression = params.chordProgression
    this.currentChordIndex = params.currentChordIndex ?? 0
    this.bpm = params.bpm
    this.timeSignature = params.timeSignature ?? [4, 4]
    this.intensity = clamp01(params.intensity ?? 0.5)
    this.texture = params.texture ?? 'medium'
    this.tension = clamp01(params.tension ?? 0.0)
    this.noteRange = params.noteRange ?? ['C2', 'C6']
  }

  // ---------------------------------------------------------------------------
  // Convenience getters
  // ---------------------------------------------------------------------------

  get currentChord(): Chord {
    return this.chordProgression[this.currentChordIndex]
  }

  get key(): PitchClass {
    return this.scale.root
  }

  // ---------------------------------------------------------------------------
  // Immutable update
  // ---------------------------------------------------------------------------

  /**
   * Returns a new MusicContext with only the supplied fields overridden.
   * All other fields are carried over from the original instance.
   * This keeps MusicContext immutable while still being easy to evolve.
   */
  derive(overrides: Partial<{
    scale: Scale
    chordProgression: Chord[]
    currentChordIndex: number
    bpm: number
    timeSignature: readonly [number, number]
    intensity: number
    texture: TextureDensity
    tension: number
    noteRange: readonly [NoteName, NoteName]
  }>): MusicContext {
    return new MusicContext({
      scale: overrides.scale ?? this.scale,
      chordProgression: overrides.chordProgression ?? this.chordProgression,
      currentChordIndex: overrides.currentChordIndex ?? this.currentChordIndex,
      bpm: overrides.bpm ?? this.bpm,
      timeSignature: overrides.timeSignature ?? this.timeSignature,
      intensity: overrides.intensity ?? this.intensity,
      texture: overrides.texture ?? this.texture,
      tension: overrides.tension ?? this.tension,
      noteRange: overrides.noteRange ?? this.noteRange,
    })
  }

  /** Advances the chord progression by one step (wraps around). */
  advanceChord(): MusicContext {
    return this.derive({
      currentChordIndex: (this.currentChordIndex + 1) % this.chordProgression.length,
    })
  }

  // ---------------------------------------------------------------------------
  // Static presets
  // ---------------------------------------------------------------------------

  /**
   * Builds a MusicContext from a preset name.
   * Convenience factory for level definitions and testing.
   */
  static fromPreset(preset: LevelContextPreset): MusicContext {
    const scale = new Scale(preset.key, preset.mode)
    const progressionDegrees = PROGRESSION_PRESETS.find(
      (p) => p.name === preset.progressionPreset
    )?.degrees ?? [0, 3, 4, 6]

    const chordProgression = progressionDegrees.map((degree) =>
      Chord.diatonicChord(scale, degree)
    )

    return new MusicContext({
      scale,
      chordProgression,
      bpm: preset.bpm,
      intensity: preset.intensity ?? 0.5,
      texture: preset.texture ?? 'medium',
      tension: preset.tension ?? 0.0,
      noteRange: preset.noteRange ?? ['C2', 'C6'],
    })
  }
}

// ---------------------------------------------------------------------------
// Level preset interface (consumed by LevelContexts.ts)
// ---------------------------------------------------------------------------

export interface LevelContextPreset {
  key: PitchClass
  mode: Mode
  bpm: number
  progressionPreset: string
  intensity?: number
  texture?: TextureDensity
  tension?: number
  noteRange?: readonly [NoteName, NoteName]
}

// ---------------------------------------------------------------------------
// Private utility
// ---------------------------------------------------------------------------

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}
