import { Pattern, type NoteEvent } from '../patterns/Pattern'
import { type MusicContext } from '../theory/MusicContext'
import { noteToMidi, midiToNote, type NoteName } from '../theory/Note'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_DURATION = 0.0625  // 1 bar / 16 steps
const BASS_LOW:  NoteName = 'C2'
const BASS_HIGH: NoteName = 'C4'
const KICK_PITCH = 'C1'

/**
 * BassPatternGenerator
 *
 * Builds a 1-bar, 16-step bass line that reacts to the percussion kick grid
 * (extracted from the parent Pattern) and the current chord/scale context.
 *
 * Single Responsibility: transform (MusicContext, kickSteps) → bass Pattern.
 * No Tone.js, no state.
 *
 * Generation rules (music-theory grounded):
 *   1. Kick step        → root note of the current chord
 *   2. Strong beat (0,4,8,12) without kick → chord 5th
 *   3. Dense off-beat (texture=dense, intensity>0.5) → chromatic approach note
 *      toward the next strong beat's chord tone, snapped to scale
 *   4. All other steps  → rest
 *   5. All notes clamped to C2–C4
 */
export class BassPatternGenerator {
  /**
   * Generates a bass Pattern that aligns to the kick positions in `parentPattern`.
   *
   * @param context      Current MusicContext (scale, chord, intensity, texture)
   * @param parentPattern Percussion pattern — kick steps identified by pitch 'C1'
   */
  generate(context: MusicContext, parentPattern: Pattern): Pattern {
    const kickSteps = extractKickSteps(parentPattern)
    return this.buildPattern(context, kickSteps)
  }

  /**
   * Generates a bass Pattern without a parent (standalone use / initialisation).
   * Falls back to default kick positions (beats 1 and 3).
   */
  generateStandalone(context: MusicContext): Pattern {
    const defaultKicks = new Set([0, 8])
    return this.buildPattern(context, defaultKicks)
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private buildPattern(context: MusicContext, kickSteps: Set<number>): Pattern {
    const { scale, currentChord, intensity, texture } = context

    const rootNote  = clampToRange(currentChord.getBassNote(2), BASS_LOW, BASS_HIGH)
    const fifthNote = clampToRange(getFifth(currentChord.getBassNote(2), scale), BASS_LOW, BASS_HIGH)

    const events: NoteEvent[] = []

    for (let i = 0; i < 16; i++) {
      const time         = i * STEP_DURATION
      const isKick       = kickSteps.has(i)
      const isStrongBeat = i % 4 === 0
      const isDenseOffbeat = texture === 'dense' && i % 2 !== 0 && intensity > 0.5

      let pitch: NoteName | null = null
      let velocity = 0

      if (isKick) {
        pitch    = rootNote
        velocity = 0.85 + intensity * 0.15
      } else if (isStrongBeat) {
        pitch    = fifthNote
        velocity = 0.6 + intensity * 0.15
      } else if (isDenseOffbeat) {
        const nextStrongStep  = Math.ceil((i + 1) / 4) * 4 % 16
        const targetNote      = kickSteps.has(nextStrongStep) ? rootNote : fifthNote
        pitch    = scale.snapToScale(approachNote(targetNote))
        velocity = 0.45
      }

      if (pitch !== null) {
        events.push({ pitch, time, duration: STEP_DURATION, velocity })
      }
    }

    return new Pattern(events, 1, 16)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the 16-step indices where the kick hits.
 * Kick steps are identified by symbolic pitch 'C1' (see PercussionPatternGenerator).
 */
function extractKickSteps(pattern: Pattern): Set<number> {
  const kicks = new Set<number>()
  pattern.notes.forEach((n) => {
    if (n.pitch === KICK_PITCH) {
      kicks.add(Math.round(n.time / STEP_DURATION))
    }
  })
  return kicks
}

/** Returns the perfect 5th above `note`, snapped to scale. */
function getFifth(note: NoteName, scale: MusicContext['scale']): NoteName {
  return scale.snapToScale(midiToNote(noteToMidi(note) + 7))
}

/** Returns the half-step below `note` (chromatic approach). */
function approachNote(note: NoteName): NoteName {
  return midiToNote(noteToMidi(note) - 1)
}

/** Clamps a note into the range [low, high] by shifting octaves. */
function clampToRange(note: NoteName, low: NoteName, high: NoteName): NoteName {
  let midi     = noteToMidi(note)
  const loMidi = noteToMidi(low)
  const hiMidi = noteToMidi(high)
  while (midi < loMidi) midi += 12
  while (midi > hiMidi) midi -= 12
  return midiToNote(Math.max(loMidi, Math.min(hiMidi, midi)))
}
