import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGhostHotState } from "@state/useHotState";
import { Direction, GhostBehaviorMode, type Position } from "@/types/gameComponents";

const BASE_SCALE = 0.5;

interface GhostRenderData {
  position: Position;
  mode: GhostBehaviorMode;
  direction: Direction | null;
  rotationY: number;
  scale: number;
}

type GhostId = 'blinky' | 'pinky' | 'inky' | 'clyde';

/**
 * Calculate scale factor based on movement timer percentage
 * 
 * Animation curve (only in CHASE mode):
 * - 0-50%: Linear grow (0 → 1)
 * - 50-100%: Linear shrink (1 → 0)
 */
function calculateScaleFactor(elapsed: number, interval: number, mode: GhostBehaviorMode): number {
  if (mode !== GhostBehaviorMode.CHASE) {
    return 1;
  }

  const percentage = elapsed / interval;
  
  if (percentage <= 0.5) {
    return percentage / 0.5;
  } else {
    return (1 - percentage) / 0.5;
  }
}

/**
 * Calculate rotation based on direction
 */
function calculateRotation(direction: Direction | null): number {
  if (!direction) return 0;
  
  switch (direction) {
    case Direction.DOWN:
      return 0;
    case Direction.UP:
      return Math.PI;
    case Direction.RIGHT:
      return Math.PI / 2;
    case Direction.LEFT:
      return -Math.PI / 2;
    default:
      return 0;
  }
}

/**
 * Hook to prepare all render state for a ghost entity
 */
export function useGhostRenderState(ghostId: GhostId): GhostRenderData {
  const ghost = useGhostHotState(ghostId);
  const [animatedScale, setAnimatedScale] = useState(BASE_SCALE);

  const rotationY = calculateRotation(ghost.direction);

  useFrame(() => {
    const scaleFactor = calculateScaleFactor(ghost.timer.elapsed, ghost.timer.interval, ghost.mode);
    setAnimatedScale(BASE_SCALE * scaleFactor);
  });

  return {
    position: ghost.position,
    mode: ghost.mode,
    direction: ghost.direction,
    rotationY,
    scale: animatedScale,
  };
}
