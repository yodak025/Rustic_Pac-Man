import { Pattern, type NoteEvent } from '../patterns/Pattern'
import { type MusicContext } from '../theory/MusicContext'
import { noteToMidi, midiToNote, type NoteName } from '../theory/Note'

// ---------------------------------------------------------------------------
// Variation types
// ---------------------------------------------------------------------------

/**
 * The kind of mutation to apply to a pattern.
 *
 * Each type targets a different musical dimension so callers can ask for
 * exactly the kind of variation they need without side effects on other
 * dimensions.
 */
export type VariationType =
  | 'addNote'       // insert a new pitched event at an empty step
  | 'removeNote'    // silence one existing pitched event (→ rest)
  | 'shiftPitch'    // transpose one note by ±1–2 scale steps
  | 'shiftRhythm'   // move one note one step earlier or later (micro-timing)
  | 'scaleVelocity' // accent or de-accent a subset of notes
  | 'invert'        // reverse pitch contour around the axis note
  | 'double'        // duplicate an existing note one step later

/**
 * Specifies which variation(s) to apply and how strongly.
 *
 * `amount` is a 0–1 coefficient that controls how many notes are affected:
 *   0.0 → minimal change (1 note)
 *   1.0 → all eligible notes
 */
export interface VariationRequest {
  type: VariationType
  /** 0–1: how many notes to affect. Defaults to 0.3 (subtle). */
  amount?: number
}

// ---------------------------------------------------------------------------
// VariationEngine
// ---------------------------------------------------------------------------

/**
 * VariationEngine
 *
 * Applies musically coherent mutations to an existing Pattern without
 * regenerating it from scratch. All operations stay within the current
 * MusicContext (scale, chord tones, note range).
 *
 * Design principles:
 *   - Pure functions: every method returns a NEW Pattern, input is never mutated.
 *   - Deterministic with controlled randomness: uses a lightweight seeded
 *     pseudo-random number generator (Mulberry32) so the same inputs always
 *     produce the same variation. The seed is derived from the pattern content
 *     and the variation type — no global random state.
 *   - KISS: each variation type is a small, focused function.
 *   - CPU-light: no FFT, no ML, plain array manipulation.
 *
 * Single Responsibility: transform Pattern → Pattern via musical mutations.
 * Does not schedule audio or hold state.
 */
export class VariationEngine {
  /**
   * Applies one or more variation requests to `pattern` in sequence.
   * Returns the mutated Pattern (input is unchanged).
   */
  apply(
    pattern: Pattern,
    context: MusicContext,
    requests: VariationRequest[],
  ): Pattern {
    return requests.reduce(
      (p, req) => this.applySingle(p, context, req),
      pattern,
    )
  }

  /**
   * Convenience: apply a single variation request.
   */
  applyOne(
    pattern: Pattern,
    context: MusicContext,
    request: VariationRequest,
  ): Pattern {
    return this.applySingle(pattern, context, request)
  }

  // ---------------------------------------------------------------------------
  // Private dispatch
  // ---------------------------------------------------------------------------

  private applySingle(
    pattern: Pattern,
    context: MusicContext,
    { type, amount = 0.3 }: VariationRequest,
  ): Pattern {
    const seed = patternSeed(pattern, type)
    const rng  = mulberry32(seed)

    switch (type) {
      case 'addNote':      return this.addNote(pattern, context, amount, rng)
      case 'removeNote':   return this.removeNote(pattern, amount, rng)
      case 'shiftPitch':   return this.shiftPitch(pattern, context, amount, rng)
      case 'shiftRhythm':  return this.shiftRhythm(pattern, amount, rng)
      case 'scaleVelocity':return this.scaleVelocityVariation(pattern, amount, rng)
      case 'invert':       return this.invertContour(pattern, context, rng)
      case 'double':       return this.doubleNote(pattern, amount, rng)
    }
  }

  // ---------------------------------------------------------------------------
  // Variation implementations
  // ---------------------------------------------------------------------------

