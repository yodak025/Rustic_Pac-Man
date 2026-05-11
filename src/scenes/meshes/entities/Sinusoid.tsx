"use client";

import * as THREE from "three";
import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import type { EchoRenderState } from "@state/useHotState";
import {
  calculateRotation,
  calculateScaleFactor,
} from "@scenes/hooks/useEchoRenderState";
import { BehaviorMode } from "@/types/gameComponents";

type GLTFResult = GLTF & {
  nodes: {
    mesh_0: THREE.Mesh;
  };
  materials: {};
  animations: THREE.AnimationClip[];
};

const BASE_SCALE = 0.4;
const MAX_INSTANCES = 100000;

interface EchoData {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface EchosByMode {
  mode: BehaviorMode;
  echos: EchoData[];
}

interface InstancedSinusoidsProps {
  echosMap: Map<string, EchoRenderState>;
}

function EchoGroup({
  mode,
  echos,
  geometry,
  materials,
}: EchosByMode & {
  geometry: THREE.BufferGeometry;
  materials: Map<BehaviorMode, THREE.Material>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempEuler = useMemo(() => new THREE.Euler(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);

  const material = useMemo(() => {
    return materials.get(mode) || materials.get(BehaviorMode.IDLE)!;
  }, [mode, materials]);

  useEffect(() => {
    if (!meshRef.current) return;

    const count = echos.length;
    meshRef.current.count = count;

    echos.forEach((echo, i) => {
      tempObject.position.set(echo.x, 0.4, echo.y);
      tempEuler.set(0, echo.rotation, 0);
      tempObject.rotation.copy(tempEuler);
      tempScale.set(echo.scale, echo.scale, echo.scale);
      tempObject.scale.copy(tempScale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [echos, tempObject, tempEuler, tempScale]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_INSTANCES]}
      frustumCulled={false}
    />
  );
}

export default function Sinusoid({ echosMap }: InstancedSinusoidsProps) {
  const { nodes: baseNodes } = useGLTF(
    "/assets/models/sinusoid-base.glb",
  ) as unknown as GLTFResult;
  const { nodes: frightenedNodes } = useGLTF(
    "/assets/models/sinusoid-frightened.glb",
  ) as unknown as GLTFResult;
  const { nodes: chaseNodes } = useGLTF(
    "/assets/models/sinusoid-chase.glb",
  ) as unknown as GLTFResult;

  const geometry = baseNodes.mesh_0.geometry;

  const materials = useMemo(() => {
    const map = new Map<BehaviorMode, THREE.Material>();
    // Default / base
    map.set(BehaviorMode.IDLE, baseNodes.mesh_0.material as THREE.Material);
    map.set(BehaviorMode.SCATTER, baseNodes.mesh_0.material as THREE.Material);
    map.set(BehaviorMode.EATEN, baseNodes.mesh_0.material as THREE.Material);

    // Chase
    map.set(BehaviorMode.CHASE, chaseNodes.mesh_0.material as THREE.Material);

    // Frightened
    map.set(
      BehaviorMode.FRIGHTENED,
      frightenedNodes.mesh_0.material as THREE.Material,
    );

    return map;
  }, [baseNodes, frightenedNodes, chaseNodes]);

  const echosByMode = useMemo(() => {
    const groups = new Map<BehaviorMode, EchoData[]>();

    echosMap.forEach((echoState, echoId) => {
      const mode = echoState.mode;
      const rotation = calculateRotation(echoState.direction);
      const scaleFactor = calculateScaleFactor(
        echoState.timer.elapsed,
        echoState.timer.interval,
      );
      const scale = BASE_SCALE * scaleFactor;

      if (!groups.has(mode)) {
        groups.set(mode, []);
      }

      groups.get(mode)!.push({
        id: echoId,
        x: echoState.position.x,
        y: echoState.position.y,
        rotation,
        scale,
      });
    });

    return Array.from(groups.entries()).map(([mode, echos]) => ({
      mode,
      echos,
    }));
  }, [echosMap]);

  const totalEchos = echosMap.size;

  if (totalEchos === 0) {
    return null;
  }

  return (
    <>
      {echosByMode.map(({ mode, echos }) => (
        <EchoGroup
          key={mode}
          mode={mode}
          echos={echos}
          geometry={geometry}
          materials={materials}
        />
      ))}
    </>
  );
}

useGLTF.preload("/assets/models/sinusoid-base.glb");
useGLTF.preload("/assets/models/sinusoid-frightened.glb");
useGLTF.preload("/assets/models/sinusoid-chase.glb");
