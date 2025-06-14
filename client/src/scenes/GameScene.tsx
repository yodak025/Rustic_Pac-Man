import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TileMesh from "./meshes/maze/TileMesh";
import useGameState from "@state/store";
import type { JSX } from "react";
import { loadMaze } from "../services/api";
import { useEffect, useState, useRef} from "react";
import PacmanMesh from "./meshes/entities/PacmanMesh";
import BlinkyMesh from "./meshes/entities/BlinkyMesh";

export default function GameScene() {
  const { tileMap, setTileMap, updateTile } = useGameState((state) => state);
  const [pacmanPosition, setPacmanPosition] = useState<{ x: number; y: number }>({x: -4, y: -3});
  const [blinkyPosition, setBlinkyPosition] = useState<{ x: number; y: number }>({x: -3, y: -3});
  const [isInitialized, setIsInitialized] = useState(false);
  const isFetched = useRef(false);
  
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
    
    const newPacmanPosition = tileMap.getRandomTileCoords(0);
    const newBlinkyPosition = tileMap.getRandomTileCoords(0);
    
    updateTile(newPacmanPosition.x, newPacmanPosition.y, -1);
    
    setPacmanPosition(newPacmanPosition);
    setBlinkyPosition(newBlinkyPosition);
    setIsInitialized(true);
  }, [tileMap, isInitialized, updateTile]);
  

  

  return (
    <Canvas
      className="bg-gradient-to-br from-stone-600 to-stone-300 "
      style={{ height: "60vh" }}
      camera={{ position: [0, 30, 0], rotation: [Math.PI / 2, 0, 0] }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

       {renderTileMeshes()}

      <PacmanMesh x={pacmanPosition!.x} z={pacmanPosition!.y} />
      <BlinkyMesh x={blinkyPosition!.x} z={blinkyPosition!.y} />
      {/* Controls for camera movement */}

      <OrbitControls />
    </Canvas>
  );
}
