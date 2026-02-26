'use client'

import { PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";

import PacmanMesh from "@scenes/meshes/entities/PacmanMesh";
import BlinkyMesh from "@scenes/meshes/entities/BlinkyMesh";
import ClydeMesh from "./meshes/entities/ClydeMesh";
import PinkyMesh from "./meshes/entities/PinkyMesh";
import InkyMesh from "./meshes/entities/InkyMesh";

import Maze from "./meshes/maze/Maze";
import { useWorldColors } from "@core/hooks/useWorldColors";
import { usePacmanHotState } from "@/state/useHotState";

const INTERVAL_SIZE = 32;
const CAMERA_TRANSITION_SPEED = 0.08;
const EDGE_MARGIN_TILES = 2;

/**
 * Calculate which interval index contains the given position
 */
function getIntervalIndex(position: number, intervalSize: number): number {
  return Math.floor(position / intervalSize);
}

/**
 * Calculate the center of an interval
 */
function getIntervalCenter(intervalIndex: number, intervalSize: number): number {
  return intervalIndex * intervalSize + intervalSize / 2;
}

/**
 * Check if position is within the conservative trigger zone
 * (not in the 2-tile edge margins of the interval)
 */
function isInConservativeTriggerZone(
  position: number,
  intervalIndex: number,
  intervalSize: number,
  edgeMargin: number
): boolean {
  const intervalStart = intervalIndex * intervalSize;
  const intervalEnd = intervalStart + intervalSize - 1;

  return (
    position >= intervalStart + edgeMargin &&
    position <= intervalEnd - edgeMargin
  );
}

export default function GameScene() {
  const { scene } = useThree();
  const { void: voidColor } = useWorldColors();
  const pacmanPosition = usePacmanHotState().position;

  const [targetCameraX, setTargetCameraX] = useState<number>(getIntervalCenter(0, INTERVAL_SIZE));
  const currentCameraX = useRef<number>(getIntervalCenter(0, INTERVAL_SIZE));
  const lastCommittedIntervalIndex = useRef<number>(0);

  // Calculate current interval index
  const currentIntervalIndex = useMemo(
    () => getIntervalIndex(pacmanPosition.x, INTERVAL_SIZE),
    [pacmanPosition.x]
  );

  // Update scene background color when world changes
  useEffect(() => {
    scene.background = new THREE.Color(voidColor);
  }, [scene, voidColor]);

  // Determine if we should update camera position (with conservative trigger)
  useEffect(() => {
    const pacmanX = pacmanPosition.x;

    // Check if we're in a different interval than the last committed one
    if (currentIntervalIndex !== lastCommittedIntervalIndex.current) {
      // Only commit the change if we're in the conservative trigger zone
      if (isInConservativeTriggerZone(pacmanX, currentIntervalIndex, INTERVAL_SIZE, EDGE_MARGIN_TILES)) {
        lastCommittedIntervalIndex.current = currentIntervalIndex;
        setTargetCameraX(getIntervalCenter(currentIntervalIndex, INTERVAL_SIZE));
      }
    }
  }, [pacmanPosition.x, currentIntervalIndex]);

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
        rotation={[-Math.PI / 3, 0, 0]}
        fov={75}
        near={8}
        far={60}
      />
      <ambientLight intensity={0.2} />

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
