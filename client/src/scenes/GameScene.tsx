import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TileMesh from "./meshes/maze/TileMesh";
import useGameState from "@state/store";
import type { JSX } from "react";
import { loadMaze } from "../services/api";
import { useEffect } from "react";

export default function GameScene() {
  const { tileMap, setTileMap } = useGameState((state) => state);
  useEffect(() => {
    loadMaze().then((maze) => {
      setTileMap(maze!);
    });
  }, []);
  const tileMeshesContainer: JSX.Element[] = [];
  tileMap?.forEachTile((_: number, x: number, y: number) => {
    tileMeshesContainer.push(<TileMesh x={x} z={y} />);
  });

  return (
    <Canvas
      className="bg-gradient-to-br from-stone-600 to-stone-300 "
      style={{ height: "60vh" }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {tileMeshesContainer}

      {/* Controls for camera movement */}

      <OrbitControls />
    </Canvas>
  );
}
