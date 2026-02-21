'use client'

import { PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import PacmanMesh from "@scenes/meshes/entities/PacmanMesh";
import BlinkyMesh from "@scenes/meshes/entities/BlinkyMesh";
import ClydeMesh from "./meshes/entities/ClydeMesh";
import PinkyMesh from "./meshes/entities/PinkyMesh";
import InkyMesh from "./meshes/entities/InkyMesh";

import Maze from "./meshes/maze/Maze";
import { useWorldColors } from "@core/hooks/useWorldColors";
import { usePacmanHotState } from "@/state/useHotState";

// Hardcoded ranges (4 ranges of 32 positions each)
const RANGES = [
  { start: 0, end: 31, center: 16 },
  { start: 32, end: 63, center: 48 },
  { start: 64, end: 95, center: 80 },
  { start: 96, end: 127, center: 112 },
];

const CAMERA_TRANSITION_SPEED = 0.08;

export default function GameScene() {
  const { scene } = useThree();
  const { void: voidColor } = useWorldColors();
  const pacmanPosition = usePacmanHotState().position;

  const [targetCameraX, setTargetCameraX] = useState<number>(16);
  const currentCameraX = useRef<number>(16);

  // Update scene background color when world changes
  useEffect(() => {
    scene.background = new THREE.Color(voidColor);
  }, [scene, voidColor]);

  // Determine current range and update target camera position
  useEffect(() => {
    const pacmanX = pacmanPosition.x;

    for (const range of RANGES) {
      if (pacmanX >= range.start && pacmanX <= range.end) {
        setTargetCameraX(range.center);
        break;
      }
    }
  }, [pacmanPosition.x]);

  // Smooth camera traveling effect
  useEffect(() => {
    const animate = () => {
      const diff = targetCameraX - currentCameraX.current;

      if (Math.abs(diff) > 0.01) {
        currentCameraX.current += diff * CAMERA_TRANSITION_SPEED;
        requestAnimationFrame(animate);
      } else {
        currentCameraX.current = targetCameraX;
      }
    };

    animate();
  }, [targetCameraX]);

  // Camera follows player with offset (adapted from concept/giant-mazes)
  const cameraX = currentCameraX.current;
  const cameraZ = 30 + pacmanPosition.y - 16;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[cameraX, 12, cameraZ]}
        rotation={[-Math.PI / 3.5, 0, 0]}
        fov={75}
        near={8}
        far={60}
      />
      <ambientLight intensity={0.1} />

      {/* Spotlight following Chomp from above */}

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
