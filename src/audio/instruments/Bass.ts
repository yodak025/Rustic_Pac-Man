import * as Tone from 'tone'
import { Instrument } from './base/Instrument'
import { MusicContext } from '../theory/MusicContext'
import { Pattern, type NoteEvent } from '../patterns/Pattern'
import { DEFAULT_BASS_CONFIG, type BassConfig } from './base/InstrumentConfig'
import { noteToMidi, midiToNote } from '../theory/Note'


// ---------------------------------------------------------------------------
// Bass register constants
// ---------------------------------------------------------------------------

const BASS_LOW: string = 'C2'
const BASS_HIGH: string = 'C4'

/**
 * Bass is the second level of the instrument hierarchy.
 * It listens to Percussion's pattern and places root/chord-tone notes
 * on kick positions, filling the harmonic foundation.
 *
 * Cascade contract:
 *  - Parent: Percussion (required — Bass needs kick positions)
 *  - Children: Pad, Lead1, Lead2
 *
 * Generation rules (music-theory grounded):
 *  1. On every kick step, play the root of the current chord.
 *  2. On strong beats without a kick, play the 5th (stability).
 *  3. On weak off-beats (at dense texture), add passing chromatic
 *     approach notes toward the next chord tone.
 *  4. All notes are snapped into the scale using Scale.snapToScale().
 *  5. Range is clamped between C2–C4.
 */
export class Bass extends Instrument {
  private config: BassConfig
  private synth: Tone.Synth | null = null
  private loop: Tone.Loop | null = null

  // Cached kick positions from the last parent update (steps 0–15)
  private kickSteps: Set<number> = new Set()

  constructor(context: MusicContext, config: BassConfig = DEFAULT_BASS_CONFIG) {
    super('bass', context)
    this.config = config
  }

  // ---------------------------------------------------------------------------
  // Instrument abstract implementations
  // ---------------------------------------------------------------------------

  protected buildSynth(): void {
    this.synth = new Tone.Synth({
      oscillator: { type: this.config.oscillatorType },
      envelope: {
        attack: this.config.envelope.attack,
        decay: this.config.envelope.decay,
        sustain: this.config.envelope.sustain,
        release: this.config.envelope.release,
      },
      volume: this.config.volumeDb,
    }).toDestination()
  }

  generatePattern(): Pattern {
    return this.buildBassPattern(this.kickSteps)
  }

  protected schedulePattern(): void {
    this.clearLoop()

    const notes = this._pattern?.notes ?? []
    if (notes.length === 0) return

    let stepIndex = 0

    this.loop = new Tone.Loop((time) => {
      if (!this._active) {
        stepIndex = (stepIndex + 1) % notes.length
        return
      }

      const event = notes[stepIndex]
      if (event.pitch !== null) {
        this.synth?.triggerAttackRelease(
          event.pitch,
          // Duration in Tone time: bars → we express as a fraction of a bar
          barDurationToToneTime(event.duration),
          time,
          event.velocity,
        )
      }

      stepIndex = (stepIndex + 1) % notes.length
    }, '16n')

    this.loop.start(0)
  }

  /**
   * Called by Percussion after it regenerates its grid.
   * Bass reads the kick positions and rebuilds its pattern accordingly.
   */
  updateFromParent(parentPattern: Pattern): void {
    this.kickSteps = extractKickSteps(parentPattern)
    this._pattern = this.buildBassPattern(this.kickSteps)
    this.schedulePattern()
    this.notifyChildren()
  }

  protected destroySynth(): void {
    this.clearLoop()
    this.synth?.dispose()
    this.synth = null
  }

  // ---------------------------------------------------------------------------
  // Private: pattern generation
  // ---------------------------------------------------------------------------

  /**
   * Builds a 16-step bass line that reacts to the drum grid.
   *
   * Step classification:
   *   kick step          → root note of current chord
   *   strong beat (0,4,8,12) without kick → chord 5th
   *   dense off-beat     → chromatic approach note
   *   all other steps    → rest
   */
  private buildBassPattern(kickSteps: Set<number>): Pattern {
    const { scale, currentChord, intensity, texture } = this._context
    const chord = currentChord
    const rootNote  = clampToRange(chord.getBassNote(2), BASS_LOW, BASS_HIGH)
    const fifthNote = clampToRange(getFifth(chord.getBassNote(2), scale), BASS_LOW, BASS_HIGH)

    const stepDuration = 0.0625 // 1 bar / 16
    const events: NoteEvent[] = []

    for (let i = 0; i < 16; i++) {
      const time = i * stepDuration
      const isKick = kickSteps.has(i)
      const isStrongBeat = i % 4 === 0
      const isDenseOffbeat = texture === 'dense' && i % 2 !== 0 && intensity > 0.5

      let pitch: string | null = null
      let velocity = 0

      if (isKick) {
        pitch = rootNote
        velocity = 0.85 + intensity * 0.15
      } else if (isStrongBeat) {
        pitch = fifthNote
        velocity = 0.6 + intensity * 0.15
      } else if (isDenseOffbeat) {
        // Chromatic approach: half-step below the next strong beat's note
        const nextStrongBeat = Math.ceil((i + 1) / 4) * 4 % 16
        const targetNote = kickSteps.has(nextStrongBeat) ? rootNote : fifthNote
        pitch = scale.snapToScale(approachNote(targetNote))
        velocity = 0.45
      }

      if (pitch !== null) {
        events.push({ pitch, time, duration: stepDuration, velocity })
      }
    }

    return new Pattern(events, 1, 16)
  }

  private clearLoop(): void {
    if (this.loop) {
      this.loop.stop()
      this.loop.dispose()
      this.loop = null
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the set of 16-step indices where the kick drum hits,
 * identified by pitch 'C1' (see Percussion.gridToPattern).
 */
function extractKickSteps(pattern: Pattern): Set<number> {
  const stepDuration = 0.0625
  const kicks = new Set<number>()
  pattern.notes.forEach((n) => {
    if (n.pitch === 'C1') {
      const step = Math.round(n.time / stepDuration)
      kicks.add(step)
    }
  })
  return kicks
}

/**
 * Returns the perfect 5th above the given bass note, clamped to range.
 */
function getFifth(note: string, scale: MusicContext['scale']): string {
  const midi = noteToMidi(note) + 7
  return scale.snapToScale(midiToNote(midi))
}

/**
 * Returns the half-step below the given note (chromatic approach).
 */
function approachNote(note: string): string {
  return midiToNote(noteToMidi(note) - 1)
}

/**
 * Clamps a note into [low, high] by shifting octaves.
 */
function clampToRange(note: string, low: string, high: string): string {
  let midi = noteToMidi(note)
  const lo = noteToMidi(low)
  const hi = noteToMidi(high)
  while (midi < lo) midi += 12
  while (midi > hi) midi -= 12
  return midiToNote(Math.max(lo, Math.min(hi, midi)))
}

/**
 * Converts a duration in bars to a Tone.js time string.
 * 0.0625 bars = 1/16 of a bar = '16n'
 */
function barDurationToToneTime(bars: number): string {
  const sixteenths = Math.round(bars / 0.0625)
  if (sixteenths <= 0) return '32n'
  if (sixteenths === 1) return '16n'
  if (sixteenths === 2) return '8n'
  if (sixteenths === 4) return '4n'
  if (sixteenths === 8) return '2n'
  return `${sixteenths * 16}n`
}
