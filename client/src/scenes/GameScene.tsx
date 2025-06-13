import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TileMesh from "./meshes/maze/TileMesh";
import useGameState from "@state/store";
import type { JSX } from "react";
import { loadMaze } from "../services/api";
import { useEffect, useState} from "react";
import PacmanMesh from "./meshes/entities/PacmanMesh";
import BlinkyMesh from "./meshes/entities/BlinkyMesh";

export default function GameScene() {
  const { tileMap, setTileMap } = useGameState((state) => state);
  const [pacmanPosition, setPacmanPosition] = useState<{ x: number; y: number }>({x: -4, y: -3});
  const [blinkyPosition, setBlinkyPosition] = useState<{ x: number; y: number }>({x: -3, y: -3});
  const [tileMeshesContainer, setTileMeshesContainer] = useState<JSX.Element[]>([]);
  useEffect(() => {
    loadMaze().then((maze) => {
      setTileMap(maze!)
      
    });
    
  }, [ setTileMap]);

  useEffect(() => {
    if (!tileMap) return;
    setPacmanPosition(tileMap!.getRandomEmptyTileCoords());
    setBlinkyPosition(tileMap!.getRandomEmptyTileCoords());
    tileMap!.set(0, 0, -1)
    tileMap!.set(1, 1, -1)
    tileMap!.forEachTile((_: number, x: number, y: number) => {
    setTileMeshesContainer(prev => [
      ...prev,
      <TileMesh key={`${x}-${y}`} x={x} z={y} />
    ]);
  });
  }, [tileMap]);

  
  

  return (
    <Canvas
      className="bg-gradient-to-br from-stone-600 to-stone-300 "
      style={{ height: "60vh" }}
      camera={{ position: [0, 30, 0], rotation: [Math.PI / 2, 0, 0] }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {tileMeshesContainer}

      <PacmanMesh x={pacmanPosition!.x} z={pacmanPosition!.y} />
      <BlinkyMesh x={blinkyPosition!.x} z={blinkyPosition!.y} />
      {/* Controls for camera movement */}

      <OrbitControls />
    </Canvas>
  );
}
