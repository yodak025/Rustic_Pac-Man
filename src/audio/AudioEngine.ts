import * as Tone from 'tone'
import { Transport } from './core/Transport'
import { Clock } from './core/Clock'

export type AudioEngineState = 'uninitialized' | 'ready' | 'running' | 'paused' | 'disposed'

/**
 * Central singleton that owns the Tone.js AudioContext, Transport and Clock.
 *
 * Single Responsibility: bootstrap and lifecycle management of the audio
 * subsystem. It does not know about music theory or instruments — it only
 * ensures the audio context is running and hands out the shared Transport
 * and Clock to whoever needs them.
 *
 * Usage:
 *   const engine = AudioEngine.getInstance()
 *   await engine.initialize()   // must be called from a user-gesture handler
 *   engine.start()
 */
export class AudioEngine {
  private static instance: AudioEngine | null = null

  private _state: AudioEngineState = 'uninitialized'
  private _transport: Transport | null = null
  private _clock: Clock | null = null

  // Private constructor enforces singleton pattern
  private constructor() {}

  // ---------------------------------------------------------------------------
  // Singleton accessor
  // ---------------------------------------------------------------------------

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Initialises the Web Audio context.
   *
   * MUST be called from inside a user-gesture event handler (click, keydown…)
   * because browsers block AudioContext creation until a user interaction.
   * Returns immediately if already initialised.
   */
  async initialize(): Promise<void> {
    if (this._state !== 'uninitialized') return

    await Tone.start()

    this._transport = new Transport()
    this._clock = new Clock(this._transport)

    this._state = 'ready'
  }

  /**
   * Starts the Transport and Clock.
   * Requires initialize() to have been awaited first.
   */
  start(bpm?: number): void {
    this.assertReady()

    if (bpm !== undefined) {
      this._transport!.setBpm(bpm)
    }

    this._clock!.start()
    this._transport!.start()
    this._state = 'running'
  }

  pause(): void {
    if (this._state !== 'running') return
    this._transport!.pause()
    this._state = 'paused'
  }

  resume(): void {
    if (this._state !== 'paused') return
    this._transport!.start()
    this._state = 'running'
  }

  stop(): void {
    if (this._state !== 'running' && this._state !== 'paused') return
    this._clock!.stop()
    this._transport!.reset()
    this._state = 'ready'
  }

  /**
   * Tears down everything. The singleton resets so it can be re-initialised.
   * Useful for hot-module replacement during development.
   */
  dispose(): void {
    if (this._state === 'disposed') return

    this._clock?.stop()
    this._transport?.reset()
    Tone.getContext().dispose()

    this._transport = null
    this._clock = null
    this._state = 'disposed'
    AudioEngine.instance = null
  }

  // ---------------------------------------------------------------------------
  // Accessors (only available after initialize())
  // ---------------------------------------------------------------------------

  get transport(): Transport {
    this.assertReady()
    return this._transport!
  }

  get clock(): Clock {
    this.assertReady()
    return this._clock!
  }

  get state(): AudioEngineState {
    return this._state
  }

  get isRunning(): boolean {
    return this._state === 'running'
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private assertReady(): void {
    if (!this._transport || !this._clock) {
      throw new Error(
        'AudioEngine not initialised. Call initialize() from a user-gesture handler first.',
      )
    }
  }
}
