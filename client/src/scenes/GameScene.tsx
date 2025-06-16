import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TileMesh from "@scenes/meshes/maze/TileMesh";
import { useTilemapState, usePacmanState, useGhostsState } from "@state/store";

import type { JSX } from "react";
import { loadMaze } from "@services/api";
import { useEffect, useState, useRef, useMemo } from "react";
import PacmanMesh from "@scenes/meshes/entities/PacmanMesh";
import BlinkyMesh from "@scenes/meshes/entities/BlinkyMesh";
import { useKeyboardControls } from "@react-three/drei";
import MovementSystem from "@core/systems/movementSystem";
import GhostBehaviourSystem from "@core/systems/ghostBehaviourSystem";

export default function GameScene() {
  const tilemap = useTilemapState((state) => state);
  const pacmanState = usePacmanState((state) => state);
  const ghostsState = useGhostsState((state) => state);
  
  
  const [isInitialized, setIsInitialized] = useState(false);
  const isFetched = useRef(false);
  const pacmanMovement = useRef<MovementSystem | null>(null!);
  const blinkyMovement = useRef<MovementSystem | null>(null!);
  const blinkyBehaviour = useRef<GhostBehaviourSystem>(new GhostBehaviourSystem());

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
        pacmanMovement.current = new MovementSystem(7, 0.5);
        blinkyMovement.current = new MovementSystem(1, 0.5);
        ghostsState.addGhost({position:{x:0, y:0}, type: "Blinky" as any}); //! lazy any, recuerda arreglarlo

        const newBlinkyPosition = tilemap.getRandomTileCoords(0);

        tilemap.updateTile(initialPacmanPosition.x, initialPacmanPosition.y, -1);

        pacmanState.setPosition(initialPacmanPosition);
        ghostsState.setPosition(newBlinkyPosition, 0); //! 0 es un numero magico, recuerda arreglarlo
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

  const blinkyMesh = useMemo(() => {
    if (!isInitialized) return null;
    return <BlinkyMesh x={ghostsState.ghosts[0].position.x} z={ghostsState.ghosts[0].position.y} />

  }, [isInitialized, ghostsState.ghosts]);

  //? Me veo obligado a usar putos comentarios para separar el código de la escena del juego
  //? Porque hoy es mi puto dia libre y no voy a gastarlo refactorizando este desastre

  //------------------- Player controls -------------------------

  const [_, getKeys] = useKeyboardControls();

  useFrame((_, delta) => {
    if (!pacmanMovement.current) return;
    if (!blinkyMovement.current) return;
    pacmanMovement.current.move(
      pacmanState.position,
      pacmanState.setPosition,
      getKeys() as any,
      delta,
      tilemap,
      (position) => {
        const { x, y } = position;
        tilemap.updateTile(Math.round(x), Math.round(y), -1);
      }
    );
    blinkyMovement.current.move(
      ghostsState.ghosts[0].position,
      (position) => ghostsState.setPosition(position, 0), // 0 es el indice de Blinky
      blinkyBehaviour.current.directions,
      delta,
      tilemap,
      (position) => {
        blinkyBehaviour.current.decideDirection(tilemap.getTile, position);
      }
    );

  });
  //! Modifica como se escriben las posiciones de las entidades y ya de paso crea un sistema constructor de fantasmas 
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {tileMeshes}

      <PacmanMesh x={pacmanState.position.x} z={pacmanState.position.y} />
      {blinkyMesh}
      {/* Controls for camera movement */}

      <OrbitControls />
    </>
  );
}
