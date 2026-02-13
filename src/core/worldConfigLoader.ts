/**
 * World Configuration Loader
 * 
 * Loads world configuration from YAML files based on world number.
 * Each world defines its style (name, colors) and mode_change_schema.
 */

import yaml from 'js-yaml';

export interface WorldConfig {
  style: {
    name: string;
    colors: {
      void: string;
      floor: string;
      walls: string;
    };
  };
  mode_change_schema: Array<{
    CHASE: {
      PROBABILITY: number;
      SECONDS: number;
    };
    SCATTER: {
      PROBABILITY: number;
      SECONDS: number;
    };
  }>;
}

// Cache for loaded world configs to avoid repeated fetches
const worldConfigCache: Record<number, WorldConfig> = {};

/**
 * Load world configuration for a given world number (1-9)
 * Falls back to world 1 if world number is out of range
 */
export async function loadWorldConfig(worldNumber: number): Promise<WorldConfig> {
  // Clamp world number between 1-9
  const clampedWorld = Math.max(1, Math.min(9, Math.floor(worldNumber)));
  
  // Check cache first
  if (worldConfigCache[clampedWorld]) {
    return worldConfigCache[clampedWorld];
  }

  try {
    const worldId = String(clampedWorld).padStart(2, '0');
    const response = await fetch(`/config/worlds/world_${worldId}.yaml`);
    
    if (!response.ok) {
      throw new Error(`Failed to load world config: ${response.statusText}`);
    }

    const yamlText = await response.text();
    const config = yaml.load(yamlText) as WorldConfig;
    
    // Cache the result
    worldConfigCache[clampedWorld] = config;
    
    return config;
  } catch (error) {
    console.error(`[loadWorldConfig] Error loading world ${clampedWorld}:`, error);
    
    // Fallback to world 1 if not already trying world 1
    if (clampedWorld !== 1 && worldConfigCache[1]) {
      console.warn(`[loadWorldConfig] Falling back to world 1 config`);
      return worldConfigCache[1];
    }
    
    // Ultimate fallback: hardcoded world 1 config
    const fallbackConfig: WorldConfig = {
      style: {
        name: "Surface Echo",
        colors: {
          void: "#0f172a",
          floor: "#475569",
          walls: "#1e293b"
        }
      },
      mode_change_schema: [{
        CHASE: { PROBABILITY: 0.5, SECONDS: 20 },
        SCATTER: { PROBABILITY: 1, SECONDS: 7 }
      }]
    };
    
    worldConfigCache[1] = fallbackConfig;
    return fallbackConfig;
  }
}

/**
 * Preload all world configs during app initialization
 */
export async function preloadAllWorldConfigs(): Promise<void> {
  const promises = [];
  for (let i = 1; i <= 9; i++) {
    promises.push(loadWorldConfig(i));
  }
  await Promise.all(promises);
  console.log('[WorldConfig] All world configurations preloaded');
}

/**
 * Get cached world config synchronously (must be preloaded first)
 */
export function getWorldConfigSync(worldNumber: number): WorldConfig | null {
  const clampedWorld = Math.max(1, Math.min(9, Math.floor(worldNumber)));
  return worldConfigCache[clampedWorld] || null;
}
