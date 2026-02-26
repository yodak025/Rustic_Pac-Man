import { AudioEngine } from '../AudioEngine'
import type { BeatCallback } from '../core/Clock'
import { Percussion } from '../instruments/Percussion'
import { Bass } from '../instruments/Bass'
import { Pad } from '../instruments/Pad'
import { Lead } from '../instruments/Lead'
import type { InstrumentRole } from '../instruments/base/Instrument'
import {
  DEFAULT_PERCUSSION_CONFIG,
  DEFAULT_BASS_CONFIG,
  DEFAULT_PAD_CONFIG,
  DEFAULT_LEAD_CONFIG,
} from '../instruments/base/InstrumentConfig'
import { MusicContext, type TextureDensity } from '../theory/MusicContext'
import { VariationEngine, type VariationRequest, type VariationType } from '../generators/VariationEngine'
import { LayerController } from './LayerController'
import { TransitionManager } from './TransitionManager'
import type { Pattern } from '../patterns/Pattern'

// ---------------------------------------------------------------------------
// Public state snapshot
// ---------------------------------------------------------------------------

export interface OrchestratorSnapshot {
  context: MusicContext
  layers: Record<InstrumentRole, boolean>
  isTransitioning: boolean
}

// ---------------------------------------------------------------------------
// MusicOrchestrator
// ---------------------------------------------------------------------------

/**
 * MusicOrchestrator
 *
 * The top-level public API for the adaptive music system.
 *
 * Responsibilities:
 *  - Builds and wires the full instrument cascade on `initialize()`.
 *  - Exposes musical control surface: intensity, texture, tension, level context.
 *  - Delegates layer muting to LayerController.
 *  - Delegates context transitions to TransitionManager (quantized).
 *  - Applies VariationEngine mutations on demand.
 *
 * Dependency Inversion: consumers call this class, never concrete instruments.
 * Single Responsibility: coordinate — not synthesize, not schedule details.
 *
 * Usage:
 * ```ts
 * const orch = MusicOrchestrator.getInstance()
 * await orch.initialize(initialContext)
 * orch.start()
 * orch.setIntensity(0.8)
 * orch.triggerVariation('lead1', { type: 'shiftPitch', amount: 0.4 })
 * ```
 */
export class MusicOrchestrator {
  private static instance: MusicOrchestrator | null = null

  private _context: MusicContext | null = null
  private _initialized: boolean = false

  // Instrument cascade
  private _percussion: Percussion | null = null
  private _bass: Bass | null = null
  private _pad: Pad | null = null
  private _lead1: Lead | null = null
  private _lead2: Lead | null = null

  // Sub-systems
  private readonly layers = new LayerController()
  private _transitions: TransitionManager | null = null
  private readonly variation = new VariationEngine()
  private _chordAdvanceListener: BeatCallback | null = null

  /** How many bars between automatic variation cycles. */
  private static readonly AUTO_VARIATION_BARS = 2

  /** Variation types used for auto-variation, with relative weights. */
  private static readonly AUTO_VARIATION_POOL: Array<{ type: VariationType; weight: number }> = [
    { type: 'shiftPitch',    weight: 4 },
    { type: 'scaleVelocity', weight: 3 },
    { type: 'shiftRhythm',   weight: 2 },
    { type: 'addNote',       weight: 2 },
    { type: 'removeNote',    weight: 2 },
    { type: 'double',        weight: 1 },
    { type: 'invert',        weight: 1 },
  ]

  private constructor() {}

  // ---------------------------------------------------------------------------
  // Singleton
  // ---------------------------------------------------------------------------

