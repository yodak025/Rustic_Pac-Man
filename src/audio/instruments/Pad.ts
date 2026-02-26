import * as Tone from 'tone'
import { Instrument } from './base/Instrument'
import { MusicContext } from '../theory/MusicContext'
import { Pattern } from '../patterns/Pattern'
import { DEFAULT_PAD_CONFIG, type PadConfig } from './base/InstrumentConfig'
import { PadPatternGenerator } from '../generators/PadPatternGenerator'

/**
 * Pad — third level of the instrument cascade.
 *
 * Provides harmonic sustain beneath the lead melodies.
 * Uses Tone.PolySynth with a triangle wave oscillator for a soft,
 * 8-bit-adjacent pad sound that doesn't fight the Bass for space.
 *
 * Cascade contract:
 *  - Parent:   Bass (pattern used to align chord rhythm)
 *  - Children: Lead1, Lead2
 *
 * Audio design:
 *  - Slow attack (0.4 s) + long release (0.8 s) → smooth swells
 *  - Triangle wave → rounded, low-harmonic-content timbre
 *  - PolySynth supports up to `maxPolyphony` simultaneous voices
 *  - Polyphonic NoteEvents played via Tone.Part for precise timing
 */
export class Pad extends Instrument {
  private config: PadConfig
  private polySynth: Tone.PolySynth | null = null
  private part: Tone.Part | null = null

  private readonly generator = new PadPatternGenerator()

  constructor(context: MusicContext, config: PadConfig = DEFAULT_PAD_CONFIG) {
    super('pad', context)
    this.config = config
  }

  // ---------------------------------------------------------------------------
  // Instrument abstract implementations
  // ---------------------------------------------------------------------------

  protected buildSynth(): void {
    this.polySynth = new Tone.PolySynth(Tone.Synth, {
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
    return this.generator.generate(this._context, this.parent?.currentPattern ?? undefined)
  }

  protected schedulePattern(): void {
    this.clearPart()

    const notes = this._pattern?.notes ?? ([] as Pattern['notes'])
    if (notes.length === 0) return

    // Build the event list for Tone.Part
    interface PartEvent { time: number; note: Pattern['notes'][number] }
    const partEvents: PartEvent[] = notes
      .filter((n: Pattern['notes'][number]) => n.pitch !== null)
      .map((n: Pattern['notes'][number]) => ({ time: barsToBBST(n.time), note: n }))

    this.part = new Tone.Part((time, event) => {
      if (!this._active) return
      const { note } = event as PartEvent
      if (note.pitch === null) return

      this.polySynth?.triggerAttackRelease(
        note.pitch,
        barsDurationToToneTime(note.duration),
        time,
        note.velocity,
      )
    }, partEvents)

    this.part.loop = true
    this.part.loopEnd = '1m'
    this.part.start(0)
  }

  /**
   * Called by Bass after it regenerates its pattern.
   * Pad rebuilds its chord voicing based on the updated context and
   * notifies Lead1/Lead2 downstream.
   */
  updateFromParent(parentPattern: Pattern): void {
    this._pattern = this.generator.generate(this._context, parentPattern)
    this.schedulePattern()
    this.notifyChildren()
  }

  protected destroySynth(): void {
    this.clearPart()
    this.polySynth?.dispose()
    this.polySynth = null
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private clearPart(): void {
    if (this.part) {
      this.part.stop()
      this.part.dispose()
      this.part = null
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a bar-offset (0–1) to a Tone.js BBT string relative to the
 * start of the current bar. Tone.Part accepts numeric seconds OR BBT strings.
 * We use the raw bar fraction (0 = bar start, 0.5 = halfway) which
 * Tone.js interprets as a measure-relative time when the Part loops every '1m'.
 *
 * Using raw numbers (0.0 … <1.0) is the simplest, most reliable approach
 * since Tone.Part times are in Transport time units by default.
 */
function barsToBBST(bars: number): number {
  // Tone.Part time values are in whole notes when `Tone.Transport` is running.
  // Expressing as a fraction of a bar is equivalent to a fraction of a whole note
  // in 4/4, so we pass the value as-is (0.0 → 0.9375 for 16 steps of 0.0625).
  return bars
}

/**
 * Converts a note duration in bars to a Tone.js time string.
 * Examples: 0.0625 → '16n', 0.125 → '8n', 0.25 → '4n', 1.0 → '1m'
 */
function barsDurationToToneTime(bars: number): string {
  const sixteenths = Math.round(bars / 0.0625)
  if (sixteenths <= 0)  return '32n'
  if (sixteenths === 1)  return '16n'
  if (sixteenths === 2)  return '8n'
  if (sixteenths === 4)  return '4n'
  if (sixteenths === 8)  return '2n'
  if (sixteenths === 16) return '1m'
  return `${sixteenths * 16}n`
}
