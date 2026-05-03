/**
 * Hook to access collectables colors configuration
 */

import { useState, useEffect } from 'react';
import yaml from 'js-yaml';

interface CollectablesColors {
  essenceDots: string;
  whiteNoiseBalls: string;
}

interface CollectablesConfig {
  styles: {
    pac_dots: string;
    power_pellets: string;
  };
}

const defaultColors: CollectablesColors = {
  essenceDots: '#fef3c7',
  whiteNoiseBalls: '#ffffff'
};

// Cache for loaded config
let cachedConfig: CollectablesColors | null = null;

/**
 * Returns the color scheme for collectables
 * Loads config on first mount and caches it
 */
export function useCollectablesColors(): CollectablesColors {
  const [colors, setColors] = useState<CollectablesColors>(() => {
    // Return cached config if available
    if (cachedConfig) {
      return cachedConfig;
    }
    return defaultColors;
  });

  useEffect(() => {
    // Load config if not already cached
    const loadConfig = async () => {
      try {
        const response = await fetch('/config/collectables.yaml');
        
        if (!response.ok) {
          throw new Error(`Failed to load collectables config: ${response.statusText}`);
        }

        const yamlText = await response.text();
        const config = yaml.load(yamlText) as CollectablesConfig;
        
        const loadedColors = {
          essenceDots: config.styles.pac_dots,
          whiteNoiseBalls: config.styles.power_pellets
        };
        
        // Cache and set colors
        cachedConfig = loadedColors;
        setColors(loadedColors);
      } catch (error) {
        console.error('[useCollectablesColors] Error loading config:', error);
        // Keep default colors on error
      }
    };

    if (!cachedConfig) {
      loadConfig();
    }
  }, []);

  return colors;
}