  /**
   * addNote — inserts pitched events at currently-empty steps.
   *
   * Chooses a scale note near the melodic centre of the existing pattern
   * and places it at a random empty step. `amount` controls how many notes
   * to add (1 at 0.0, up to ~25% of steps at 1.0).
   */
  private addNote(
    pattern: Pattern,
    context: MusicContext,
    amount: number,
    rng: () => number,
  ): Pattern {
    const scaleNotes = context.scale.getNotesInRange(
      context.noteRange[0],
      context.noteRange[1],
    )
    if (scaleNotes.length === 0) return pattern.clone()

    const totalSteps = pattern.lengthBars * pattern.subdivision
    const count      = Math.max(1, Math.round(amount * totalSteps * 0.25))

    // Find steps with no pitched event
    const occupiedTimes = new Set(
      pattern.pitchedNotes.map((n) => n.time),
    )
    const stepDur = 1 / pattern.subdivision
    const emptySteps: number[] = []
    for (let i = 0; i < totalSteps; i++) {
      const t = i * stepDur
      if (!occupiedTimes.has(t)) emptySteps.push(t)
    }
    if (emptySteps.length === 0) return pattern.clone()

    // Melodic centre: average MIDI of existing pitched notes
    const centre = melodicCentre(pattern, scaleNotes[Math.floor(scaleNotes.length / 2)])

    const newNotes = [...pattern.notes.map((n) => ({ ...n }))]
    for (let i = 0; i < count && emptySteps.length > 0; i++) {
      const idx  = Math.floor(rng() * emptySteps.length)
      const time = emptySteps.splice(idx, 1)[0]

      // Pick a scale note within ±5 semitones of the melodic centre
      const note     = nearestScaleNote(centre, scaleNotes, rng)
      const velocity = 0.5 + rng() * 0.3

      newNotes.push({ pitch: note, time, duration: stepDur, velocity })
    }

    // Re-sort by time to keep the array ordered
    newNotes.sort((a, b) => a.time - b.time)
    return new Pattern(newNotes, pattern.lengthBars, pattern.subdivision)
  }

  /**
   * removeNote — silences (converts to rest) a fraction of pitched events.
   * Preserves rhythm by keeping the slot as a rest, not deleting it.
   */
  private removeNote(
    pattern: Pattern,
    amount: number,
    rng: () => number,
  ): Pattern {
    const pitched = pattern.pitchedNotes
    if (pitched.length === 0) return pattern.clone()

    const count   = Math.max(1, Math.round(amount * pitched.length))
    const indices = shuffleIndices(pitched.length, rng).slice(0, count)
    const toSilence = new Set(indices.map((i) => pitched[i].time))

    const newNotes = pattern.notes.map((n) =>
      n.pitch !== null && toSilence.has(n.time)
        ? { ...n, pitch: null as null, velocity: 0 }
        : { ...n },
    )
    return new Pattern(newNotes, pattern.lengthBars, pattern.subdivision)
  }

  /**
   * shiftPitch — transposes a fraction of pitched notes by ±1–2 scale steps.
   * The resulting note is always snapped back to the scale.
   */
  private shiftPitch(
    pattern: Pattern,
    context: MusicContext,
    amount: number,
    rng: () => number,
  ): Pattern {
    const pitched = pattern.pitchedNotes
    if (pitched.length === 0) return pattern.clone()

    const count   = Math.max(1, Math.round(amount * pitched.length))
    const indices = shuffleIndices(pitched.length, rng).slice(0, count)
    const toShift = new Set(indices.map((i) => pitched[i].time))

    const newNotes = pattern.notes.map((n): NoteEvent => {
      if (n.pitch === null || !toShift.has(n.time)) return { ...n }

      // ±1 or ±2 semitones, then snap to scale
      const direction = rng() < 0.5 ? -1 : 1
      const semitones = direction * (rng() < 0.6 ? 1 : 2)
      const shifted   = midiToNote(noteToMidi(n.pitch) + semitones)
      const snapped   = context.scale.snapToScale(shifted)
      const clamped   = clampToRange(snapped, context.noteRange[0], context.noteRange[1])

      return { ...n, pitch: clamped }
    })
    return new Pattern(newNotes, pattern.lengthBars, pattern.subdivision)
  }

