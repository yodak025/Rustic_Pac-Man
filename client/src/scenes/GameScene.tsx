import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TileMesh from "./meshes/maze/TileMesh";
import useGameState from "@state/store";
import { usePacmanState } from "@state/usePacmanState";
import type { JSX } from "react";
import { loadMaze } from "../services/api";
import { useEffect, useState, useRef} from "react";
import PacmanMesh from "./meshes/entities/PacmanMesh";
import BlinkyMesh from "./meshes/entities/BlinkyMesh";
import { useKeyboardControls } from "@react-three/drei";

export default function GameScene() {
  const { tileMap, setTileMap, updateTile } = useGameState((state) => state);
  const pacmanState = usePacmanState((state) => state);
  const [blinkyPosition, setBlinkyPosition] = useState<{ x: number; y: number }>({x: -3, y: -3});
  const [isInitialized, setIsInitialized] = useState(false);
  const isFetched = useRef(false);
  
  // TODO: Hookear este desastre antes de que se me derritan los ojos leyendolo 

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;
    loadMaze().then((maze) => {
      if (maze) {
        setTileMap(maze);
      }
    });
  }, [setTileMap]);

  const renderTileMeshes = () => {
    if (!tileMap) return null;
    
    const meshes: JSX.Element[] = [];
    tileMap.forEachTile((_: number, x: number, y: number) => {
      meshes.push(<TileMesh key={`${x}-${y}`} x={x} z={y} />);
    });
    return meshes;
  };

  useEffect(() => {
    if (!tileMap || isInitialized) return;
    
    const initialPacmanPosition = tileMap.getRandomTileCoords(0);
    const newBlinkyPosition = tileMap.getRandomTileCoords(0);
    
    updateTile(initialPacmanPosition.x, initialPacmanPosition.y, -1);
    
    pacmanState.setPosition(initialPacmanPosition);
    setBlinkyPosition(newBlinkyPosition);
    setIsInitialized(true);
  }, [tileMap, isInitialized, updateTile]);
  
  
  //? Me veo obligado a usar putos comentarios para separar el código de la escena del juego
  //? Porque hoy es mi puto dia libre y no voy a gastarlo refactorizando este desastre

  //------------------- Player controls -------------------------

  const [_, getKeys] = useKeyboardControls()

  useFrame((_, delta)=>{
  const keys = getKeys();
  const speed = 10;
  let moved = false;
  let newPos = { x: pacmanState.position.x, y: pacmanState.position.y };
  
  if (keys.forward) {
    newPos.y -= speed * delta;
    moved = true;
  }
  if (keys.backward) {
    newPos.y += speed * delta;
    moved = true;
  }
  if (keys.left) {
    newPos.x -= speed * delta;
    moved = true;
  }
  if (keys.right) {
    newPos.x += speed * delta;
    moved = true;
  }

  // Actualizar el estado para forzar re-render
  if (moved) {
    pacmanState.setPosition(newPos);
  }
})

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

       {renderTileMeshes()}

      <PacmanMesh x={pacmanState.position.x} z={pacmanState.position.y} />
      <BlinkyMesh x={blinkyPosition!.x} z={blinkyPosition!.y} />
      {/* Controls for camera movement */}

      <OrbitControls />
    </>
  );
}
