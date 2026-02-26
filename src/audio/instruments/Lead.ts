import * as Tone from 'tone'
import { Instrument } from './base/Instrument'
import { MusicContext } from '../theory/MusicContext'
import { Pattern } from '../patterns/Pattern'
import { DEFAULT_LEAD_CONFIG, type LeadConfig } from './base/InstrumentConfig'
import { LeadPatternGenerator } from '../generators/LeadPatternGenerator'

/**
 * Lead — fourth (and final) level of the instrument cascade.
 * Two instances are used in practice: Lead1 (primary melody) and Lead2
 * (diatonic harmonisation of Lead1).
 *
 * Uses a monophonic Tone.Synth with a square-wave oscillator for the
 * classic 8-bit melodic character.
 *
 * Cascade contract:
 *  - Parent:   Pad (pattern used to align melodic phrases)
 *  - Children: none (leaf node)
 *
 * Lead1 generates its melody via `LeadPatternGenerator.generate()`.
 * Lead2 is configured in `harmony` mode and calls
 * `LeadPatternGenerator.generateHarmony()` using Lead1's pattern as input.
 * The orchestrator is responsible for wiring Lead1 as the parent of Lead2.
 *
 * Audio design:
 *  - Square wave → bright, nasal, retro melody tone
 *  - Fast attack + short release → staccato 8-bit feel
 *  - Monophonic → plays one note at a time
 */
export class Lead extends Instrument {
  private config: LeadConfig
  private synth: Tone.Synth | null = null
  private loop: Tone.Loop | null = null

  /** When true this instance harmonises its parent's pattern (Lead2 mode). */
  private readonly harmonyMode: boolean

  private readonly generator = new LeadPatternGenerator()

  /**
   * @param context     Current MusicContext
   * @param config      Synth configuration (defaults to square-wave 8-bit lead)
   * @param harmonyMode When true, generates a diatonic 3rd harmony of the parent
   *                    pattern instead of an independent melody (Lead2 mode).
   */
  constructor(
    context: MusicContext,
    config: LeadConfig = DEFAULT_LEAD_CONFIG,
    harmonyMode: boolean = false,
  ) {
    super(harmonyMode ? 'lead2' : 'lead1', context)
    this.config = config
    this.harmonyMode = harmonyMode
  }

  // ---------------------------------------------------------------------------
  // Instrument abstract implementations
  // ---------------------------------------------------------------------------

  protected buildSynth(): void {
    this.synth = new Tone.Synth({
      oscillator: { type: this.config.oscillatorType },
      envelope: {
        attack:  this.config.envelope.attack,
        decay:   this.config.envelope.decay,
        sustain: this.config.envelope.sustain,
        release: this.config.envelope.release,
      },
      volume: this.config.volumeDb,
    }).toDestination()
  }

  generatePattern(): Pattern {
    const parentPattern = this.parent?.currentPattern ?? undefined

    if (this.harmonyMode && parentPattern) {
      return this.generator.generateHarmony(this._context, parentPattern)
    }
    return this.generator.generate(this._context, parentPattern)
  }

  protected schedulePattern(): void {
    this.clearLoop()

    const notes = this._pattern?.notes ?? ([] as Pattern['notes'])
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
          barsDurationToToneTime(event.duration),
          time,
          event.velocity,
        )
      }

      stepIndex = (stepIndex + 1) % notes.length
    }, '16n')

    this.loop.start(0)
  }

  /**
   * Called by Pad (or Lead1 in the case of Lead2) after pattern regeneration.
   *
   * In melody mode (Lead1): rebuilds the phrase from the updated pad context.
   * In harmony mode (Lead2): harmonises the incoming Lead1 pattern directly.
   */
  updateFromParent(parentPattern: Pattern): void {
    if (this.harmonyMode) {
      this._pattern = this.generator.generateHarmony(this._context, parentPattern)
    } else {
      this._pattern = this.generator.generate(this._context, parentPattern)
    }
    this.schedulePattern()
    this.notifyChildren()
  }

  protected destroySynth(): void {
    this.clearLoop()
    this.synth?.dispose()
    this.synth = null
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

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
 * Converts a note duration in bars to a Tone.js time string.
 */
function barsDurationToToneTime(bars: number): string {
  const sixteenths = Math.round(bars / 0.0625)
  if (sixteenths <= 0)   return '32n'
  if (sixteenths === 1)  return '16n'
  if (sixteenths === 2)  return '8n'
  if (sixteenths === 4)  return '4n'
  if (sixteenths === 8)  return '2n'
  if (sixteenths === 16) return '1m'
  return `${sixteenths * 16}n`
}
