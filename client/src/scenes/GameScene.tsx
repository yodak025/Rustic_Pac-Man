import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TileMesh from "@scenes/meshes/maze/TileMesh";
import { useTilemapState, usePacmanState, useGhostsState } from "@state/store";
import { PerspectiveCamera } from "@react-three/drei";

import type { JSX } from "react";
import { loadMaze } from "@services/api";
import { useEffect, useState, useRef, useMemo} from "react";
import PacmanMesh from "@scenes/meshes/entities/PacmanMesh";
import Ghosts from "./meshes/entities/Ghosts";
import Maze from "./meshes/maze/Maze";


export default function GameScene() {
  const tilemap = useTilemapState((state) => state);
  
  return (
    <>
    <PerspectiveCamera
          makeDefault
          position={[tilemap.width / 2, 20, tilemap.height -6]}
          rotation={[-Math.PI / 2.5, 0, 0]}
          fov={75}
          near={0.1}
          far={1000}
        />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <Maze />
      <Ghosts />
      <PacmanMesh />

      {/* Controls for camera movement */}
      <OrbitControls target={[tilemap.width / 2, 0, tilemap.height/2 +2]} />

    </>
  );
}
