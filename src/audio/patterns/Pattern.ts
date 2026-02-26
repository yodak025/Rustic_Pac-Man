import { transposeNote, type NoteName } from '../theory/Note'

// ---------------------------------------------------------------------------
// Note event
// ---------------------------------------------------------------------------

/**
 * A single note event within a pattern.
 *
 * `pitch: null` represents a rest (silence at that grid position).
 * `time` and `duration` are expressed in bars (1.0 = 1 bar, 0.25 = 1 beat
 * in 4/4, 0.0625 = one 16th note in 4/4).
 */
export interface NoteEvent {
  pitch: NoteName | null
  /** Position from the start of the pattern in bars. */
  time: number
  /** How long the note is held, in bars. */
  duration: number
  /** Amplitude 0–1. */
  velocity: number
}

// ---------------------------------------------------------------------------
// Pattern
// ---------------------------------------------------------------------------

/**
 * An ordered sequence of NoteEvents with a fixed length (in bars) and a
 * grid resolution (in subdivisions per bar).
 *
 * Patterns are the currency passed between instruments in the cascade.
 * They carry no Tone.js state — plain data that can be cloned, transposed,
 * or filtered freely.
 *
 * Single Responsibility: represents a rhythmic/melodic sequence.
 * Does not schedule audio — that is the instrument's job.
 */
export class Pattern {
  readonly notes: NoteEvent[]
  /** Total length of the pattern in bars. */
  readonly lengthBars: number
  /**
   * Smallest rhythmic unit expressed as subdivisions per bar.
   * 16 = 16th notes, 8 = 8th notes, 32 = 32nd notes.
   */
  readonly subdivision: number

  constructor(notes: NoteEvent[], lengthBars: number, subdivision: number = 16) {
    this.notes = [...notes]
    this.lengthBars = lengthBars
    this.subdivision = subdivision
  }

  // ---------------------------------------------------------------------------
  // Derived views
  // ---------------------------------------------------------------------------

  /** Returns only the non-rest (pitched) events. */
  get pitchedNotes(): NoteEvent[] {
    return this.notes.filter((n) => n.pitch !== null)
  }

  /** Returns only the rest events. */
  get rests(): NoteEvent[] {
    return this.notes.filter((n) => n.pitch === null)
  }

  /** True when the pattern has no pitched events at all. */
  get isEmpty(): boolean {
    return this.pitchedNotes.length === 0
  }

  /** Returns all events that fall on or after `startBar` and before `endBar`. */
  eventsInRange(startBar: number, endBar: number): NoteEvent[] {
    return this.notes.filter((n) => n.time >= startBar && n.time < endBar)
  }

  // ---------------------------------------------------------------------------
  // Transformations (each returns a new Pattern — no mutation)
  // ---------------------------------------------------------------------------

  /** Returns a deep clone of this pattern. */
  clone(): Pattern {
    return new Pattern(
      this.notes.map((n) => ({ ...n })),
      this.lengthBars,
      this.subdivision,
    )
  }

  /**
   * Returns a new Pattern with all pitches transposed by `semitones`.
   * Rest events are left untouched.
   */
  transpose(semitones: number): Pattern {
    if (semitones === 0) return this.clone()
    return new Pattern(
      this.notes.map((n) =>
        n.pitch === null ? { ...n } : { ...n, pitch: transposeNote(n.pitch, semitones) },
      ),
      this.lengthBars,
      this.subdivision,
    )
  }

  /**
   * Returns a new Pattern with all velocities scaled by `factor`.
   * Values are clamped to [0, 1].
   */
  scaleVelocity(factor: number): Pattern {
    return new Pattern(
      this.notes.map((n) => ({
        ...n,
        velocity: Math.max(0, Math.min(1, n.velocity * factor)),
      })),
      this.lengthBars,
      this.subdivision,
    )
  }

  /**
   * Returns a new Pattern keeping only events whose pitch is in `allowedPitches`.
   * Filtered-out pitched events become rests (pitch = null).
   */
  filterToPitches(allowedPitches: NoteName[]): Pattern {
    return new Pattern(
      this.notes.map((n) =>
        n.pitch !== null && !allowedPitches.includes(n.pitch)
          ? { ...n, pitch: null }
          : { ...n },
      ),
      this.lengthBars,
      this.subdivision,
    )
  }

  // ---------------------------------------------------------------------------
  // Static factories
  // ---------------------------------------------------------------------------

  /** Creates an all-rest pattern for the given length and subdivision. */
  static empty(lengthBars: number, subdivision: number = 16): Pattern {
    const stepDuration = 1 / subdivision
    const notes: NoteEvent[] = Array.from({ length: lengthBars * subdivision }, (_, i) => ({
      pitch: null,
      time: i * stepDuration,
      duration: stepDuration,
      velocity: 0,
    }))
    return new Pattern(notes, lengthBars, subdivision)
  }
}
