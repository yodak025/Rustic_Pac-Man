import { Transport, type QuantizeResolution } from '../core/Transport'
import { type MusicContext } from '../theory/MusicContext'
import type { Instrument } from '../instruments/base/Instrument'

/**
 * Callback invoked when a scheduled context switch actually takes effect
 * (i.e. at the quantized time boundary, not when it was requested).
 */
export type TransitionCallback = (context: MusicContext) => void

/**
 * TransitionManager
 *
 * Schedules MusicContext changes to execute at the nearest quantized
 * subdivision boundary rather than immediately. This prevents jarring
 * mid-phrase cuts: the new context takes effect cleanly on the next grid.
 *
 * Single Responsibility: decide *when* context transitions happen.
 * It does not decide what new context to use — that is the orchestrator's job.
 *
 * Design notes:
 *  - Only one pending transition is held at a time. Requesting a second
 *    transition while one is already queued replaces the pending request
 *    (last-write-wins). This avoids a queue pile-up when the game rapidly
 *    changes state.
 *  - The actual instrument update (calling setContext on each instrument)
 *    is deferred to the quantized moment via the Transport.
 *  - BPM ramps happen over `BPM_RAMP_SECONDS` to avoid clicks.
 */
export class TransitionManager {
  private static readonly BPM_RAMP_SECONDS = 2

  private readonly transport: Transport
  private readonly resolution: QuantizeResolution

  private _pendingContext: MusicContext | null = null
  private _isTransitioning: boolean = false

  /** External listeners notified after each transition completes. */
  private readonly callbacks: TransitionCallback[] = []

  constructor(transport: Transport, resolution: QuantizeResolution = '16n') {
    this.transport = transport
    this.resolution = resolution
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Requests a context switch that will be applied at the next quantized
   * subdivision boundary.
   *
   * @param newContext  The target MusicContext.
   * @param instruments The instruments to update when the boundary arrives.
   */
  requestTransition(newContext: MusicContext, instruments: Instrument[]): void {
    // Overwrite any pending (not yet executed) transition
    this._pendingContext = newContext

    if (this._isTransitioning) return   // already a schedule in-flight, will use latest pending
    this._isTransitioning = true

    this.transport.scheduleOnNextBeat((_time: number) => {
      // Use the *latest* pending context at execution time (may have changed)
      const ctx = this._pendingContext
      this._pendingContext = null
      this._isTransitioning = false

      if (!ctx) return

      // Ramp BPM if it changed
      if (ctx.bpm !== this.transport.bpm) {
        this.transport.rampBpm(ctx.bpm, TransitionManager.BPM_RAMP_SECONDS)
      }

      // Update all instruments (each calls generatePattern + schedulePattern)
      instruments.forEach((instr) => instr.setContext(ctx))

      // Notify external listeners (e.g. the orchestrator's state cache)
      this.callbacks.forEach((cb) => cb(ctx))
    }, this.resolution)
  }

  /**
   * Immediately applies a context transition without waiting for the next beat.
   * Use only during initialisation — not while playback is running.
   */
  applyImmediate(newContext: MusicContext, instruments: Instrument[]): void {
    this._pendingContext = null
    this._isTransitioning = false

    if (newContext.bpm !== this.transport.bpm) {
      this.transport.setBpm(newContext.bpm)
    }

    instruments.forEach((instr) => instr.setContext(newContext))
    this.callbacks.forEach((cb) => cb(newContext))
  }

  /**
   * Cancels any pending (not yet executed) transition.
   * The current musical context is left unchanged.
   */
  cancelPending(): void {
    this._pendingContext = null
    this._isTransitioning = false
  }

  /** Returns true when a transition has been scheduled but not yet applied. */
  get isPending(): boolean {
    return this._isTransitioning
  }

  // ---------------------------------------------------------------------------
  // Listener management
  // ---------------------------------------------------------------------------

  onTransition(cb: TransitionCallback): void {
    this.callbacks.push(cb)
  }

  removeListener(cb: TransitionCallback): void {
    const idx = this.callbacks.indexOf(cb)
    if (idx !== -1) this.callbacks.splice(idx, 1)
  }
}
