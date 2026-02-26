import * as Tone from 'tone'

export type QuantizeResolution =
  | '1n'  // whole note
  | '2n'  // half note
  | '4n'  // quarter note
  | '8n'  // eighth note
  | '16n' // sixteenth note
  | '32n' // thirty-second note

/**
 * Thin wrapper over Tone.Transport that adds:
 *  - Quantized scheduling (schedule changes on the next grid subdivision)
 *  - BPM management with optional ramp
 *  - Simple state queries
 *
 * Single Responsibility: manages *when* things happen.
 * Does not decide *what* plays — that belongs to instruments.
 */
export class Transport {
  private readonly toneTransport: ReturnType<typeof Tone.getTransport>

  constructor() {
    this.toneTransport = Tone.getTransport()
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  start(): void {
    this.toneTransport.start()
  }

  stop(): void {
    this.toneTransport.stop()
  }

  pause(): void {
    this.toneTransport.pause()
  }

  /**
   * Fully resets the transport to position 0:0:0.
   * Should be called before re-initialising patterns.
   */
  reset(): void {
    this.toneTransport.stop()
    this.toneTransport.position = '0:0:0'
  }

  get isRunning(): boolean {
    return this.toneTransport.state === 'started'
  }

  // ---------------------------------------------------------------------------
  // Tempo
  // ---------------------------------------------------------------------------

  setBpm(bpm: number): void {
    this.toneTransport.bpm.value = bpm
  }

  /**
   * Smoothly ramps BPM over `rampTime` seconds.
   * Useful for cross-context transitions.
   */
  rampBpm(targetBpm: number, rampTimeSeconds: number): void {
    this.toneTransport.bpm.rampTo(targetBpm, rampTimeSeconds)
  }

  get bpm(): number {
    return this.toneTransport.bpm.value
  }

  setTimeSignature(numerator: number, denominator: number): void {
    this.toneTransport.timeSignature = [numerator, denominator]
  }

  // ---------------------------------------------------------------------------
  // Quantized scheduling
  // ---------------------------------------------------------------------------

  /**
   * Schedules `callback` to execute on the *next* grid boundary of the
   * given resolution.
   *
   * This is the core of the adaptive-music system: instead of applying
   * changes immediately (which would sound jarring mid-phrase), we defer
   * them to the nearest upcoming subdivision beat.
   *
   * @param callback  Function to call at the quantized time. Receives the
   *                  sample-accurate AudioContext time value.
   * @param resolution Smallest rhythmic unit to align to (default '16n').
   */
  scheduleOnNextBeat(
    callback: (time: number) => void,
    resolution: QuantizeResolution = '16n',
  ): void {
    const nextBeat = this.getNextQuantizedPosition(resolution)
    this.toneTransport.schedule(callback, nextBeat)
  }

  /**
   * Schedules a *recurring* callback aligned to the grid.
   * Returns the Tone.Loop so the caller can stop it when needed.
   */
  scheduleLoop(
    callback: (time: number) => void,
    interval: QuantizeResolution,
    startAt: QuantizeResolution | number = 0,
  ): Tone.Loop {
    const loop = new Tone.Loop(callback, interval)
    loop.start(startAt)
    return loop
  }

  /**
   * Cancels all events scheduled after the current transport position.
   * Use with care — typically called during a full pattern reset.
   */
  cancelFuture(): void {
    this.toneTransport.cancel(Tone.now())
  }

  // ---------------------------------------------------------------------------
  // Position utilities
  // ---------------------------------------------------------------------------

  /**
   * Returns the current transport position as a BBT string (Bars:Beats:Ticks).
   */
  get position(): string {
    return String(this.toneTransport.position)
  }

  /**
   * Computes the AudioContext time of the next subdivision boundary.
   *
   * Strategy:
   *  1. Get current time in seconds
   *  2. Compute the duration of one `resolution` subdivision in seconds
   *  3. Round up to the next multiple of that subdivision
   */
  getNextQuantizedPosition(resolution: QuantizeResolution): number {
    const now = Tone.now()
    const subdivisionSeconds = Tone.Time(resolution).toSeconds()
    return Math.ceil(now / subdivisionSeconds) * subdivisionSeconds
  }

  // ---------------------------------------------------------------------------
  // Direct Tone.Transport access (escape hatch for advanced use)
  // ---------------------------------------------------------------------------

  get native(): ReturnType<typeof Tone.getTransport> {
    return this.toneTransport
  }
}
