import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TileMesh from "./meshes/maze/TileMesh";
import useGameState from "@state/store";
import { usePacmanState } from "@state/usePacmanState";
import type { JSX } from "react";
import { loadMaze } from "./meshes/services/api";
import { useEffect, useState, useRef} from "react";
import PacmanMesh from "./meshes/entities/PacmanMesh";
import BlinkyMesh from "./meshes/entities/BlinkyMesh";
import { useKeyboardControls } from "@react-three/drei";
import MovementSystem from "@core/systems/movementSystem";

export default function GameScene() {
  const { tileMap, setTileMap, updateTile } = useGameState((state) => state);
  const pacmanState = usePacmanState((state) => state);
  const [blinkyPosition, setBlinkyPosition] = useState<{ x: number; y: number }>({x: -3, y: -3});
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
    movementSystem.current = new MovementSystem(tileMap, 5, 0.5);

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
    if (!movementSystem.current) return;
    movementSystem.current.move(
      pacmanState.position,
      pacmanState.setPosition,
      getKeys(),
      delta,
      ((position) =>{
        const {x, y} = position;
        updateTile(Math.round(x), Math.round(y), -1);
      })
    )
  
  
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
