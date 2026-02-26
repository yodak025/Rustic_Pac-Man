import * as Tone from 'tone'
import { Transport, type QuantizeResolution } from './Transport'

export type BeatCallback = (beat: number, bar: number, time: number) => void

/**
 * Tracks musical time (bars and beats) on top of Transport.
 *
 * Single Responsibility: knows *where* we are in musical time and
 * notifies registered listeners on each beat subdivision.
 *
 * Listeners are called with sample-accurate Tone.js time values so they
 * can schedule audio events precisely without JS timing jitter.
 */
export class Clock {
  private readonly transport: Transport
  private readonly listeners: Set<BeatCallback> = new Set()
  private beatCounter: number = 0
  private barCounter: number = 0
  private beatsPerBar: number = 4
  private subdivisionLoop: Tone.Loop | null = null

  constructor(transport: Transport) {
    this.transport = transport
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Starts the beat tracking loop at the given resolution.
   * Must be called *after* Tone.start() has resolved.
   *
   * @param resolution The subdivision to tick on (default '16n' = sixteenth note).
   */
  start(resolution: QuantizeResolution = '16n'): void {
    this.stop() // clean up any previous loop

    this.beatCounter = 0
    this.barCounter = 0
    this.beatsPerBar = this.transport.native.timeSignature as number

    this.subdivisionLoop = this.transport.scheduleLoop(
      (time) => this.tick(time),
      resolution,
      0,
    )
  }

  stop(): void {
    if (this.subdivisionLoop) {
      this.subdivisionLoop.stop()
      this.subdivisionLoop.dispose()
      this.subdivisionLoop = null
    }
    this.beatCounter = 0
    this.barCounter = 0
  }

  // ---------------------------------------------------------------------------
  // Listener management
  // ---------------------------------------------------------------------------

  /** Registers a callback to be fired on every tracked subdivision. */
  addListener(callback: BeatCallback): void {
    this.listeners.add(callback)
  }

  removeListener(callback: BeatCallback): void {
    this.listeners.delete(callback)
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  get currentBeat(): number {
    return this.beatCounter
  }

  get currentBar(): number {
    return this.barCounter
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private tick(time: number): void {
    this.notifyListeners(this.beatCounter, this.barCounter, time)

    this.beatCounter++
    if (this.beatCounter >= this.beatsPerBar * 4) {
      // 4 sixteenth notes per beat × beatsPerBar = subdivisions per bar
      this.beatCounter = 0
      this.barCounter++
    }
  }

  private notifyListeners(beat: number, bar: number, time: number): void {
    this.listeners.forEach((cb) => cb(beat, bar, time))
  }
}
