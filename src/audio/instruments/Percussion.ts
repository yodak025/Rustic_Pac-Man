import * as Tone from 'tone'
import { Instrument } from './base/Instrument'
import { MusicContext } from '../theory/MusicContext'
import { Pattern, type NoteEvent } from '../patterns/Pattern'
import {
  DEFAULT_PERCUSSION_CONFIG,
  type PercussionConfig,
} from './base/InstrumentConfig'

// ---------------------------------------------------------------------------
// Percussion step — internal data for the 16-step grid
// ---------------------------------------------------------------------------

export interface PercussionStep {
  kick: boolean
  snare: boolean
  hihat: boolean
}

/**
 * Percussion is the root instrument in the hierarchy.
 * It has no parent — it drives the time feel for Bass, Pad, and Leads.
 *
 * Three Tone.js voices:
 *  - Kick  → MembraneSynth  (pitched frequency-sweep)
 *  - Snare → NoiseSynth     (white-noise burst)
 *  - Hihat → MetalSynth     (high-frequency inharmonic)
 *
 * The pattern is stored as a flat NoteEvent array in the base class,
 * but internally we think in terms of a 16-step boolean grid per voice.
 * The grid is exposed so children (Bass) can inspect kick placements.
 */
export class Percussion extends Instrument {
  private config: PercussionConfig

  // Tone.js synths — created in buildSynth(), null until then
  private kickSynth: Tone.MembraneSynth | null = null
  private snareSynth: Tone.NoiseSynth | null = null
  private hihatSynth: Tone.MetalSynth | null = null

  // Tone.js loop — recreated on every schedulePattern()
  private loop: Tone.Loop | null = null

  // Step grid kept in sync with _pattern for child consumption
  private _grid: PercussionStep[] = []

  constructor(context: MusicContext, config: PercussionConfig = DEFAULT_PERCUSSION_CONFIG) {
    super('percussion', context)
    this.config = config
  }

  // ---------------------------------------------------------------------------
  // Instrument abstract implementations
  // ---------------------------------------------------------------------------

