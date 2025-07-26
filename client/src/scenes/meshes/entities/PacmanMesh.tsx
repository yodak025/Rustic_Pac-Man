import useGameFrame from "@core/hooks/useGameFrame";
import usePacmanStore from "@/state/usePacmanStore";

import gameStatusValue from "@/types/gameStatusValue";
import pacmanStatusValue from "@/types/pacmanStatusValue";
import { useEffect, useState } from "react";
import type { Position } from "@custom-types/gameComponents";

export default function PacmanMesh() {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);

  const pacmanPosition = usePacmanStore.getState().pacman.components.position as Position;

  //-- Hook para seguir la posición de la entidad Pacman
  const useTrackPacmanPosition = () => {
    useEffect(() => {
      const interval = setInterval(() => {
        
        setPosition([pacmanPosition.x, 0 , pacmanPosition.y]);
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }, [pacmanPosition]);
  };

  useTrackPacmanPosition();
  
  //-- Hook para inicializar a Pacman
/*   const useInitPacman = () => {
    useEffect(() => {
      if (gameStatus !== gameStatusValue.SETTING_PACMAN) return;
    
      setStatus(gameStatusValue.PLAYING);
    }, [gameStatus]);
  };

  useInitPacman(); */

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />      
        <meshStandardMaterial color={status === pacmanStatusValue.INVINCIBLE ? "orange" : "yellow"} />
    </mesh>
  );
}
