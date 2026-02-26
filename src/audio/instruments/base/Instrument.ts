import { MusicContext } from '../../theory/MusicContext'
import { Pattern } from '../../patterns/Pattern'

export type InstrumentRole = 'percussion' | 'bass' | 'pad' | 'lead1' | 'lead2'

/**
 * Abstract base class for all instruments in the generative engine.
 *
 * Hierarchy contract (cascade model):
 *  - Percussion is the root (no parent).
 *  - Bass listens to Percussion's pattern.
 *  - Pad listens to Bass's pattern.
 *  - Lead1 and Lead2 listen to Pad's pattern.
 *
 * Each concrete subclass is responsible for:
 *  1. `buildSynth()`  – creating the Tone.js synth node(s).
 *  2. `generatePattern()` – producing an initial pattern from a MusicContext.
 *  3. `schedulePattern()` – turning the current pattern into Tone.js events.
 *  4. `updateFromParent()` – re-generating/adapting when the parent changes.
 *
 * The base class manages:
 *  - Active/muted state and volume.
 *  - The child registry and cascade notification.
 *  - Lifecycle (play / stop / dispose).
 *  - Storing the current pattern and context so children can read them.
 *
 * Open/Closed: new instruments extend this class — the core loop never changes.
 * Dependency Inversion: callers depend on `Instrument`, not on concrete types.
 */
export abstract class Instrument {
  readonly role: InstrumentRole

  protected _context: MusicContext
  protected _pattern: Pattern | null = null
  protected _active: boolean = true

  private readonly _children: Instrument[] = []
  private _parent: Instrument | null = null

  constructor(role: InstrumentRole, context: MusicContext) {
    this.role = role
    this._context = context
  }

  // ---------------------------------------------------------------------------
  // Abstract interface – subclasses must implement
  // ---------------------------------------------------------------------------

  /**
   * Instantiates the Tone.js synth(s) and connects them to the destination.
   * Called once during the instrument's first `initialize()`.
   */
  protected abstract buildSynth(): void

  /**
   * Produces a fresh Pattern based on the current MusicContext and, if
   * applicable, the parent instrument's current pattern.
   */
  abstract generatePattern(): Pattern

  /**
   * Translates `_pattern` into Tone.js scheduling calls (Loops / Parts).
   * Called after every pattern generation or mutation.
   * Must cancel any previously scheduled events before re-scheduling.
   */
  protected abstract schedulePattern(): void

  /**
   * Called by the parent instrument after it regenerates its own pattern.
   * The child decides how much of the parent's pattern to use for its own
   * re-generation (e.g. Bass aligns note onsets to Percussion's kicks).
   */
  abstract updateFromParent(parentPattern: Pattern): void

  /**
   * Tears down Tone.js synth nodes. Called by `dispose()`.
   */
  protected abstract destroySynth(): void

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Prepares the instrument: builds the synth and generates the initial pattern.
   * Must be called after `AudioEngine.initialize()` has resolved.
   */
  initialize(): void {
    this.buildSynth()
    this._pattern = this.generatePattern()
    this.schedulePattern()
  }

  /**
   * Schedules the current pattern (or re-schedules after a mutation).
   * Subclasses call `schedulePattern()` internally; this is the public hook
   * for the orchestrator to trigger a re-schedule from outside.
   */
  refresh(): void {
    if (!this._pattern) return
    this.schedulePattern()
  }

  /**
   * Replaces the current pattern and re-schedules.
   * Also notifies children so the cascade propagates downward.
   */
  setPattern(pattern: Pattern): void {
    this._pattern = pattern
    this.schedulePattern()
    this.notifyChildren()
  }

  /** Updates the music context and re-generates the pattern from scratch. */
  setContext(context: MusicContext): void {
    this._context = context
    this._pattern = this.generatePattern()
    this.schedulePattern()
    this.notifyChildren()
  }

  /** Mutes/un-mutes the instrument without stopping the clock. */
  setActive(active: boolean): void {
    this._active = active
  }

  /** Releases all Tone.js resources. Removes from parent's child list. */
  dispose(): void {
    this._children.forEach((child) => child.dispose())
    this._children.length = 0
    this.destroySynth()
  }

  // ---------------------------------------------------------------------------
  // Hierarchy management
  // ---------------------------------------------------------------------------

  /**
   * Registers `child` as a listener of this instrument's pattern changes.
   * Sets `child._parent` to this instance.
   */
  addChild(child: Instrument): void {
    if (!this._children.includes(child)) {
      this._children.push(child)
      child._parent = this
    }
  }

  removeChild(child: Instrument): void {
    const idx = this._children.indexOf(child)
    if (idx !== -1) {
      this._children.splice(idx, 1)
      child._parent = null
    }
  }

  // ---------------------------------------------------------------------------
  // Read-only accessors (for children and the orchestrator)
  // ---------------------------------------------------------------------------

  get currentPattern(): Pattern | null {
    return this._pattern
  }

  get context(): MusicContext {
    return this._context
  }

  get isActive(): boolean {
    return this._active
  }

  get parent(): Instrument | null {
    return this._parent
  }

  get children(): readonly Instrument[] {
    return this._children
  }

  // ---------------------------------------------------------------------------
  // Protected helpers
  // ---------------------------------------------------------------------------

  /**
   * Fires `updateFromParent` on every registered child.
   * Called after `setPattern()` and `setContext()`.
   */
  protected notifyChildren(): void {
    if (!this._pattern) return
    const snapshot = this._pattern
    this._children.forEach((child) => child.updateFromParent(snapshot))
  }
}
