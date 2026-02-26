import { useState } from "react";
import { Direction, BehaviorMode, type Position } from "@/types/gameComponents";
import type { EchoRenderState } from "@state/useHotState";

const BASE_SCALE = 0.4;

interface EchoRenderData {
  position: Position;
  mode: BehaviorMode;
  direction: Direction | null;
  rotationY: number;
  scale: number;
  color: string;
}

/**
 * Calculate rotation based on direction
 */
export function calculateRotation(direction: Direction | null): number {
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
 * Get color based on Echo behavior mode
 */
export function getEchoColor(mode: BehaviorMode): string {
  switch (mode) {
    case BehaviorMode.IDLE:
    case BehaviorMode.SCATTER:
      return '#9b59b6'; // Purple
    case BehaviorMode.CHASE:
      return '#e74c3c'; // Red
    case BehaviorMode.FRIGHTENED:
      return '#3498db'; // Blue
    case BehaviorMode.EATEN:
      return '#7f8c8d'; // Gray
    default:
      return '#9b59b6'; // Purple (default)
  }
}

/**
 * Calculate scale factor based on movement timer percentage
 * 
 * Animation curve (only in CHASE mode):
 * - 0-50%: Linear grow (0 → 1)
 * - 50-100%: Linear shrink (1 → 0)
 */
export function calculateScaleFactor(elapsed: number, interval: number): number {
  const percentage = elapsed / interval;

  if (percentage <= 0.5) {
    return percentage / 0.5;
  } else {
    return (1 - percentage) / 0.5;
  }
}

/**
 * Hook to prepare all render state for an echo entity
 */
export function useEchoRenderState(echoState: EchoRenderState): EchoRenderData {
  const [scale] = useState(BASE_SCALE);
  const rotationY = calculateRotation(echoState.direction);
  const color = getEchoColor(echoState.mode);
  const scaleFactor = calculateScaleFactor(echoState.timer.elapsed, echoState.timer.interval);

  return {
    position: echoState.position,
    mode: echoState.mode,
    direction: echoState.direction,
    rotationY,
    scale: scale * scaleFactor,
    color,
  };
}
