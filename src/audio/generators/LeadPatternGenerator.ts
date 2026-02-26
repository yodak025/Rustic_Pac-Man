import { Pattern, type NoteEvent } from '../patterns/Pattern'
import { type MusicContext } from '../theory/MusicContext'
import { noteToMidi, midiToNote, type NoteName } from '../theory/Note'
import { noteCountForTexture, distributeSteps } from './RhythmGenerator'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEAD_LOW:  NoteName = 'C4'
const LEAD_HIGH: NoteName = 'C7'

/** Step duration in bars for a 16-step, 1-bar pattern. */
const STEP_DUR = 0.0625

/**
 * LeadPatternGenerator
 *
 * Builds a 1-bar melodic phrase for Lead1 and Lead2.
 *
 * Lead1 generates the primary melody: scale-note runs anchored to chord tones.
 * Lead2 harmonises Lead1 at a diatonic interval (3rd or 6th) or provides
 * a rhythmic counterpoint (offset by one or two steps).
 *
 * Single Responsibility: transform (MusicContext, parentPattern?) → lead Pattern.
 * No Tone.js, no state.
 *
 * Generation rules:
 *   1. Build an ordered pool of scale notes within the lead register.
 *   2. Anchor start note to the current chord root (nearest in register).
 *   3. Distribute rhythmic slots via euclidean placement scaled to texture.
 *   4. Fill each slot with a note that moves by step or small leap (≤ 4 semitones)
 *      from the previous note, preferring diatonic motion.
 *   5. Add tension: at tension > 0.6 allow chromatic passing tones.
 *   6. For Lead2 (harmonisation mode), offset each note by a diatonic 3rd/6th
 *      from the Lead1 note.
 */
export class LeadPatternGenerator {
  /**
   * Generates a primary (Lead1) phrase.
   *
   * @param context       Current MusicContext
   * @param _parentPattern Pad pattern (received from cascade, reserved for future use)
   */
  generate(context: MusicContext, _parentPattern?: Pattern): Pattern {
    return this.buildMelody(context, 'lead')
  }

  /**
   * Generates a harmonised counterpoint (Lead2) based on the Lead1 pattern.
   *
   * @param context      Current MusicContext
   * @param leadPattern  Lead1 pattern — each note is harmonised at a diatonic 3rd
   */
  generateHarmony(context: MusicContext, leadPattern: Pattern): Pattern {
    return this.buildHarmony(context, leadPattern)
  }

  // ---------------------------------------------------------------------------
  // Primary melody
  // ---------------------------------------------------------------------------

  private buildMelody(context: MusicContext, _role: 'lead' | 'harmony'): Pattern {
    const { scale, currentChord, intensity, texture, tension } = context

    // 1. Build scale note pool in the lead register
    const pool = scale.getNotesInRange(LEAD_LOW, LEAD_HIGH)
    if (pool.length === 0) return Pattern.empty(1, 16)

    // 2. Find anchor note: chord root nearest to the middle of the lead register
    const anchorMidi = nearestInPool(
      noteToMidi(currentChord.getBassNote(4)),
      pool,
    )
    const anchorNote = midiToNote(anchorMidi)

    // 3. Decide how many notes to generate
    const noteCount = noteCountForTexture(texture, 16)
    const seed      = intensity
    const placement = distributeSteps(noteCount, 16, seed)

    // 4. Walk through placement and build phrase
    const events: NoteEvent[] = []
    let prevMidi = noteToMidi(anchorNote)

    placement.forEach((active, stepIndex) => {
      if (!active) return

      const time = stepIndex * STEP_DUR

      // Choose next note: step-wise or small leap, diatonic preferred
      const nextMidi = stepwiseNext(prevMidi, pool, tension)
      const note     = midiToNote(nextMidi)
      prevMidi       = nextMidi

      const velocity = 0.6 + intensity * 0.3
      events.push({ pitch: note, time, duration: STEP_DUR * noteDuration(texture), velocity })
    })

    return new Pattern(events, 1, 16)
  }

  // ---------------------------------------------------------------------------
  // Harmonised counterpoint
  // ---------------------------------------------------------------------------

  private buildHarmony(context: MusicContext, leadPattern: Pattern): Pattern {
    const { scale, intensity } = context
    const pool = scale.getNotesInRange(LEAD_LOW, LEAD_HIGH)
    if (pool.length === 0) return Pattern.empty(1, 16)

    const events: NoteEvent[] = leadPattern.pitchedNotes.map((event) => {
      if (event.pitch === null) return event

      // Harmonise a diatonic 3rd above (≈ 3–4 semitones, nearest scale note)
      const leadMidi    = noteToMidi(event.pitch)
      const targetMidi  = leadMidi + 4  // major 3rd approximation
      const harmonicMidi = nearestInPool(targetMidi, pool)
      const harmNote    = midiToNote(harmonicMidi)

      const velocity = Math.min(1, event.velocity * 0.85 + intensity * 0.05)
      return { ...event, pitch: harmNote, velocity }
    })

    return new Pattern(events, 1, 16)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Finds the nearest MIDI value in `pool` to `targetMidi`.
 * Pool notes are converted to MIDI for comparison.
 */
function nearestInPool(targetMidi: number, pool: NoteName[]): number {
  if (pool.length === 0) return targetMidi
  return pool.reduce((best, note) => {
    const midi = noteToMidi(note)
    return Math.abs(midi - targetMidi) < Math.abs(best - targetMidi) ? midi : best
  }, noteToMidi(pool[0]))
}

/**
 * Returns the next MIDI value for a step-wise melodic move.
 *
 * Prefers diatonic steps (pool notes within 4 semitones of `fromMidi`).
 * At higher tension, also considers chromatic passing tones (out of pool).
 */
function stepwiseNext(fromMidi: number, pool: NoteName[], tension: number): number {
  // Candidates: pool notes within a 4-semitone step
  const poolMidis  = pool.map(noteToMidi)
  const neighbours = poolMidis.filter((m) => Math.abs(m - fromMidi) <= 4 && m !== fromMidi)

  if (neighbours.length > 0) {
    // Pick the nearest neighbour (deterministic: minimal interval)
    return neighbours.reduce((best, m) =>
      Math.abs(m - fromMidi) < Math.abs(best - fromMidi) ? m : best,
    )
  }

  // No close diatonic neighbour → fall back to chromatic half-step (if tension allows)
  if (tension > 0.4) {
    return fromMidi + 1  // chromatic passing tone upward
  }

  // Last resort: jump to nearest pool note
  return nearestInPool(fromMidi + 2, pool)
}

/**
 * Returns a note duration multiplier (in steps) based on texture.
 * sparse → longer notes, dense → shorter notes.
 */
function noteDuration(texture: MusicContext['texture']): number {
  switch (texture) {
    case 'sparse': return 4  // quarter note (4 × 16th)
    case 'dense':  return 1  // 16th note
    case 'medium':
    default:       return 2  // 8th note
  }
}
