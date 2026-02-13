import { usePacmanHotState } from "@state/useHotState";
import { Direction } from "@/types/gameComponents";

interface PacmanRenderData {
  position: { x: number; y: number };
  isInvulnerable: boolean;
  rotationY: number;
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
 * Hook to prepare all render state for Pacman entity
 */
export function usePacmanRenderState(): PacmanRenderData {
  const pacman = usePacmanHotState();
  const rotationY = calculateRotation(pacman.direction);

  return {
    position: pacman.position,
    isInvulnerable: pacman.isInvulnerable,
    rotationY,
  };
}
