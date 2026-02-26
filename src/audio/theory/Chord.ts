import { type PitchClass, type NoteName, noteToMidi, midiToNote } from './Note'
import { Scale } from './Scale'

// ---------------------------------------------------------------------------
// Chord quality catalogue
// ---------------------------------------------------------------------------

export enum ChordQuality {
  Major = 'Major',
  Minor = 'Minor',
  Diminished = 'Diminished',
  Augmented = 'Augmented',
  // Seventh chords
  Major7 = 'Major7',
  Minor7 = 'Minor7',
  Dominant7 = 'Dominant7',
  MinorMajor7 = 'MinorMajor7',       // min/maj7 – common in harmonic minor
  HalfDiminished7 = 'HalfDiminished7', // m7b5
  Diminished7 = 'Diminished7',
  // Suspended
  Sus2 = 'Sus2',
  Sus4 = 'Sus4',
}

/**
 * Intervals (in semitones from root) for each chord quality.
 * Root (0) is always implicit.
 */
const CHORD_INTERVALS: Record<ChordQuality, readonly number[]> = {
  [ChordQuality.Major]:           [0, 4, 7],
  [ChordQuality.Minor]:           [0, 3, 7],
  [ChordQuality.Diminished]:      [0, 3, 6],
  [ChordQuality.Augmented]:       [0, 4, 8],
  [ChordQuality.Major7]:          [0, 4, 7, 11],
  [ChordQuality.Minor7]:          [0, 3, 7, 10],
  [ChordQuality.Dominant7]:       [0, 4, 7, 10],
  [ChordQuality.MinorMajor7]:     [0, 3, 7, 11],
  [ChordQuality.HalfDiminished7]: [0, 3, 6, 10],
  [ChordQuality.Diminished7]:     [0, 3, 6, 9],
  [ChordQuality.Sus2]:            [0, 2, 7],
  [ChordQuality.Sus4]:            [0, 5, 7],
}

// ---------------------------------------------------------------------------
// Diatonic chord qualities per scale degree for the supported modes
// (mode index 0-6 maps to scale degrees I–VII)
// ---------------------------------------------------------------------------

import { Mode } from './Scale'

/**
 * Which chord quality naturally occurs on each scale degree for a given mode.
 * Index 0 = degree I, index 6 = degree VII.
 */
const DIATONIC_QUALITIES: Record<Mode, readonly ChordQuality[]> = {
  [Mode.Ionian]:    [ChordQuality.Major, ChordQuality.Minor, ChordQuality.Minor, ChordQuality.Major, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Diminished],
  [Mode.Dorian]:    [ChordQuality.Minor, ChordQuality.Minor, ChordQuality.Major, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Diminished, ChordQuality.Major],
  [Mode.Phrygian]:  [ChordQuality.Minor, ChordQuality.Major, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Diminished, ChordQuality.Major, ChordQuality.Minor],
  [Mode.Lydian]:    [ChordQuality.Major, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Diminished, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Minor],
  [Mode.Mixolydian]:[ChordQuality.Major, ChordQuality.Minor, ChordQuality.Diminished, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Minor, ChordQuality.Major],
  [Mode.Aeolian]:   [ChordQuality.Minor, ChordQuality.Diminished, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Minor, ChordQuality.Major, ChordQuality.Major],
  [Mode.Locrian]:   [ChordQuality.Diminished, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Minor, ChordQuality.Major, ChordQuality.Major, ChordQuality.Minor],
  [Mode.MelodicMinor]:     [ChordQuality.Minor, ChordQuality.Minor, ChordQuality.Augmented, ChordQuality.Major, ChordQuality.Major, ChordQuality.HalfDiminished7, ChordQuality.HalfDiminished7],
  [Mode.HarmonicMinor]:    [ChordQuality.Minor, ChordQuality.Diminished, ChordQuality.Augmented, ChordQuality.Minor, ChordQuality.Major, ChordQuality.Major, ChordQuality.Diminished7],
  [Mode.PhrygianDominant]: [ChordQuality.Major, ChordQuality.Diminished, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Diminished, ChordQuality.Major, ChordQuality.Minor],
  [Mode.LydianFlat7]:      [ChordQuality.Major, ChordQuality.Major, ChordQuality.Minor, ChordQuality.HalfDiminished7, ChordQuality.Major, ChordQuality.Minor, ChordQuality.Minor],
}

