/**
 * RhythmGenerator
 *
 * Pure-function utilities for producing boolean rhythm grids.
 * No Tone.js imports — this is plain arithmetic.
 *
 * Single Responsibility: generate rhythmic boolean arrays that other
 * pattern generators consume. Contains:
 *   - Euclidean rhythm algorithm (Bjorklund)
 *   - Standard groove templates (four-on-floor, backbeat, etc.)
 *   - Density helpers
 */

// ---------------------------------------------------------------------------
// Euclidean rhythm (Bjorklund algorithm)
// ---------------------------------------------------------------------------

/**
 * Generates a Euclidean (Bresenham-distributed) rhythm.
 *
 * Distributes `pulses` active steps as evenly as possible across `steps`.
 * `rotation` shifts the pattern by that many steps.
 *
 * @example euclidean(4, 16)  → 4-on-the-floor kick
 * @example euclidean(7, 16)  → common Brazilian/Afro-Cuban pattern
 */
export function euclidean(pulses: number, steps: number, rotation: number = 0): boolean[] {
  if (pulses <= 0) return Array(steps).fill(false)
  if (pulses >= steps) return Array(steps).fill(true)

  // Bjorklund via remainder sequences
  const pattern = bjorklund(pulses, steps)

  // Apply rotation
  if (rotation === 0) return pattern
  const r = ((rotation % steps) + steps) % steps
  return [...pattern.slice(r), ...pattern.slice(0, r)]
}

function bjorklund(pulses: number, steps: number): boolean[] {
  let groups: boolean[][] = []
  for (let i = 0; i < steps; i++) {
    groups.push(i < pulses ? [true] : [false])
  }

  let remainder = steps - pulses
  let divisor = pulses

  while (remainder > 1) {
    const newGroups: boolean[][] = []
    const minLength = Math.min(divisor, remainder)
    for (let i = 0; i < minLength; i++) {
      newGroups.push([...groups[i], ...groups[divisor + i]])
    }
    if (divisor > remainder) {
      for (let i = remainder; i < divisor; i++) {
        newGroups.push([...groups[i]])
      }
    } else if (remainder > divisor) {
      for (let i = divisor; i < remainder; i++) {
        newGroups.push([...groups[divisor + i]])
      }
    }
    groups = newGroups
    remainder = Math.abs(divisor - remainder)
    divisor = minLength
  }

  return groups.flat()
}

// ---------------------------------------------------------------------------
// Standard drum templates (16 steps)
// ---------------------------------------------------------------------------

/**
 * Returns a 16-step kick grid.
 * intensity 0–1 controls how many extra kicks are added.
 */
export function kickGrid(intensity: number): boolean[] {
  const g = Array(16).fill(false) as boolean[]
  g[0] = true   // beat 1
  g[8] = true   // beat 3
  if (intensity > 0.6)  g[4]  = true  // beat 2 (high-energy)
  if (intensity > 0.85) g[12] = true  // beat 4 (4-on-floor)
  return g
}

/**
 * Returns a 16-step snare grid.
 * intensity > 0.75 adds a ghost snare on the "and" of beat 3.
 */
export function snareGrid(intensity: number): boolean[] {
  const g = Array(16).fill(false) as boolean[]
  g[4]  = true  // beat 2
  g[12] = true  // beat 4
  if (intensity > 0.75) g[10] = true  // ghost on e-and of beat 3
  return g
}

/**
 * Returns a 16-step hihat grid based on texture density.
 * sparse  → 8th notes
 * medium  → 8th + selective 16ths
 * dense   → all 16th notes
 */
export function hihatGrid(texture: 'sparse' | 'medium' | 'dense'): boolean[] {
  switch (texture) {
    case 'sparse':
      return Array.from({ length: 16 }, (_, i) => i % 2 === 0)
    case 'dense':
      return Array(16).fill(true)
    case 'medium':
    default:
      return Array.from({ length: 16 }, (_, i) => {
        if (i % 2 === 0) return true
        if (i === 5 || i === 13) return true
        return false
      })
  }
}

// ---------------------------------------------------------------------------
// Density helpers
// ---------------------------------------------------------------------------

/**
 * Returns the number of active steps for a given texture and length.
 * Used by melodic generators to decide how many notes to place.
 */
export function noteCountForTexture(
  texture: 'sparse' | 'medium' | 'dense',
  steps: number,
): number {
  const ratio = texture === 'sparse' ? 0.25 : texture === 'medium' ? 0.5 : 0.75
  return Math.max(1, Math.round(steps * ratio))
}

/**
 * Distributes `count` active steps across `steps` positions, evenly spread
 * and slightly randomised using a seeded-like offset from `seed` (0–1).
 *
 * Not truly random — uses the seed to deterministically offset the positions
 * so repeated calls with the same arguments produce the same result.
 */
export function distributeSteps(count: number, steps: number, seed: number = 0.5): boolean[] {
  const grid = Array(steps).fill(false) as boolean[]
  if (count <= 0) return grid
  if (count >= steps) return Array(steps).fill(true)

  // Use Euclidean distribution then apply a small rotation based on seed
  const rotation = Math.round(seed * steps) % steps
  const pattern = euclidean(count, steps, rotation)
  for (let i = 0; i < steps; i++) {
    grid[i] = pattern[i]
  }
  return grid
}

/**
 * Returns the step indices where `grid` is true.
 */
export function activeSteps(grid: boolean[]): number[] {
  return grid.reduce<number[]>((acc, on, i) => (on ? [...acc, i] : acc), [])
}