  static getInstance(): MusicOrchestrator {
    if (!MusicOrchestrator.instance) {
      MusicOrchestrator.instance = new MusicOrchestrator()
    }
    return MusicOrchestrator.instance
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Builds the full instrument cascade and initialises each synth.
   *
   * Must be called after `AudioEngine.initialize()` has resolved (i.e. inside
   * a user-gesture handler). Safe to call multiple times — subsequent calls
   * are no-ops unless `dispose()` was called first.
   */
  async initialize(context: MusicContext): Promise<void> {
    if (this._initialized) return

    const engine = AudioEngine.getInstance()
    if (engine.state === 'uninitialized') {
      await engine.initialize()
    }

    this._context = context

    // Build instruments
    this._percussion = new Percussion(context, DEFAULT_PERCUSSION_CONFIG)
    this._bass       = new Bass(context, DEFAULT_BASS_CONFIG)
    this._pad        = new Pad(context, DEFAULT_PAD_CONFIG)
    this._lead1      = new Lead(context, DEFAULT_LEAD_CONFIG, false)
    this._lead2      = new Lead(context, DEFAULT_LEAD_CONFIG, true)

    // Wire cascade hierarchy
    this._percussion.addChild(this._bass)
    this._bass.addChild(this._pad)
    this._pad.addChild(this._lead1)
    this._lead1.addChild(this._lead2)

    // Initialise synths and generate initial patterns (cascade fires top-down)
    this._percussion.initialize()
    // Bass/Pad/Lead1/Lead2 are initialised via the cascade (updateFromParent)
    // but we also call initialize() on them to build their synths first.
    this._bass.initialize()
    this._pad.initialize()
    this._lead1.initialize()
    this._lead2.initialize()

    // Register layers
    this.layers.register(this._percussion)
    this.layers.register(this._bass)
    this.layers.register(this._pad)
    this.layers.register(this._lead1)
    this.layers.register(this._lead2)

    // TransitionManager wired to the engine's transport
    this._transitions = new TransitionManager(engine.transport)
    this._transitions.onTransition((ctx) => { this._context = ctx })

    // Chord progression: advance one step every bar via the Clock.
    // Auto-variation: every AUTO_VARIATION_BARS bars, mutate all active layers.
    this._chordAdvanceListener = (beat: number, bar: number) => {
      if (beat !== 0) return
      if (!this._context || !this._transitions) return

      // Advance chord progression
      this.requestContextUpdate({
        currentChordIndex:
          (this._context.currentChordIndex + 1) % this._context.chordProgression.length,
      })

      // Auto-variation every N bars
      if (bar % MusicOrchestrator.AUTO_VARIATION_BARS === 0) {
        this.applyAutoVariation(bar)
      }
    }
    engine.clock.addListener(this._chordAdvanceListener)

    this._initialized = true
  }

  /**
   * Starts the AudioEngine (and therefore the Transport).
   * Requires `initialize()` to have completed.
   */
  start(): void {
    this.assertInitialized()
    const engine = AudioEngine.getInstance()
    if (!engine.isRunning) {
      engine.start(this._context!.bpm)
    }
  }

  /** Pauses playback without losing position. */
  pause(): void {
    AudioEngine.getInstance().pause()
  }

  /** Stops playback and resets transport to bar 0. */
  stop(): void {
    AudioEngine.getInstance().stop()
  }

  /**
   * Tears down all instruments and resets the singleton.
   * AudioEngine is NOT disposed here — that is the caller's responsibility.
   */
  dispose(): void {
    if (this._chordAdvanceListener) {
      const engine = AudioEngine.getInstance()
      if (engine.state !== 'uninitialized' && engine.state !== 'disposed') {
        engine.clock.removeListener(this._chordAdvanceListener)
      }
      this._chordAdvanceListener = null
    }
    this._percussion?.dispose()
    this._percussion = null
    this._bass = null
    this._pad = null
    this._lead1 = null
    this._lead2 = null
    this._transitions = null
    this._context = null
    this._initialized = false
    MusicOrchestrator.instance = null
  }

  // ---------------------------------------------------------------------------
  // Musical control surface
  // ---------------------------------------------------------------------------

  /**
   * Sets overall intensity (0–1).
   *
   * Below 0.2  → only percussion active
   * 0.2–0.4    → + bass
   * 0.4–0.6    → + pad
   * 0.6–0.8    → + lead1
   * 0.8–1.0    → all layers (+ lead2)
   *
   * Also updates the MusicContext.intensity and triggers a quantized transition.
   */
  setIntensity(value: number): void {
    this.assertInitialized()
    const intensity = clamp01(value)

    // Layer activation based on intensity thresholds
    const maxRole = intensityToMaxRole(intensity)
    this.layers.setActiveUpTo(maxRole)

    // Propagate intensity to context
    this.requestContextUpdate({ intensity })
  }

  /**
   * Sets texture density ('sparse' | 'medium' | 'dense').
   * Triggers a quantized pattern regeneration.
   */
  setTexture(texture: TextureDensity): void {
    this.assertInitialized()
    this.requestContextUpdate({ texture })
  }

  /**
   * Sets harmonic tension (0–1).
   * 0 = strictly diatonic, 1 = chromatic passing tones allowed.
   * Triggers a quantized pattern regeneration.
   */
  setTension(value: number): void {
    this.assertInitialized()
    this.requestContextUpdate({ tension: clamp01(value) })
  }

  /**
   * Replaces the entire MusicContext (key change, mode change, BPM change…).
   * Triggers a quantized transition.
   */
  setLevelContext(context: MusicContext): void {
    this.assertInitialized()
    this._transitions!.requestTransition(context, this.layers.getAll())
  }

  // ---------------------------------------------------------------------------
  // Layer control
  // ---------------------------------------------------------------------------

  /** Enables (un-mutes) an individual instrument layer. */
  enableLayer(role: InstrumentRole): void {
    this.layers.enable(role)
  }

  /** Disables (mutes) an individual instrument layer. */
  disableLayer(role: InstrumentRole): void {
    this.layers.disable(role)
  }

  /** Returns true if the layer is currently active. */
  isLayerEnabled(role: InstrumentRole): boolean {
    return this.layers.isEnabled(role)
  }

  // ---------------------------------------------------------------------------
  // Variation
  // ---------------------------------------------------------------------------

  /**
   * Applies one or more VariationEngine mutations to a specific instrument's
   * current pattern, then re-schedules it and propagates the cascade downward.
   *
   * @param role     Which instrument to mutate.
   * @param requests Variation mutations to apply in sequence.
   */
  triggerVariation(role: InstrumentRole, requests: VariationRequest | VariationRequest[]): void {
    this.assertInitialized()

    const instrument = this.layers.getAll().find((i) => i.role === role)
    if (!instrument || !this._context) return

    const pattern = instrument.currentPattern
    if (!pattern) return

    const reqArray = Array.isArray(requests) ? requests : [requests]
    const mutated: Pattern = this.variation.apply(pattern, this._context, reqArray)
    instrument.setPattern(mutated)
  }

  // ---------------------------------------------------------------------------
  // State inspection
  // ---------------------------------------------------------------------------

  /** Returns a snapshot of the current state. */
  getSnapshot(): OrchestratorSnapshot {
    this.assertInitialized()
    return {
      context:        this._context!,
      layers:         this.layers.getSnapshot(),
      isTransitioning: this._transitions!.isPending,
    }
  }

  get currentContext(): MusicContext | null {
    return this._context
  }

  get isInitialized(): boolean {
    return this._initialized
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Derives a new context from the current one with the supplied overrides,
   * then schedules a quantized transition.
   */
  private requestContextUpdate(overrides: Parameters<MusicContext['derive']>[0]): void {
    const newCtx = this._context!.derive(overrides)
    this._transitions!.requestTransition(newCtx, this.layers.getAll())
  }

  /**
   * Applies one weighted-random variation to every active instrument layer.
   *
   * Each instrument gets its own independently chosen variation type so the
   * layers evolve differently rather than all shifting in unison.
   *
   * The `bar` number is mixed into the selection to break the deterministic
   * seed that would otherwise repeat when the pattern hasn't changed.
   */
  private applyAutoVariation(bar: number): void {
    if (!this._context) return
    const instruments = this.layers.getAll()

    instruments.forEach((instrument, idx) => {
      if (!instrument.isActive) return
      const pattern = instrument.currentPattern
      if (!pattern) return

      const type = pickWeightedVariationType(
        MusicOrchestrator.AUTO_VARIATION_POOL,
        bar * 31 + idx * 7,   // cheap deterministic per-instrument salt
      )
      const mutated = this.variation.applyOne(pattern, this._context!, { type, amount: 0.3 })
      instrument.setPattern(mutated)
    })
  }

  private assertInitialized(): void {
    if (!this._initialized) {
      throw new Error(
        'MusicOrchestrator not initialised. Call initialize(context) first.',
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Private utility
// ---------------------------------------------------------------------------

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

function intensityToMaxRole(intensity: number): InstrumentRole {
  if (intensity < 0.2) return 'percussion'
  if (intensity < 0.4) return 'bass'
  if (intensity < 0.6) return 'pad'
  if (intensity < 0.8) return 'lead1'
  return 'lead2'
}

/**
 * Picks a VariationType from a weighted pool using a cheap integer seed.
 * Same seed → same pick, but the bar/index salt makes each call differ.
 */
function pickWeightedVariationType(
  pool: Array<{ type: VariationType; weight: number }>,
  seed: number,
): VariationType {
  const totalWeight = pool.reduce((s, e) => s + e.weight, 0)
  // lcg-like scramble for the seed
  const r = ((seed * 1664525 + 1013904223) >>> 0) / 0x100000000
  const threshold = r * totalWeight
  let acc = 0
  for (const entry of pool) {
    acc += entry.weight
    if (threshold < acc) return entry.type
  }
  return pool[pool.length - 1].type
}
