// Public API for the audio module
// Consumers import from '@audio' or '@/audio'

export { AudioEngine } from './AudioEngine'
export type { AudioEngineState } from './AudioEngine'

export { Transport } from './core/Transport'
export type { QuantizeResolution } from './core/Transport'

export { Clock } from './core/Clock'
export type { BeatCallback } from './core/Clock'

// Theory re-exports (consumers should not need to import from sub-paths)
export {
  Scale,
  Mode,
  MODE_INTERVALS,
  Chord,
  ChordQuality,
  PROGRESSION_PRESETS,
  MusicContext,
  PITCH_CLASSES,
  parseNote,
  noteToName,
  noteToMidi,
  midiToNote,
  transposeNote,
  clampNote,
} from './theory'
export type {
  PitchClass,
  NoteName,
  ScaleDegree,
  ChordProgressionPreset,
  TextureDensity,
  LevelContextPreset,
} from './theory'

// Patterns
export { Pattern } from './patterns'
export type { NoteEvent } from './patterns'

// Instruments
export { Instrument, Percussion, Bass } from './instruments'
export type {
  InstrumentRole,
  PercussionStep,
  EnvelopeConfig,
  PercussionConfig,
  BassConfig,
} from './instruments'
