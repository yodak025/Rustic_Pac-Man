import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TileMesh from "./meshes/maze/TileMesh";
import { useTilemapState, usePacmanState } from "@state/store";

import type { JSX } from "react";
import { loadMaze } from "../services/api";
import { useEffect, useState, useRef, useMemo } from "react";
import PacmanMesh from "./meshes/entities/PacmanMesh";
import BlinkyMesh from "./meshes/entities/BlinkyMesh";
import { useKeyboardControls } from "@react-three/drei";
import MovementSystem from "@core/systems/movementSystem";

export default function GameScene() {
  const { tiles, setTileMap, updateTile, forEachTile, getRandomTileCoords } =
    useTilemapState((state) => state);
  const pacmanState = usePacmanState((state) => state);
  const [blinkyPosition, setBlinkyPosition] = useState<{
    x: number;
    y: number;
  }>({ x: -3, y: -3 });
  const [isInitialized, setIsInitialized] = useState(false);
  const isFetched = useRef(false);
  var movementSystem = useRef<MovementSystem | null>(null!);

  // TODO: Hookear este desastre antes de que se me derritan los ojos leyendolo

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;
    loadMaze().then((maze) => {
      if (maze) {
        setTileMap(maze);
        tileMeshes.length = 0;
        forEachTile((_: number, x: number, y: number) => {
          tileMeshes.push(<TileMesh key={`${x}-${y}`} x={x} z={y} />);
        });
        const initialPacmanPosition = getRandomTileCoords(0);
        movementSystem.current = new MovementSystem(tiles, 5, 0.5);

        const newBlinkyPosition = getRandomTileCoords(0);

        updateTile(initialPacmanPosition.x, initialPacmanPosition.y, -1);

        pacmanState.setPosition(initialPacmanPosition);
        setBlinkyPosition(newBlinkyPosition);
        setIsInitialized(true);
      }
    });
  }, []);

  const tileMeshes = useMemo(() => {
    if (!isInitialized) return [];
    
    const meshes: JSX.Element[] = [];
    forEachTile((_: number, x: number, y: number) => {
      meshes.push(<TileMesh key={`${x}-${y}`} x={x} z={y} />);
    });
    return meshes;
  }, [isInitialized, tiles]); // Se recalcula cuando cambia isInitialized o tiles




  //? Me veo obligado a usar putos comentarios para separar el código de la escena del juego
  //? Porque hoy es mi puto dia libre y no voy a gastarlo refactorizando este desastre

  //------------------- Player controls -------------------------

  const [_, getKeys] = useKeyboardControls();

  useFrame((_, delta) => {
    if (!movementSystem.current) return;
    movementSystem.current.move(
      pacmanState.position,
      pacmanState.setPosition,
      getKeys(),
      delta,
      (position) => {
        const { x, y } = position;
        updateTile(Math.round(x), Math.round(y), -1);
      }
    );
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {tileMeshes}

      <PacmanMesh x={pacmanState.position.x} z={pacmanState.position.y} />
      <BlinkyMesh x={blinkyPosition!.x} z={blinkyPosition!.y} />
      {/* Controls for camera movement */}

      <OrbitControls />
    </>
  );
}
