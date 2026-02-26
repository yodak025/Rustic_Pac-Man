export {
  PITCH_CLASSES,
  parseNote,
  noteToName,
  noteToMidi,
  midiToNote,
  transposeNote,
  clampNote,
} from './Note'
export type { PitchClass, NoteName } from './Note'

export { Scale, Mode, MODE_INTERVALS } from './Scale'
export type { ScaleDegree } from './Scale'

export { Chord, ChordQuality, PROGRESSION_PRESETS } from './Chord'
export type { ChordProgressionPreset } from './Chord'

export { MusicContext } from './MusicContext'
export type { TextureDensity, LevelContextPreset } from './MusicContext'
