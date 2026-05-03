/**
 * Medallion Attributes Configuration
 *
 * Loads and parses medallionAttributes.yaml, exposing typed scaling values
 * for each player attribute by medallion level (0 = base, 1–5 = active levels),
 * plus per-medallion XP thresholds and activation costs.
 */

import yaml from 'js-yaml';
import rawYaml from './medallionAttributes.yaml';
import { MedallionKind } from '@custom-types/gameComponents';

// ============================================================================
// RAW YAML SHAPE
// ============================================================================

interface MedallionLevelConfigRaw {
  xpToNextLevel: number[];
  activationCost: number;
}

interface MedallionAttributesRaw {
  health:   MedallionLevelConfigRaw;
  stealth:  MedallionLevelConfigRaw & { agroRadiusPerLevel: number[]; agroRadiusActive: number; stealthActiveDurationTicks: number };
  vision:   MedallionLevelConfigRaw & { visionRadiusPerLevel: number[] };
  shout:    MedallionLevelConfigRaw & { frightDurationPerLevel: number[] };
  speed:    MedallionLevelConfigRaw & { speedMultiplierPerLevel: number[]; speedMultiplierActive: number; speedActiveDurationTicks: number };
  essence:  MedallionLevelConfigRaw & { essenceMultiplierPerLevel: number[]; dashMaxEnergyPerLevel: number[] };
}

// ============================================================================
// PUBLIC TYPED INTERFACES
// ============================================================================

export interface MedallionAttributeScaling {
  /** Tile radius at which echoes detect Chomp, indexed by STEALTH level (0–5) */
  agroRadiusPerLevel: readonly number[];
  /** Agro radius override while STEALTH active ability is in effect */
  agroRadiusActive: number;
  /** Tile radius of the player vision spotlight, indexed by VISION level (0–5) */
  visionRadiusPerLevel: readonly number[];
  /** FRIGHTENED duration in ticks when WNB is used, indexed by SHOUT level (0–5) */
  frightDurationPerLevel: readonly number[];
  /** Chomp speed multiplier, indexed by SPEED level (0–5) */
  speedMultiplierPerLevel: readonly number[];
  /** Speed multiplier override while SPEED active ability is in effect */
  speedMultiplierActive: number;
  /** Energy earned per essence dot, indexed by ESSENCE level (0–5) */
  essenceMultiplierPerLevel: readonly number[];
  /** Max dash bar energy, indexed by ESSENCE level (0–5) */
  dashMaxEnergyPerLevel: readonly number[];
  /** Duration in ticks for STEALTH active ability */
  stealthActiveDurationTicks: number;
  /** Duration in ticks for SPEED active ability */
  speedActiveDurationTicks: number;
}

/** Per-medallion leveling and activation config */
export interface MedallionLevelConfig {
  /** XP thresholds to advance from level i to i+1 (length 5, or 0 for HEALTH) */
  xpToNextLevel: readonly number[];
  /** XP required at max level to trigger the active ability */
  activationCost: number;
}

// ============================================================================
// PARSE & EXPORT
// ============================================================================

const raw = yaml.load(rawYaml) as MedallionAttributesRaw;

export const MEDALLION_ATTRIBUTES: MedallionAttributeScaling = {
  agroRadiusPerLevel:         raw.stealth.agroRadiusPerLevel,
  agroRadiusActive:           raw.stealth.agroRadiusActive,
  visionRadiusPerLevel:       raw.vision.visionRadiusPerLevel,
  frightDurationPerLevel:     raw.shout.frightDurationPerLevel,
  speedMultiplierPerLevel:    raw.speed.speedMultiplierPerLevel,
  speedMultiplierActive:      raw.speed.speedMultiplierActive,
  essenceMultiplierPerLevel:  raw.essence.essenceMultiplierPerLevel,
  dashMaxEnergyPerLevel:      raw.essence.dashMaxEnergyPerLevel,
  stealthActiveDurationTicks: raw.stealth.stealthActiveDurationTicks,
  speedActiveDurationTicks:   raw.speed.speedActiveDurationTicks,
};

/** Map from MedallionKind to its leveling + activation config */
const MEDALLION_LEVEL_CONFIGS: Record<MedallionKind, MedallionLevelConfig> = {
  [MedallionKind.HEALTH]:  { xpToNextLevel: raw.health.xpToNextLevel,  activationCost: raw.health.activationCost  },
  [MedallionKind.STEALTH]: { xpToNextLevel: raw.stealth.xpToNextLevel, activationCost: raw.stealth.activationCost },
  [MedallionKind.VISION]:  { xpToNextLevel: raw.vision.xpToNextLevel,  activationCost: raw.vision.activationCost  },
  [MedallionKind.SHOUT]:   { xpToNextLevel: raw.shout.xpToNextLevel,   activationCost: raw.shout.activationCost   },
  [MedallionKind.SPEED]:   { xpToNextLevel: raw.speed.xpToNextLevel,   activationCost: raw.speed.activationCost   },
  [MedallionKind.ESSENCE]: { xpToNextLevel: raw.essence.xpToNextLevel, activationCost: raw.essence.activationCost },
};

/**
 * Returns the XP required to go from `currentLevel` to `currentLevel + 1`.
 * Returns Infinity if already at max level (5).
 */
export function getMedallionXpThreshold(kind: MedallionKind, currentLevel: number): number {
  const cfg = MEDALLION_LEVEL_CONFIGS[kind];
  if (currentLevel >= 5) return Infinity;
  return cfg.xpToNextLevel[currentLevel] ?? Infinity;
}

/**
 * Returns the XP cost to fire the active ability for a given medallion kind.
 */
export function getMedallionActivationCost(kind: MedallionKind): number {
  return MEDALLION_LEVEL_CONFIGS[kind].activationCost;
}
