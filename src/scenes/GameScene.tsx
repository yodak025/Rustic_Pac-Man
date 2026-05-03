'use client'

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import Maze from "./meshes/maze/Maze";
import ChompMesh from "./meshes/entities/ChompMesh";
import { useWorldColors } from "@core/hooks/useWorldColors";
import { usePacmanHotState } from "@/state/useHotState";
import { MedallionKind } from "@custom-types/gameComponents";

const INTERVAL_SIZE = 32;
const SCROLL_LERP_SPEED = 0.08; // per-frame factor for horizontal scroll
const EDGE_MARGIN_TILES = 2;

// Normal camera parameters
const NORMAL_Y = 12;
const NORMAL_PITCH = -Math.PI / 3;
const NORMAL_FOV = 75;
const NORMAL_NEAR = 8;
const NORMAL_FAR = 60;

// Bird's-eye view parameters (VISION active ability)
const BIRDSEYE_HEIGHT = 80;
const BIRDSEYE_Z_OFFSET = 0;
const BIRDSEYE_PITCH = -Math.PI / 2;
const BIRDSEYE_FOV = 60;
const BIRDSEYE_FAR = 150;

// Camera transition: time constant for exponential decay lerp.
// TAU = 0.12 → ~98% of the way in 0.55 s (perceived as a clean 0.5 s transition).
const TRANSITION_TAU = 0.12;

// ── Interval helpers ──────────────────────────────────────────────────────────

function getIntervalIndex(position: number, intervalSize: number): number {
  return Math.floor(position / intervalSize);
}

function getIntervalCenter(intervalIndex: number, intervalSize: number): number {
  return intervalIndex * intervalSize + intervalSize / 2;
}

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
  const { scene, camera } = useThree();
  const { void: voidColor } = useWorldColors();
  const pacman = usePacmanHotState();

  // Keep a fresh ref of pacman state so useFrame always reads the latest values
  // without depending on React's closure update cycle.
  const pacmanRef = useRef(pacman);
  pacmanRef.current = pacman;

  // ── Horizontal scroll refs ────────────────────────────────────────────────
  const targetCameraX = useRef<number>(getIntervalCenter(0, INTERVAL_SIZE));
  const currentCameraX = useRef<number>(getIntervalCenter(0, INTERVAL_SIZE));
  const lastCommittedIntervalIndex = useRef<number>(0);

  // ── Camera state interpolation refs ──────────────────────────────────────
  // These hold the *current interpolated* camera state and are mutated in useFrame.
  const camPos = useRef<THREE.Vector3>(new THREE.Vector3(
    getIntervalCenter(0, INTERVAL_SIZE),
    NORMAL_Y,
    30 - 16
  ));
  const camPitch = useRef<number>(NORMAL_PITCH);
  const camFov = useRef<number>(NORMAL_FOV);
  const camFar = useRef<number>(NORMAL_FAR);

  // Update scene background color when world changes
  useEffect(() => {
    scene.background = new THREE.Color(voidColor);
  }, [scene, voidColor]);

  // Update target camera X when Pacman crosses interval boundaries
  useEffect(() => {
    const pacmanX = pacman.position.x;
    const currentIntervalIndex = getIntervalIndex(pacmanX, INTERVAL_SIZE);

    if (currentIntervalIndex !== lastCommittedIntervalIndex.current) {
      if (isInConservativeTriggerZone(pacmanX, currentIntervalIndex, INTERVAL_SIZE, EDGE_MARGIN_TILES)) {
        lastCommittedIntervalIndex.current = currentIntervalIndex;
        targetCameraX.current = getIntervalCenter(currentIntervalIndex, INTERVAL_SIZE);
      }
    }
  }, [pacman.position.x]);

  // Drive the camera imperatively every frame with smooth lerp transitions.
  useFrame((_, delta) => {
    const p = pacmanRef.current;
    const isBirdsEye = p.activeAbilityKind === MedallionKind.VISION;

    // Exponential decay factor — frame-rate independent.
    // At delta = 1/60 s this gives ~0.14 per frame, reaching ~98 % in ~0.55 s.
    const lerpFactor = 1 - Math.exp(-delta / TRANSITION_TAU);

    let targetX: number;
    let targetY: number;
    let targetZ: number;
    let targetPitch: number;
    let targetFov: number;
    let targetFar: number;

    if (isBirdsEye) {
      // Birds-eye target: directly above Chomp
      targetX = p.position.x;
      targetY = BIRDSEYE_HEIGHT;
      targetZ = p.position.y + BIRDSEYE_Z_OFFSET;
      targetPitch = BIRDSEYE_PITCH;
      targetFov = BIRDSEYE_FOV;
      targetFar = BIRDSEYE_FAR;
    } else {
      // Normal follow target: smooth horizontal scroll
      const diff = targetCameraX.current - currentCameraX.current;
      if (Math.abs(diff) > 0.01) {
        currentCameraX.current += diff * SCROLL_LERP_SPEED;
      } else {
        currentCameraX.current = targetCameraX.current;
      }

      targetX = currentCameraX.current;
      targetY = NORMAL_Y;
      targetZ = 30 + p.position.y - 16;
      targetPitch = NORMAL_PITCH;
      targetFov = NORMAL_FOV;
      targetFar = NORMAL_FAR;
    }

    // Interpolate position
    camPos.current.set(
      camPos.current.x + (targetX - camPos.current.x) * lerpFactor,
      camPos.current.y + (targetY - camPos.current.y) * lerpFactor,
      camPos.current.z + (targetZ - camPos.current.z) * lerpFactor
    );

    // Interpolate pitch (yaw/roll stay 0)
    camPitch.current += (targetPitch - camPitch.current) * lerpFactor;

    // Interpolate fov and far
    camFov.current += (targetFov - camFov.current) * lerpFactor;
    camFar.current += (targetFar - camFar.current) * lerpFactor;

    // Apply to Three.js camera
    camera.position.copy(camPos.current);
    camera.rotation.set(camPitch.current, 0, 0);

    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const pCam = camera as THREE.PerspectiveCamera;
      pCam.fov = camFov.current;
      pCam.far = camFar.current;
      pCam.near = NORMAL_NEAR;
      pCam.updateProjectionMatrix();
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />

      {/* Spotlight following Chomp from above */}

      <Maze />
      <ChompMesh />

      {/* Controls for camera movement */}
      {/* <OrbitControls target={[14, 0, 19]} /> */}
    </>
  );
}
