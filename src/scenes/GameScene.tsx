'use client'

import { PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

import PacmanMesh from "@scenes/meshes/entities/PacmanMesh";
import BlinkyMesh from "@scenes/meshes/entities/BlinkyMesh";
import ClydeMesh from "./meshes/entities/ClydeMesh";
import PinkyMesh from "./meshes/entities/PinkyMesh";
import InkyMesh from "./meshes/entities/InkyMesh";

import Maze from "./meshes/maze/Maze";
import { useWorldColors } from "@core/hooks/useWorldColors";

export default function GameScene() {
  const { scene } = useThree();
  const { void: voidColor } = useWorldColors();

  // Update scene background color when world changes
  useEffect(() => {
    scene.background = new THREE.Color(voidColor);
  }, [scene, voidColor]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[16, 12, 30]}
        rotation={[-Math.PI / 3.5, 0, 0]}
        fov={75}
        near={0.1}
        far={1000}
      />
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} />

      <Maze />
      <PacmanMesh />
      <BlinkyMesh />
      <ClydeMesh />
      <PinkyMesh />
      <InkyMesh />

      {/* Controls for camera movement */}
      {/* <OrbitControls target={[14, 0, 19]} /> */}
    </>
  );
}
