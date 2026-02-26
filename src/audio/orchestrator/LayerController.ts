import type { Instrument, InstrumentRole } from '../instruments/base/Instrument'

/**
 * Controls which instrument layers are active (audible) at any moment.
 *
 * Single Responsibility: manage the mute/unmute state of every layer in the
 * hierarchy. It does not know about music theory or scheduling — it only
 * flips `setActive()` on instruments.
 *
 * The cascade model means:
 *   Percussion → Bass → Pad → Lead1 → Lead2
 *
 * Enabling a child while its parent is disabled is technically valid
 * (the child will play, the parent will be silent). The orchestrator is
 * responsible for deciding whether that makes musical sense.
 */
export class LayerController {
  private readonly layers = new Map<InstrumentRole, Instrument>()

  /**
   * Registers an instrument under its own role.
   * Replaces any previously registered instrument with the same role.
   */
  register(instrument: Instrument): void {
    this.layers.set(instrument.role, instrument)
  }

  /** Activates (un-mutes) a layer by role. No-op if not registered. */
  enable(role: InstrumentRole): void {
    this.layers.get(role)?.setActive(true)
  }

  /** Mutes a layer by role. No-op if not registered. */
  disable(role: InstrumentRole): void {
    this.layers.get(role)?.setActive(false)
  }

  /** Toggles the active state of a layer. No-op if not registered. */
  toggle(role: InstrumentRole): void {
    const instr = this.layers.get(role)
    if (!instr) return
    instr.setActive(!instr.isActive)
  }

  /** Returns true when the layer is registered and currently active. */
  isEnabled(role: InstrumentRole): boolean {
    return this.layers.get(role)?.isActive ?? false
  }

  /**
   * Enables layers up to and including `maxRole` in the cascade order,
   * disabling all layers above it.
   *
   * Intensity mapping (typical use):
   *   intensity 0.0–0.2  → percussion only
   *   intensity 0.2–0.4  → + bass
   *   intensity 0.4–0.6  → + pad
   *   intensity 0.6–0.8  → + lead1
   *   intensity 0.8–1.0  → + lead2 (full arrangement)
   */
  setActiveUpTo(maxRole: InstrumentRole): void {
    const order: InstrumentRole[] = ['percussion', 'bass', 'pad', 'lead1', 'lead2']
    const maxIdx = order.indexOf(maxRole)
    order.forEach((role, idx) => {
      const instr = this.layers.get(role)
      if (!instr) return
      instr.setActive(idx <= maxIdx)
    })
  }

  /**
   * Returns a snapshot of all registered roles and their active state.
   * Useful for UI components and debug output.
   */
  getSnapshot(): Record<InstrumentRole, boolean> {
    const roles: InstrumentRole[] = ['percussion', 'bass', 'pad', 'lead1', 'lead2']
    return Object.fromEntries(
      roles.map((role) => [role, this.layers.get(role)?.isActive ?? false])
    ) as Record<InstrumentRole, boolean>
  }

  /** Returns all registered instruments in cascade order. */
  getAll(): Instrument[] {
    const order: InstrumentRole[] = ['percussion', 'bass', 'pad', 'lead1', 'lead2']
    return order.flatMap((role) => {
      const instr = this.layers.get(role)
      return instr ? [instr] : []
    })
  }
}
