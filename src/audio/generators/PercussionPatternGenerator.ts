import { Pattern, type NoteEvent } from '../patterns/Pattern'
import { type MusicContext } from '../theory/MusicContext'
import { kickGrid, snareGrid, hihatGrid } from './RhythmGenerator'

// ---------------------------------------------------------------------------
// Symbolic pitches for percussion voices
// ---------------------------------------------------------------------------
//
// These are NOT played pitches — the synths (MembraneSynth, NoiseSynth,
// MetalSynth) ignore pitch. They serve as identifiers so children can
// distinguish voice types by reading the parent pattern.
//
const KICK_PITCH  = 'C1'
const SNARE_PITCH = 'D1'
const HIHAT_PITCH = 'F#1'

const STEP_DURATION = 0.0625  // 1 bar / 16 steps

/**
 * PercussionPatternGenerator
 *
 * Builds a flat 1-bar, 16-step NoteEvent array for all percussion voices.
 *
 * Single Responsibility: transform MusicContext (intensity, texture)
 * into a percussion Pattern. No Tone.js, no state.
 *
 * Rules:
 *   - Kick  → steps from kickGrid (beats 1+3, extra kicks at high intensity)
 *   - Snare → steps from snareGrid (beats 2+4, ghost at high intensity)
 *   - Hihat → steps from hihatGrid (8th/16th density driven by texture)
 */
export class PercussionPatternGenerator {
  /**
   * Generates a fresh percussion Pattern from the supplied MusicContext.
   */
  generate(context: MusicContext): Pattern {
    const { intensity, texture } = context

    const kicks  = kickGrid(intensity)
    const snares = snareGrid(intensity)
    const hihats = hihatGrid(texture)

    const events: NoteEvent[] = []

    for (let i = 0; i < 16; i++) {
      const time = i * STEP_DURATION
      if (kicks[i])  events.push(kickEvent(time))
      if (snares[i]) events.push(snareEvent(time))
      if (hihats[i]) events.push(hihatEvent(time))
    }

    return new Pattern(events, 1, 16)
  }
}

// ---------------------------------------------------------------------------
// Private event factories
// ---------------------------------------------------------------------------

function kickEvent(time: number): NoteEvent {
  return { pitch: KICK_PITCH, time, duration: STEP_DURATION, velocity: 1.0 }
}

function snareEvent(time: number): NoteEvent {
  return { pitch: SNARE_PITCH, time, duration: STEP_DURATION, velocity: 0.7 }
}

function hihatEvent(time: number): NoteEvent {
  return { pitch: HIHAT_PITCH, time, duration: STEP_DURATION, velocity: 0.45 }
}
