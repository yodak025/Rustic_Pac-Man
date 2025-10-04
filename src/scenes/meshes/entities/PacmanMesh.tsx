import usePacmanStore from "@/state/usePacmanStore";
import type { Position } from "@custom-types/gameComponents";

import { useGraphicPositionInterpolation } from "@/scenes/hooks/useGraphicPositionInterpolation";

export default function PacmanMesh() {
  const pacmanPosition = usePacmanStore.getState().pacman.components.position as Position;
  const pacmanDirection = usePacmanStore.getState().pacman.components.directions;
  const pacmanTimer = usePacmanStore.getState().pacman.components.movementTimer;
  const lastPosition = usePacmanStore.getState().pacman.components.lastPosition as Position;

  const isInvincible = usePacmanStore((state) => state.pacman.components.health.iTicks > 0);
  
  const iPos = useGraphicPositionInterpolation(
    pacmanPosition,
    pacmanTimer,
    pacmanDirection,
    lastPosition
  );

  return (
    <mesh position={[iPos.x, 0.5, iPos.y]}>
      <sphereGeometry args={[0.5, 32, 32]} />      
        <meshStandardMaterial color={isInvincible ? "white" : "yellow"} /> 
    </mesh>
  );
}
