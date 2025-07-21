import useGameFrame from "@core/hooks/useGameFrame";
import {
  usePacmanState,
  useTilemapState,
  useGameStatusStore,
  useECSStore
} from "@state/store";
import gameStatusValue from "@/types/gameStatusValue";
import pacmanStatusValue from "@/types/pacmanStatusValue";
import { useEffect, useState } from "react";
import type { Position } from "@state/components";

export default function PacmanMesh() {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);

  //-- acceso al estado de juego
  const {
    status: gameStatus,
    setStatus,
  } = useGameStatusStore((state) => state);

  //-- acceso al store ECS para obtener la posición de Pacman
  const { getEntity } = useECSStore((state) => state);

  //-- Hook para seguir la posición de la entidad Pacman
  const useTrackPacmanPosition = () => {
    useEffect(() => {
      const interval = setInterval(() => {
        const pacmanEntity = getEntity('pacman');
        if (pacmanEntity && pacmanEntity.components.position) {
          const entityPosition = pacmanEntity.components.position as Position;
          setPosition([entityPosition.x, 0, entityPosition.y]);
        }
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }, [getEntity]);
  };

  useTrackPacmanPosition();
  
  //-- Hook para inicializar a Pacman
  const useInitPacman = () => {
    useEffect(() => {
      if (gameStatus !== gameStatusValue.SETTING_PACMAN) return;
    
      setStatus(gameStatusValue.PLAYING);
    }, [gameStatus]);
  };

  useInitPacman();

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />      
        <meshStandardMaterial color={status === pacmanStatusValue.INVINCIBLE ? "orange" : "yellow"} />
    </mesh>
  );
}
