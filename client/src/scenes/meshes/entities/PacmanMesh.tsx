import usePacmanStore from "@/state/usePacmanStore";
import pacmanStatusValue from "@/types/pacmanStatusValue";
import type { Position } from "@custom-types/gameComponents";

import { useGraphicPositionInterpolation } from "@/scenes/hooks/useGraphicPositionInterpolation";

export default function PacmanMesh() {
  const pacmanPosition = usePacmanStore.getState().pacman.components.position as Position;
  const pacmanDirection = usePacmanStore.getState().pacman.components.directions;
  const pacmanTimer = usePacmanStore.getState().pacman.components.movementTimer;
  const lastPosition = usePacmanStore.getState().pacman.components.lastPosition as Position;
  const status = usePacmanStore.getState().pacman.components.status;
  
  const iPos = useGraphicPositionInterpolation(
    pacmanPosition,
    pacmanTimer,
    pacmanDirection,
    lastPosition
  );

  return (
    <mesh position={[iPos.x, 0.5, iPos.y]}>
      <sphereGeometry args={[0.5, 32, 32]} />      
        <meshStandardMaterial color={status === pacmanStatusValue.INVINCIBLE ? "orange" : "yellow"} /> 
    </mesh>
  );
}
