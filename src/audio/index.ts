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
export { Instrument, Percussion, Bass, Pad, Lead } from './instruments'
export type {
  InstrumentRole,
  PercussionStep,
  EnvelopeConfig,
  PercussionConfig,
  BassConfig,
  PadConfig,
  LeadConfig,
} from './instruments'

// Generators
export {
  PatternGenerator,
  PercussionPatternGenerator,
  BassPatternGenerator,
  PadPatternGenerator,
  LeadPatternGenerator,
  VariationEngine,
  euclidean,
  kickGrid,
  snareGrid,
  hihatGrid,
  distributeSteps,
  activeSteps,
  noteCountForTexture,
} from './generators'
export type { GeneratedPatterns, VariationType, VariationRequest } from './generators'

// Orchestrator
export { LayerController, TransitionManager, MusicOrchestrator } from './orchestrator'
export type { TransitionCallback, OrchestratorSnapshot } from './orchestrator'

// Contexts
export { LEVEL_CONTEXTS, ContextPresets } from './contexts'
export type { LevelContextName } from './contexts'