  /**
   * shiftRhythm — moves a fraction of notes one step earlier or later.
   * Prevents collisions by only moving to empty slots.
   */
  private shiftRhythm(
    pattern: Pattern,
    amount: number,
    rng: () => number,
  ): Pattern {
    const pitched   = pattern.pitchedNotes
    if (pitched.length === 0) return pattern.clone()

    const count     = Math.max(1, Math.round(amount * pitched.length))
    const indices   = shuffleIndices(pitched.length, rng).slice(0, count)
    const stepDur   = 1 / pattern.subdivision
    const totalDur  = pattern.lengthBars

    // Build a mutable copy
    const notesMap  = new Map<number, NoteEvent>()
    pattern.notes.forEach((n) => notesMap.set(n.time, { ...n }))

    indices.forEach((i) => {
      const note     = pitched[i]
      const delta    = rng() < 0.5 ? -stepDur : stepDur
      let   newTime  = note.time + delta

      // Wrap around bar boundary
      if (newTime < 0)           newTime += totalDur
      if (newTime >= totalDur)   newTime -= totalDur
      newTime = Math.round(newTime / stepDur) * stepDur

      // Only move if the target slot is empty or a rest
      const target = notesMap.get(newTime)
      if (!target || target.pitch === null) {
        // Silence the original slot
        notesMap.set(note.time, { ...note, pitch: null, velocity: 0 })
        // Place at new slot
        notesMap.set(newTime,   { ...note, time: newTime })
      }
    })

    const newNotes = Array.from(notesMap.values()).sort((a, b) => a.time - b.time)
    return new Pattern(newNotes, pattern.lengthBars, pattern.subdivision)
  }

  /**
   * scaleVelocity — accents or de-accents a subset of notes.
   * `amount` < 0.5 → accent (louder), ≥ 0.5 → de-accent (softer).
   */
  private scaleVelocityVariation(
    pattern: Pattern,
    amount: number,
    rng: () => number,
  ): Pattern {
    const pitched  = pattern.pitchedNotes
    if (pitched.length === 0) return pattern.clone()

    // How many notes to affect
    const count    = Math.max(1, Math.round(amount * pitched.length))
    const indices  = shuffleIndices(pitched.length, rng).slice(0, count)
    const toAccent = new Set(indices.map((i) => pitched[i].time))

    // Accent if amount < 0.5 (boost), de-accent otherwise (attenuate)
    const factor   = amount < 0.5 ? 1.25 : 0.7

    const newNotes = pattern.notes.map((n): NoteEvent => {
      if (n.pitch === null || !toAccent.has(n.time)) return { ...n }
      return { ...n, velocity: Math.max(0.05, Math.min(1, n.velocity * factor)) }
    })
    return new Pattern(newNotes, pattern.lengthBars, pattern.subdivision)
  }

  /**
   * invert — mirrors the melodic contour around the axis (median) pitch.
   * Interval from axis is negated: notes above axis go below and vice versa.
   * All results snapped to scale and clamped to noteRange.
   */
  private invertContour(
    pattern: Pattern,
    context: MusicContext,
    rng: () => number,
  ): Pattern {
    const pitched = pattern.pitchedNotes
    if (pitched.length < 2) return pattern.clone()

    // Axis: the median MIDI value of pitched notes
    const midis  = pitched.map((n) => noteToMidi(n.pitch as NoteName)).sort((a, b) => a - b)
    const axis   = midis[Math.floor(midis.length / 2)]

    // Introduce a slight random offset (±1 semitone) for variety
    const offset = rng() < 0.4 ? (rng() < 0.5 ? -1 : 1) : 0
    const pivotMidi = axis + offset

    const pitchMap = new Map<number, NoteName>()
    pitched.forEach((n) => {
      const midi      = noteToMidi(n.pitch as NoteName)
      const interval  = midi - pivotMidi
      const invMidi   = pivotMidi - interval
      const invNote   = context.scale.snapToScale(midiToNote(invMidi))
      const clamped   = clampToRange(invNote, context.noteRange[0], context.noteRange[1])
      pitchMap.set(n.time, clamped)
    })

    const newNotes = pattern.notes.map((n): NoteEvent => {
      const newPitch = n.pitch !== null ? (pitchMap.get(n.time) ?? n.pitch) : null
      return { ...n, pitch: newPitch }
    })
    return new Pattern(newNotes, pattern.lengthBars, pattern.subdivision)
  }

