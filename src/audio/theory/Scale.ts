import { PITCH_CLASSES, type PitchClass, type NoteName, noteToMidi, midiToNote, transposeNote } from './Note'

// ---------------------------------------------------------------------------
// Modes (church modes + jazz/harmonic extensions)
// ---------------------------------------------------------------------------

export enum Mode {
  // Church modes
  Ionian = 'Ionian',                   // Major: W W H W W W H
  Dorian = 'Dorian',                   // Minor with raised 6th
  Phrygian = 'Phrygian',               // Minor with flat 2nd
  Lydian = 'Lydian',                   // Major with raised 4th
  Mixolydian = 'Mixolydian',           // Major with flat 7th
  Aeolian = 'Aeolian',                 // Natural minor
  Locrian = 'Locrian',                 // Diminished
  // Harmonic / melodic minor derivatives
  MelodicMinor = 'MelodicMinor',       // Minor with raised 6th and 7th
  HarmonicMinor = 'HarmonicMinor',     // Minor with raised 7th
  PhrygianDominant = 'PhrygianDominant', // Mode V of harmonic minor (Spanish/flamenco)
  LydianFlat7 = 'LydianFlat7',         // Mode IV of melodic minor (Lydian dominant)
}

/**
 * Semitone intervals from the root for each mode.
 * Root (0) is always included; 7 notes per scale.
 */
export const MODE_INTERVALS: Record<Mode, readonly number[]> = {
  [Mode.Ionian]:            [0, 2, 4, 5, 7, 9, 11],
  [Mode.Dorian]:            [0, 2, 3, 5, 7, 9, 10],
  [Mode.Phrygian]:          [0, 1, 3, 5, 7, 8, 10],
  [Mode.Lydian]:            [0, 2, 4, 6, 7, 9, 11],
  [Mode.Mixolydian]:        [0, 2, 4, 5, 7, 9, 10],
  [Mode.Aeolian]:           [0, 2, 3, 5, 7, 8, 10],
  [Mode.Locrian]:           [0, 1, 3, 5, 6, 8, 10],
  [Mode.MelodicMinor]:      [0, 2, 3, 5, 7, 9, 11],
  [Mode.HarmonicMinor]:     [0, 2, 3, 5, 7, 8, 11],
  [Mode.PhrygianDominant]:  [0, 1, 4, 5, 7, 8, 10],
  [Mode.LydianFlat7]:       [0, 2, 4, 6, 7, 9, 10],
}

// Scale degrees (0-based, within one octave)
export type ScaleDegree = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Immutable representation of a diatonic scale defined by root + mode.
 *
 * Responsibilities (Single Responsibility):
 *  - Enumerate scale notes for any octave / range
 *  - Snap arbitrary notes to the nearest scale note
 *  - Report whether a given pitch belongs to the scale
 */
export class Scale {
  readonly root: PitchClass
  readonly mode: Mode
  readonly intervals: readonly number[]

  constructor(root: PitchClass, mode: Mode) {
    this.root = root
    this.mode = mode
    this.intervals = MODE_INTERVALS[mode]
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Returns all 7 pitch classes (without octave) in scale order. */
  getPitchClasses(): PitchClass[] {
    const rootIdx = PITCH_CLASSES.indexOf(this.root)
    return this.intervals.map(
      (interval) => PITCH_CLASSES[(rootIdx + interval) % 12]
    )
  }

  /** Returns the 7 note names for the given octave. */
  getNotesForOctave(octave: number): NoteName[] {
    const rootMidi = noteToMidi(`${this.root}${octave}`)
    return this.intervals.map((interval) => midiToNote(rootMidi + interval))
  }

  /**
   * Returns all scale notes within the MIDI range [low, high].
   * Useful for constraining pattern generation to a playable register.
   */
  getNotesInRange(low: NoteName, high: NoteName): NoteName[] {
    const loMidi = noteToMidi(low)
    const hiMidi = noteToMidi(high)
    const rootPcIdx = PITCH_CLASSES.indexOf(this.root)

    const notes: NoteName[] = []
    for (let midi = loMidi; midi <= hiMidi; midi++) {
      const pc = (midi % 12 + 12) % 12
      const rootRelative = (pc - rootPcIdx + 12) % 12
      if (this.intervals.includes(rootRelative)) {
        notes.push(midiToNote(midi))
      }
    }
    return notes
  }

  /** Returns true when the pitch class of `note` belongs to the scale. */
  contains(note: NoteName): boolean {
    return this.getPitchClasses().includes(this.extractPitchClass(note))
  }

  /**
   * Snaps `note` to the nearest scale note.
   * When equidistant, prefers the note below.
   */
  snapToScale(note: NoteName): NoteName {
    if (this.contains(note)) return note

    const midi = noteToMidi(note)
    for (let offset = 1; offset <= 6; offset++) {
      if (this.isInScaleByMidi(midi - offset)) return midiToNote(midi - offset)
      if (this.isInScaleByMidi(midi + offset)) return midiToNote(midi + offset)
    }

    // Fallback: return root in the same octave
    const octaveMatch = note.match(/(\d)$/)
    const octave = octaveMatch ? parseInt(octaveMatch[1], 10) : 4
    return `${this.root}${octave}`
  }

  /**
   * Returns the note at a given scale degree for the supplied root octave.
   * Degrees wrap across octaves (degree 7 = root of the next octave).
   */
  getDegreeNote(degree: number, rootOctave: number): NoteName {
    const extraOctaves = Math.floor(degree / 7)
    const degreeInOctave = degree % 7
    const rootMidi = noteToMidi(`${this.root}${rootOctave}`)
    return midiToNote(rootMidi + this.intervals[degreeInOctave] + extraOctaves * 12)
  }

  /** Returns a new Scale transposed by `semitones`, keeping the same mode. */
  transpose(semitones: number): Scale {
    const rootIdx = PITCH_CLASSES.indexOf(this.root)
    const newRoot = PITCH_CLASSES[(rootIdx + semitones + 12) % 12]
    return new Scale(newRoot, this.mode)
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private extractPitchClass(note: NoteName): PitchClass {
    const match = note.match(/^([A-G][b#]?)(\d)$/)
    if (!match) throw new Error(`Invalid note: "${note}"`)
    return match[1] as PitchClass
  }

  private isInScaleByMidi(midi: number): boolean {
    const pc = (midi % 12 + 12) % 12
    const rootPcIdx = PITCH_CLASSES.indexOf(this.root)
    const rootRelative = (pc - rootPcIdx + 12) % 12
    return this.intervals.includes(rootRelative)
  }

  /** Convenience wrapper: transposes a note by semitones via Note utility. */
  transposeNote(note: NoteName, semitones: number): NoteName {
    return transposeNote(note, semitones)
  }
}