  protected buildSynth(): void {
    const { kick, snare, hihat } = this.config

    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: kick.pitchDecay,
      octaves: kick.octaves,
      envelope: {
        attack: kick.envelope.attack,
        decay: kick.envelope.decay,
        sustain: kick.envelope.sustain,
        release: kick.envelope.release,
      },
    }).toDestination()

    this.snareSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: snare.envelope.attack,
        decay: snare.envelope.decay,
        sustain: snare.envelope.sustain,
        release: snare.envelope.release,
      },
    }).toDestination()

    this.hihatSynth = new Tone.MetalSynth({
      resonance: hihat.resonance,
      envelope: {
        attack: hihat.envelope.attack,
        decay: hihat.envelope.decay,
        sustain: hihat.envelope.sustain,
        release: hihat.envelope.release,
      },
    }).toDestination()
  }

  generatePattern(): Pattern {
    const steps = this.buildGrid()
    this._grid = steps
    return gridToPattern(steps)
  }

  protected schedulePattern(): void {
    this.clearLoop()

    const steps = this._grid
    if (steps.length === 0) return

    let stepIndex = 0

    this.loop = new Tone.Loop((time) => {
      if (!this._active) {
        stepIndex = (stepIndex + 1) % steps.length
        return
      }

      const step = steps[stepIndex]

      if (step.kick) {
        this.kickSynth?.triggerAttackRelease(
          this.config.kick.note,
          '16n',
          time,
          this.config.kick.velocity,
        )
      }
      if (step.snare) {
        this.snareSynth?.triggerAttackRelease('16n', time, this.config.snare.velocity)
      }
      if (step.hihat) {
        this.hihatSynth?.triggerAttackRelease('32n', time, this.config.hihat.velocity)
      }

      stepIndex = (stepIndex + 1) % steps.length
    }, '16n')

    this.loop.start(0)
  }

  // Percussion is the root — no parent to update from
  updateFromParent(_parentPattern: Pattern): void {}

  protected destroySynth(): void {
    this.clearLoop()
    this.kickSynth?.dispose()
    this.snareSynth?.dispose()
    this.hihatSynth?.dispose()
    this.kickSynth = null
    this.snareSynth = null
    this.hihatSynth = null
  }

  // ---------------------------------------------------------------------------
  // Public: expose the step grid for children
  // ---------------------------------------------------------------------------

  /**
   * Returns the current 16-step boolean grid.
   * Bass reads this to align root notes to kick positions.
   */
  get grid(): readonly PercussionStep[] {
    return this._grid
  }

  // ---------------------------------------------------------------------------
  // Private: pattern generation logic
  // ---------------------------------------------------------------------------

  /**
   * Builds a 16-step drum grid driven by the current MusicContext.
   *
   * Rules (theory-grounded, deterministic with intensity/texture):
   *  - Kick:  always on beats 1 and 3 (steps 0, 8). Extra kicks at high intensity.
   *  - Snare: always on beats 2 and 4 (steps 4, 12).
   *  - Hihat: depends on texture — sparse=8th, medium=16th, dense=16th with ghost.
   */
  private buildGrid(): PercussionStep[] {
    const { intensity, texture } = this._context
    const steps: PercussionStep[] = Array.from({ length: 16 }, () => ({
      kick: false,
      snare: false,
      hihat: false,
    }))

    // --- Kick ---
    steps[0].kick = true   // beat 1
    steps[8].kick = true   // beat 3

    if (intensity > 0.6) steps[4].kick = true   // beat 2 (+kick at high intensity)
    if (intensity > 0.85) steps[12].kick = true  // beat 4 (driving 4-on-floor)

    // --- Snare ---
    steps[4].snare = true   // beat 2
    steps[12].snare = true  // beat 4

    if (intensity > 0.75) steps[10].snare = true  // ghost snare on the "and" of 3

    // --- Hihat ---
    const hihatPattern = hihatGridForTexture(texture)
    hihatPattern.forEach((on, i) => {
      steps[i].hihat = on
    })

    return steps
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
 * Converts the 16-step boolean grid to a flat NoteEvent array.
 * Kick events use pitch 'C1', snare 'D1', hihat 'F#1' — these are
 * symbolic identifiers, not played pitches (percussion synths ignore pitch).
 * Having distinct pitches lets children distinguish voice types.
 */
function gridToPattern(steps: PercussionStep[]): Pattern {
  const stepDuration = 0.0625 // 1/16 of a bar
  const events: NoteEvent[] = []

  steps.forEach((step, i) => {
    const time = i * stepDuration
    if (step.kick)  events.push({ pitch: 'C1',  time, duration: stepDuration, velocity: 1.0 })
    if (step.snare) events.push({ pitch: 'D1',  time, duration: stepDuration, velocity: 0.7 })
    if (step.hihat) events.push({ pitch: 'F#1', time, duration: stepDuration, velocity: 0.45 })
  })

  return new Pattern(events, 1, 16) // 1 bar, 16th-note grid
}

/**
 * Returns a 16-element boolean array for the hihat voice
 * based on the desired texture density.
 */
function hihatGridForTexture(texture: MusicContext['texture']): boolean[] {
  switch (texture) {
    case 'sparse':
      // 8th notes only (steps 0, 2, 4, 6, 8, 10, 12, 14)
      return Array.from({ length: 16 }, (_, i) => i % 2 === 0)
    case 'dense':
      // All 16th notes + open hihat accents on up-beats
      return Array.from({ length: 16 }, () => true)
    case 'medium':
    default:
      // 8th notes + 16ths on the off-beats of beats 2 and 4
      return Array.from({ length: 16 }, (_, i) => {
        if (i % 2 === 0) return true  // all 8th notes
        if (i === 5 || i === 13) return true  // extra off-beat 16ths
        return false
      })
  }
}
