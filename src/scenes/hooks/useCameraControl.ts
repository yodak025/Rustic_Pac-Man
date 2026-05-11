/**
 * useCameraControl
 *
 * Drives the Three.js camera every frame with smooth lerp transitions.
 * Handles two camera modes:
 *   - Normal: third-person follow with horizontal interval scrolling
 *   - Bird's-eye: directly above Chomp (active during VISION ability)
 *
 * Must be called from a component inside a React Three Fiber Canvas.
 */

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePacmanHotState, useLevel } from "@/state/useHotState";
import { MedallionKind } from "@custom-types/gameComponents";

const INTERVAL_SIZE = 32;
const SCROLL_LERP_SPEED = 0.08;
const EDGE_MARGIN_TILES = 2;

const NORMAL_Y = 12;
const NORMAL_PITCH = -Math.PI / 3;
const NORMAL_FOV = 75;
const NORMAL_NEAR = 8;
const NORMAL_FAR = 60;

const BIRDSEYE_HEIGHT = 80;
const BIRDSEYE_Z_OFFSET = 0;
const BIRDSEYE_PITCH = -Math.PI / 2;
const BIRDSEYE_FOV = 60;
const BIRDSEYE_FAR = 150;

// TAU = 0.12 → ~98% of the way in 0.55 s (perceived as a clean 0.5 s transition).
const TRANSITION_TAU = 0.12;

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
  edgeMargin: number,
): boolean {
  const intervalStart = intervalIndex * intervalSize;
  const intervalEnd = intervalStart + intervalSize - 1;
  return (
    position >= intervalStart + edgeMargin &&
    position <= intervalEnd - edgeMargin
  );
}

export function useCameraControl(): void {
  const { camera } = useThree();
  const pacman = usePacmanHotState();

  // Keep a fresh ref so useFrame always reads the latest values
  // without depending on React's closure update cycle.
  const pacmanRef = useRef(pacman);
  pacmanRef.current = pacman;

  const level = useLevel();

  // ── Horizontal scroll refs ──────────────────────────────────────────────────
  const targetCameraX = useRef<number>(getIntervalCenter(0, INTERVAL_SIZE));
  const currentCameraX = useRef<number>(getIntervalCenter(0, INTERVAL_SIZE));
  const lastCommittedIntervalIndex = useRef<number>(0);

  // ── Interpolated camera state refs (mutated each frame) ────────────────────
  const camPos = useRef<THREE.Vector3>(
    new THREE.Vector3(getIntervalCenter(0, INTERVAL_SIZE), NORMAL_Y, 30 - 16),
  );
  const camPitch = useRef<number>(NORMAL_PITCH);
  const camFov = useRef<number>(NORMAL_FOV);
  const camFar = useRef<number>(NORMAL_FAR);

  // Reset camera refs to initial position on level change
  useEffect(() => {
    targetCameraX.current = getIntervalCenter(0, INTERVAL_SIZE);
    currentCameraX.current = getIntervalCenter(0, INTERVAL_SIZE);
    lastCommittedIntervalIndex.current = 0;
    camPos.current.set(getIntervalCenter(0, INTERVAL_SIZE), NORMAL_Y, 30 - 16);
    camPitch.current = NORMAL_PITCH;
    camFov.current = NORMAL_FOV;
    camFar.current = NORMAL_FAR;
  }, [level]);

  // Update target camera X when Pacman crosses interval boundaries
  useEffect(() => {
    const pacmanX = pacman.position.x;
    const currentIntervalIndex = getIntervalIndex(pacmanX, INTERVAL_SIZE);
    if (currentIntervalIndex !== lastCommittedIntervalIndex.current) {
      if (
        isInConservativeTriggerZone(
          pacmanX,
          currentIntervalIndex,
          INTERVAL_SIZE,
          EDGE_MARGIN_TILES,
        )
      ) {
        lastCommittedIntervalIndex.current = currentIntervalIndex;
        targetCameraX.current = getIntervalCenter(
          currentIntervalIndex,
          INTERVAL_SIZE,
        );
      }
    }
  }, [pacman.position.x]);

  useFrame((_, delta) => {
    const p = pacmanRef.current;
    const isBirdsEye = p.activeAbilityKind === MedallionKind.VISION;
    // Frame-rate independent exponential decay factor.
    const lerpFactor = 1 - Math.exp(-delta / TRANSITION_TAU);

    let targetX: number;
    let targetY: number;
    let targetZ: number;
    let targetPitch: number;
    let targetFov: number;
    let targetFar: number;

    if (isBirdsEye) {
      targetX = p.position.x;
      targetY = BIRDSEYE_HEIGHT;
      targetZ = p.position.y + BIRDSEYE_Z_OFFSET;
      targetPitch = BIRDSEYE_PITCH;
      targetFov = BIRDSEYE_FOV;
      targetFar = BIRDSEYE_FAR;
    } else {
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

    camPos.current.set(
      camPos.current.x + (targetX - camPos.current.x) * lerpFactor,
      camPos.current.y + (targetY - camPos.current.y) * lerpFactor,
      camPos.current.z + (targetZ - camPos.current.z) * lerpFactor,
    );

    camPitch.current += (targetPitch - camPitch.current) * lerpFactor;
    camFov.current += (targetFov - camFov.current) * lerpFactor;
    camFar.current += (targetFar - camFar.current) * lerpFactor;

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
}
