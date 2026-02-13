/**
 * Hook to access current world colors based on game level
 */

import { useMemo } from 'react';
import { useGameHotState } from '@state/useHotState';
import { getWorldConfigSync } from '@core/worldConfigLoader';

export interface WorldColors {
  void: string;
  floor: string;
  walls: string;
  worldName: string;
}

/**
 * Returns the color scheme for the current world/level
 * Falls back to world 1 colors if config not loaded
 */
export function useWorldColors(): WorldColors {
  const { level } = useGameHotState();
  
  const colors = useMemo(() => {
    const worldConfig = getWorldConfigSync(level);
    
    if (!worldConfig) {
      // Fallback to world 1 colors
      return {
        void: '#0f172a',
        floor: '#475569',
        walls: '#1e293b',
        worldName: 'Surface Echo'
      };
    }
    
    return {
      void: worldConfig.style.colors.void,
      floor: worldConfig.style.colors.floor,
      walls: worldConfig.style.colors.walls,
      worldName: worldConfig.style.name
    };
  }, [level]);
  
  return colors;
}