// ---------------------------------------------------------------------------
// Chord class
// ---------------------------------------------------------------------------

/**
 * Immutable representation of a chord: root + quality + optional inversion.
 *
 * Single Responsibility: knows its own notes and how to voice them.
 * Does not depend on Scale or Transport — it is a pure music-theory value.
 */
export class Chord {
  readonly root: PitchClass
  readonly quality: ChordQuality
  /** 0 = root position, 1 = first inversion, 2 = second inversion */
  readonly inversion: 0 | 1 | 2

  constructor(root: PitchClass, quality: ChordQuality, inversion: 0 | 1 | 2 = 0) {
    this.root = root
    this.quality = quality
    this.inversion = inversion
  }

  // ---------------------------------------------------------------------------
  // Note retrieval
  // ---------------------------------------------------------------------------

  /**
   * Returns the chord tones in the given octave.
   * Inversion is applied by rotating the note order and raising lower notes
   * by an octave so that voice leading remains smooth.
   */
  getNotes(rootOctave: number = 4): NoteName[] {
    const rootMidi = noteToMidi(`${this.root}${rootOctave}`)
    const intervals = [...CHORD_INTERVALS[this.quality]]

    const notes = intervals.map((i) => midiToNote(rootMidi + i))

    // Apply inversion: rotate and raise by an octave
    for (let inv = 0; inv < this.inversion; inv++) {
      const first = notes.shift()!
      notes.push(midiToNote(noteToMidi(first) + 12))
    }

    return notes
  }

  /**
   * Returns the bass note (lowest note) considering inversion.
   * E.g. Cm/Eb → 'Eb3'
   */
  getBassNote(rootOctave: number = 3): NoteName {
    const intervals = CHORD_INTERVALS[this.quality]
    const bassInterval = intervals[this.inversion] ?? 0
    const rootMidi = noteToMidi(`${this.root}${rootOctave}`)
    return midiToNote(rootMidi + bassInterval)
  }

  // ---------------------------------------------------------------------------
  // Factory helpers
  // ---------------------------------------------------------------------------

  /** Returns a new chord with the requested inversion. */
  withInversion(inversion: 0 | 1 | 2): Chord {
    return new Chord(this.root, this.quality, inversion)
  }

  // ---------------------------------------------------------------------------
  // Static factories
  // ---------------------------------------------------------------------------

  /**
   * Builds all 7 diatonic triads for a given scale.
   * Returned in scale-degree order (I, II, III, IV, V, VI, VII).
   */
  static diatonicTriads(scale: Scale): Chord[] {
    const pitchClasses = scale.getPitchClasses()
    const qualities = DIATONIC_QUALITIES[scale.mode]

    return pitchClasses.map(
      (pc, i) => new Chord(pc, qualities[i])
    )
  }

  /**
   * Builds a specific diatonic chord (0-based degree, I = 0).
   */
  static diatonicChord(scale: Scale, degree: number): Chord {
    return Chord.diatonicTriads(scale)[degree % 7]
  }
}

// ---------------------------------------------------------------------------
// Common progression presets (as 0-based scale degree indices)
// ---------------------------------------------------------------------------

export interface ChordProgressionPreset {
  name: string
  degrees: number[]
}

export const PROGRESSION_PRESETS: ChordProgressionPreset[] = [
  { name: 'i-iv-VII-III',   degrees: [0, 3, 6, 2] },  // Dorian loop
  { name: 'i-VI-III-VII',   degrees: [0, 5, 2, 6] },  // Andalusian cadence variant
  { name: 'i-iv-v',         degrees: [0, 3, 4] },      // Minor blues
  { name: 'I-V-vi-IV',      degrees: [0, 4, 5, 3] },  // Classic pop (Ionian)
  { name: 'ii-V-I',         degrees: [1, 4, 0] },      // Jazz cadence
  { name: 'i-VII-VI-VII',   degrees: [0, 6, 5, 6] },  // Phrygian vamp
  { name: 'I-IV-V',         degrees: [0, 3, 4] },      // Basic triad loop
]