  /**
   * double — duplicates a fraction of notes one step later.
   * Creates a subtle echo/stutter effect. Skips if the target slot is occupied.
   */
  private doubleNote(
    pattern: Pattern,
    amount: number,
    rng: () => number,
  ): Pattern {
    const pitched   = pattern.pitchedNotes
    if (pitched.length === 0) return pattern.clone()

    const count     = Math.max(1, Math.round(amount * pitched.length * 0.5))
    const indices   = shuffleIndices(pitched.length, rng).slice(0, count)
    const stepDur   = 1 / pattern.subdivision
    const totalDur  = pattern.lengthBars

    const occupied  = new Set(pattern.pitchedNotes.map((n) => n.time))
    const toAdd: NoteEvent[] = []

    indices.forEach((i) => {
      const note     = pitched[i]
      let   newTime  = note.time + stepDur
      if (newTime >= totalDur) newTime -= totalDur
      newTime = Math.round(newTime / stepDur) * stepDur

      if (!occupied.has(newTime)) {
        occupied.add(newTime)
        toAdd.push({
          pitch:    note.pitch,
          time:     newTime,
          duration: note.duration,
          velocity: note.velocity * 0.75,  // echo is softer
        })
      }
    })

    if (toAdd.length === 0) return pattern.clone()

    const newNotes = [...pattern.notes.map((n) => ({ ...n })), ...toAdd]
      .sort((a, b) => a.time - b.time)
    return new Pattern(newNotes, pattern.lengthBars, pattern.subdivision)
  }
}

// ---------------------------------------------------------------------------
// Seeded PRNG (Mulberry32) — deterministic, fast, no global state
// ---------------------------------------------------------------------------

/**
 * Mulberry32: a simple, fast 32-bit seeded PRNG.
 * Returns a closure that yields [0, 1) floats.
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }
}

/**
 * Derives a deterministic integer seed from a Pattern's note content
 * combined with the variation type string.
 * Same pattern + same type → same seed every time.
 */
function patternSeed(pattern: Pattern, type: string): number {
  let h = 0x811c9dc5
  for (const n of pattern.pitchedNotes) {
    const midi = n.pitch ? noteToMidi(n.pitch) : 0
    h = Math.imul(h ^ midi,            0x01000193)
    h = Math.imul(h ^ (n.time * 1000 | 0), 0x01000193)
  }
  for (let i = 0; i < type.length; i++) {
    h = Math.imul(h ^ type.charCodeAt(i), 0x01000193)
  }
  return h >>> 0
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Returns a randomly shuffled array of indices 0…length-1.
 * Uses the supplied RNG for determinism.
 */
function shuffleIndices(length: number, rng: () => number): number[] {
  const arr = Array.from({ length }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j  = Math.floor(rng() * (i + 1))
    const tmp = arr[i]
    arr[i]   = arr[j]
    arr[j]   = tmp
  }
  return arr
}

/**
 * Computes the melodic centre (mean MIDI value) of pitched notes.
 * Falls back to `fallback` when there are no pitched notes.
 */
function melodicCentre(pattern: Pattern, fallback: NoteName): number {
  const midis = pattern.pitchedNotes.map((n) => noteToMidi(n.pitch as NoteName))
  if (midis.length === 0) return noteToMidi(fallback)
  return Math.round(midis.reduce((s, m) => s + m, 0) / midis.length)
}

/**
 * Returns the scale note nearest to `targetMidi`, with a small random
 * perturbation controlled by `rng` (picks one of the 3 nearest notes).
 */
function nearestScaleNote(
  targetMidi: number,
  scaleNotes: NoteName[],
  rng: () => number,
): NoteName {
  if (scaleNotes.length === 0) return midiToNote(targetMidi)

  const sorted = [...scaleNotes]
    .map((n) => ({ note: n, dist: Math.abs(noteToMidi(n) - targetMidi) }))
    .sort((a, b) => a.dist - b.dist)

  // Pick randomly among the 3 closest candidates for variety
  const pool = sorted.slice(0, Math.min(3, sorted.length))
  return pool[Math.floor(rng() * pool.length)].note
}

/**
 * Clamps a note into the range [low, high] by shifting octaves.
 */
function clampToRange(note: NoteName, low: NoteName, high: NoteName): NoteName {
  let midi     = noteToMidi(note)
  const loMidi = noteToMidi(low)
  const hiMidi = noteToMidi(high)
  while (midi < loMidi) midi += 12
  while (midi > hiMidi) midi -= 12
  return midiToNote(Math.max(loMidi, Math.min(hiMidi, midi)))
}
