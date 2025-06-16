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
  const tilemap = useTilemapState((state) => state);
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
        tilemap.setTileMap(maze);
        tileMeshes.length = 0;
        tilemap.forEachTile((_: number, x: number, y: number) => {
          tileMeshes.push(<TileMesh key={`${x}-${y}`} x={x} z={y} />);
        });
        const initialPacmanPosition = tilemap.getRandomTileCoords(0);
        movementSystem.current = new MovementSystem(7, 0.5);

        const newBlinkyPosition = tilemap.getRandomTileCoords(0);

        tilemap.updateTile(initialPacmanPosition.x, initialPacmanPosition.y, -1);

        pacmanState.setPosition(initialPacmanPosition);
        setBlinkyPosition(newBlinkyPosition);
        setIsInitialized(true);
      }
    });
  }, []);

  const tileMeshes = useMemo(() => {
    if (!isInitialized) return [];

    const meshes: JSX.Element[] = [];
    tilemap.forEachTile((_: number, x: number, y: number) => {
      meshes.push(<TileMesh key={`${x}-${y}`} x={x} z={y} />);
    });
    return meshes;
  }, [isInitialized, tilemap.tiles, tilemap.updateTile]); // Se recalcula cuando cambia isInitialized o tiles

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
      tilemap,
      (position: any) => {
        const { x, y } = position;
        tilemap.updateTile(Math.round(x), Math.round(y), -1);
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
