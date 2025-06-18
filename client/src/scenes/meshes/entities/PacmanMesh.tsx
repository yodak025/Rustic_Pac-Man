import useGameFrame from "@core/hooks/useGameFrame";
import {
  usePacmanState,
  useTilemapState,
  useGameStatusStore,
} from "@state/store";
import gameStatusValue from "@/types/gameStatusValue";
import pacmanStatusValue from "@/types/pacmanStatusValue";
import { useEffect, useRef } from "react";
import MovementSystem from "@/core/systems/movementSystem";
import { useKeyboardControls } from "@react-three/drei";


const INCREMENT_AMOUNT = 10; // Cantidad de puntos por pellet

export default function PacmanMesh() {
  const movement = useRef<MovementSystem>(new MovementSystem(7, 0.5));

  //-- acceso al estado de juego
  const {
    status: gameStatus,
    setStatus,
    score,
    incrementScore,
  } = useGameStatusStore((state) => state);
  const {
    position: { x, y: z },
    setPosition,
    status,
    lives,
    hunt
  } = usePacmanState((state) => state);
  const tilemap = useTilemapState((state) => state);
  const [_, getKeys] = useKeyboardControls();

  //-- Hook para inicializar a Pacman
  const useInitPacman = () => {
    useEffect(() => {
      if (gameStatus !== gameStatusValue.SETTING_PACMAN) return;
      const initialPosition = tilemap.getRandomTileCoords(0);
      setPosition(initialPosition);
      tilemap.updateTile(initialPosition, -1); // Actualiza el tile de Pacman
      setStatus(gameStatusValue.SETTING_GHOSTS);
    }, [gameStatus]);
  };

  useInitPacman();
  
  //! ESTE COMPONENTE VIOLA S DE SOLID, ARREGLALO
  useGameFrame((_, delta) => {
    if (score >= tilemap.pacDots * INCREMENT_AMOUNT) {
      setStatus(gameStatusValue.WON); // Cambia el estado del juego a WIN si se comen todos los pellets
    }
    if (lives <= 0) {
      setStatus(gameStatusValue.LOST); // Cambia el estado del juego a GAME_OVER si se pierden todas las vidas
    }
    movement.current.move(
      { x, y: z },
      setPosition,
      getKeys() as any, //! Lazy any, recuerda arreglarlo
      delta,
      tilemap,
      (position) => {
        const { x, y } = position;
        //-- Si es un pellet, actualiza el tile y aumenta el puntaje
        if (tilemap.getTile({ x: Math.round(x), y: Math.round(y) }) === 0) {
          tilemap.updateTile({ x: Math.round(x), y: Math.round(y) }, -1);
          incrementScore(INCREMENT_AMOUNT); // Incrementa el puntaje al comer un pacDot
        }
        if (tilemap.getTile({ x: Math.round(x), y: Math.round(y) }) === 2) {
          tilemap.updateTile({ x: Math.round(x), y: Math.round(y) }, -1);
          hunt(); // Incrementa el puntaje al comer un pellet
        }
      }
    );
  });

  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.5, 32, 32]} />      
        <meshStandardMaterial color={status === pacmanStatusValue.INVINCIBLE ? "orange" : "yellow"} />
    </mesh>
  );
}
