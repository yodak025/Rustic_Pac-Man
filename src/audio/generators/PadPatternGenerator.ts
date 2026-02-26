import { Pattern, type NoteEvent } from '../patterns/Pattern'
import { type MusicContext } from '../theory/MusicContext'
import { noteToMidi, midiToNote, type NoteName } from '../theory/Note'
import { distributeSteps } from './RhythmGenerator'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAD_LOW:  NoteName = 'C3'
const PAD_HIGH: NoteName = 'C5'

// Chord event duration options (in bars) indexed by texture
const CHORD_DURATIONS: Record<MusicContext['texture'], number> = {
  sparse: 1.0,     // sustain for a full bar
  medium: 0.5,     // half-bar chord stabs
  dense:  0.25,    // quarter-bar rhythmic comping
}

// How many chord events per bar for each texture
const CHORD_EVENT_COUNT: Record<MusicContext['texture'], number> = {
  sparse: 1,
  medium: 2,
  dense:  4,
}

/**
 * PadPatternGenerator
 *
 * Generates sustained harmonic pads: diatonic chord tones played together
 * (polyphonic) as NoteEvents. The density and voicing are driven by the
 * MusicContext (intensity, texture, tension, current chord).
 *
 * Single Responsibility: transform MusicContext → polyphonic pad Pattern.
 * No Tone.js, no state.
 *
 * Generation rules:
 *   - Chord tones are voiced in the pad register (C3–C5).
 *   - Number of voices: 2 (sparse), 3 (medium), 4 (dense).
 *   - Non-zero tension allows adding the 7th / 9th extensions.
 *   - Chord events are rhythmically distributed using euclidean placement.
 *   - All notes are clamped to the pad range.
 */
export class PadPatternGenerator {
  /**
   * Generates a 1-bar pad Pattern from the current MusicContext.
   * `parentPattern` (bass) is accepted but currently not used —
   * reserved for future voice-leading alignment.
   */
  generate(context: MusicContext, _parentPattern?: Pattern): Pattern {
    return this.buildPattern(context)
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private buildPattern(context: MusicContext): Pattern {
    const { scale, currentChord, intensity, texture, tension } = context

    // --- Choose chord tones ---
    const voiceCount = voiceCountForTexture(texture)
    const chordNotes = getVoicedNotes(currentChord, scale, voiceCount, tension, PAD_LOW, PAD_HIGH)

    // --- Choose rhythmic placement ---
    const eventCount  = CHORD_EVENT_COUNT[texture]
    const duration    = CHORD_DURATIONS[texture]
    const seed        = intensity  // stable, derived from context
    const placement   = distributeSteps(eventCount, 16, seed)

    // --- Build events ---
    const events: NoteEvent[] = []
    const stepDur = 0.0625  // 1/16 bar

    placement.forEach((active, stepIndex) => {
      if (!active) return
      const time     = stepIndex * stepDur
      const velocity = 0.5 + intensity * 0.35

      chordNotes.forEach((note) => {
        events.push({ pitch: note, time, duration, velocity })
      })
    })

    return new Pattern(events, 1, 16)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the number of voices based on texture.
 */
function voiceCountForTexture(texture: MusicContext['texture']): number {
  switch (texture) {
    case 'sparse': return 2
    case 'dense':  return 4
    case 'medium':
    default:       return 3
  }
}

/**
 * Voices a chord in close position within the pad register.
 * Respects tension: at tension > 0.5 adds the 7th, at > 0.8 adds the 9th.
 *
 * @param chord      The current chord
 * @param scale      The current scale (for 7th/9th snapping)
 * @param voiceCount How many voices to include
 * @param tension    0–1 tension (chromatic extensions at higher values)
 * @param low        Lowest allowed note
 * @param high       Highest allowed note
 */
function getVoicedNotes(
  chord: MusicContext['currentChord'],
  scale: MusicContext['scale'],
  voiceCount: number,
  tension: number,
  low: NoteName,
  high: NoteName,
): NoteName[] {
  // Base octave for pad voicing (mid register)
  const rootOctave = 3
  const baseNotes  = chord.getNotes(rootOctave)

  // Build pool: triad + optional extensions
  const pool: NoteName[] = [...baseNotes]

  if (tension > 0.5 && pool.length < voiceCount + 1) {
    // Add scale 7th above the root
    const rootMidi = noteToMidi(baseNotes[0])
    const seventh  = scale.snapToScale(midiToNote(rootMidi + 10))
    pool.push(seventh)
  }
  if (tension > 0.8 && pool.length < voiceCount + 1) {
    // Add scale 9th above the root
    const rootMidi = noteToMidi(baseNotes[0])
    const ninth    = scale.snapToScale(midiToNote(rootMidi + 14))
    pool.push(ninth)
  }

  // Take the required number of voices (from bottom up)
  const selected = pool.slice(0, voiceCount)

  // Clamp each voice to the pad register
  return selected.map((n) => clampToRange(n, low, high))
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


