/**
 * Instrument configuration interfaces.
 *
 * All synth options are expressed in plain-data terms (no Tone.js types)
 * so that config objects can be defined, serialised, and compared
 * without importing Tone at the config layer.
 *
 * Each interface maps 1:1 to a Tone.js constructor options shape, but
 * uses only the subset we actually need to keep things KISS.
 */

// ---------------------------------------------------------------------------
// Shared envelope shape
// ---------------------------------------------------------------------------

export interface EnvelopeConfig {
  attack: number   // seconds
  decay: number    // seconds
  sustain: number  // 0–1 amplitude
  release: number  // seconds
}

// ---------------------------------------------------------------------------
// Per-instrument synth configs
// ---------------------------------------------------------------------------

/**
 * Configuration for a single percussive voice.
 * We model three voices: kick, snare, and hihat.
 *
 * - Kick  → Tone.MembraneSynth  (pitched frequency sweep)
 * - Snare → Tone.NoiseSynth     (noise burst)
 * - Hihat → Tone.MetalSynth     (high-frequency inharmonic)
 */
export interface KickConfig {
  /** Base pitch of the kick (e.g. 'C1'). MembraneSynth sweeps down from this. */
  note: string
  /** How many octaves the pitch drops during attack. */
  octaves: number
  /** Duration of the pitch sweep in seconds. */
  pitchDecay: number
  envelope: EnvelopeConfig
  velocity: number
}

export interface SnareConfig {
  envelope: EnvelopeConfig
  velocity: number
}

export interface HihatConfig {
  /** MetalSynth 'resonance' frequency (Hz). Higher = more open/bright. */
  resonance: number
  envelope: EnvelopeConfig
  velocity: number
}

export interface PercussionConfig {
  kick: KickConfig
  snare: SnareConfig
  hihat: HihatConfig
}

/**
 * Bass instrument uses a monophonic Tone.Synth with a sawtooth oscillator.
 * Plays single notes at low register to support the harmonic foundation.
 */
export interface BassConfig {
  /** Tone.js oscillator type string. */
  oscillatorType: 'sawtooth' | 'square' | 'triangle' | 'sine'
  envelope: EnvelopeConfig
  /** Master volume in dB (negative values = quieter). */
  volumeDb: number
}

/**
 * Pad instrument uses Tone.PolySynth to sustain chords.
 * Triangle wave keeps it soft and unobtrusive in the mix.
 */
export interface PadConfig {
  oscillatorType: 'triangle' | 'sine'
  envelope: EnvelopeConfig
  /** Max simultaneous voices. */
  maxPolyphony: number
  volumeDb: number
}

/**
 * Lead instrument uses a monophonic Tone.Synth.
 * Square wave gives the classic 8-bit melodic character.
 */
export interface LeadConfig {
  oscillatorType: 'square' | 'sawtooth' | 'triangle'
  envelope: EnvelopeConfig
  volumeDb: number
}

// ---------------------------------------------------------------------------
// Default configurations (8-bit style, CPU-light)
// ---------------------------------------------------------------------------

export const DEFAULT_KICK_CONFIG: KickConfig = {
  note: 'C1',
  octaves: 6,
  pitchDecay: 0.05,
  envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
  velocity: 1.0,
}

export const DEFAULT_SNARE_CONFIG: SnareConfig = {
  envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
  velocity: 0.7,
}

export const DEFAULT_HIHAT_CONFIG: HihatConfig = {
  resonance: 4000,
  envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
  velocity: 0.45,
}

export const DEFAULT_PERCUSSION_CONFIG: PercussionConfig = {
  kick: DEFAULT_KICK_CONFIG,
  snare: DEFAULT_SNARE_CONFIG,
  hihat: DEFAULT_HIHAT_CONFIG,
}

export const DEFAULT_BASS_CONFIG: BassConfig = {
  oscillatorType: 'sawtooth',
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.15 },
  volumeDb: -8,
}

export const DEFAULT_PAD_CONFIG: PadConfig = {
  oscillatorType: 'triangle',
  envelope: { attack: 0.4, decay: 0.2, sustain: 0.7, release: 0.8 },
  maxPolyphony: 4,
  volumeDb: -12,
}

export const DEFAULT_LEAD_CONFIG: LeadConfig = {
  oscillatorType: 'square',
  envelope: { attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.08 },
  volumeDb: -6,
}
