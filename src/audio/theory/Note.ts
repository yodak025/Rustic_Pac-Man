// Chromatic pitch classes (C=0, C#=1, ..., B=11)
export const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
export type PitchClass = (typeof PITCH_CLASSES)[number]

// Enharmonic aliases → canonical pitch class
const ENHARMONIC: Record<string, PitchClass> = {
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
}

export type NoteName = string // e.g. 'C4', 'D#3', 'Bb2'

interface ParsedNote {
  pitchClass: PitchClass
  octave: number
}

/**
 * Parses a note name (e.g. 'D#4', 'Bb3') into pitch class + octave.
 * Normalises enharmonic spellings to sharps.
 */
export function parseNote(note: NoteName): ParsedNote {
  const match = note.match(/^([A-G][b#]?)(\d)$/)
  if (!match) throw new Error(`Invalid note: "${note}"`)

  const rawPitch = match[1]
  const octave = parseInt(match[2], 10)

  const pitchClass: PitchClass = ENHARMONIC[rawPitch] ?? (rawPitch as PitchClass)
  if (!PITCH_CLASSES.includes(pitchClass as PitchClass)) {
    throw new Error(`Unknown pitch class: "${rawPitch}"`)
  }

  return { pitchClass, octave }
}

/** Converts a pitch class + octave back to a note name. */
export function noteToName(pitchClass: PitchClass, octave: number): NoteName {
  return `${pitchClass}${octave}`
}

/**
 * Returns the absolute MIDI note number (C4 = 60).
 * Useful for arithmetic and range comparisons.
 */
export function noteToMidi(note: NoteName): number {
  const { pitchClass, octave } = parseNote(note)
  const semitone = PITCH_CLASSES.indexOf(pitchClass)
  return (octave + 1) * 12 + semitone
}

/** Inverse of noteToMidi. */
export function midiToNote(midi: number): NoteName {
  const semitone = midi % 12
  const octave = Math.floor(midi / 12) - 1
  return noteToName(PITCH_CLASSES[semitone], octave)
}

/**
 * Transposes a note by a given number of semitones.
 * The octave wraps automatically.
 */
export function transposeNote(note: NoteName, semitones: number): NoteName {
  return midiToNote(noteToMidi(note) + semitones)
}

/** Clamps a note to the range [low, high] by shifting octaves. */
export function clampNote(note: NoteName, low: NoteName, high: NoteName): NoteName {
  let midi = noteToMidi(note)
  const lo = noteToMidi(low)
  const hi = noteToMidi(high)

  while (midi < lo) midi += 12
  while (midi > hi) midi -= 12

  return midiToNote(Math.max(lo, Math.min(hi, midi)))
}
