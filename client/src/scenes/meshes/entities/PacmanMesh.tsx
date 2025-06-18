import useGameFrame from "@core/hooks/useGameFrame";
import {
  usePacmanState,
  useTilemapState,
  useGameStatusStore,
} from "@state/store";
import gameStatusValue from "@/types/gameStatusValue";
import { useEffect, useRef } from "react";
import MovementSystem from "@/core/systems/movementSystem";
import { useKeyboardControls } from "@react-three/drei";

export default function PacmanMesh() {
  const movement = useRef<MovementSystem>(new MovementSystem(7, 0.5));

  //-- acceso al estado de juego
  const { status: gameStatus, setStatus } = useGameStatusStore(
    (state) => state
  );
  const {
    position: { x, y: z },
    setPosition,
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

  useGameFrame((_, delta) => {
    movement.current.move(
      { x, y: z },
      setPosition,
      getKeys() as any, //! Lazy any, recuerda arreglarlo
      delta,
      tilemap,
      (position) => {
        const { x, y } = position;
        tilemap.updateTile({ x: Math.round(x), y: Math.round(y) }, -1);
      }
    );
  });

  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
}
