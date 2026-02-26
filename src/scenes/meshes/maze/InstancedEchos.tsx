'use client'

import { useRef, useEffect, useMemo } from 'react';
import { InstancedMesh, Object3D, SphereGeometry, MeshStandardMaterial, Euler, Vector3 } from 'three';
import type { EchoRenderState } from '@state/useHotState';
import { calculateRotation, getEchoColor, calculateScaleFactor } from '@scenes/hooks/useEchoRenderState';

const BASE_SCALE = 0.4;

interface EchoData {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface EchosByColor {
  color: string;
  echos: EchoData[];
}

interface InstancedEchosProps {
  echosMap: Map<string, EchoRenderState>;
}

const MAX_INSTANCES = 100000;

function EchoGroup({ color, echos }: EchosByColor) {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);
  const tempEuler = useMemo(() => new Euler(), []);
  const tempScale = useMemo(() => new Vector3(), []);

  const geometry = useMemo(() => new SphereGeometry(1, 16, 16), []);
  const material = useMemo(() => new MeshStandardMaterial({ color }), [color]);

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

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material = material;
    }
  }, [material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_INSTANCES]}
      frustumCulled={false}
    />
  );
}

export default function InstancedEchos({ echosMap }: InstancedEchosProps) {
  const echosByColor = useMemo(() => {
    const groups = new Map<string, EchoData[]>();

    echosMap.forEach((echoState, echoId) => {
      const color = getEchoColor(echoState.mode);
      const rotation = calculateRotation(echoState.direction);
      const scaleFactor = calculateScaleFactor(echoState.timer.elapsed, echoState.timer.interval);
      const scale = BASE_SCALE * scaleFactor;

      if (!groups.has(color)) {
        groups.set(color, []);
      }

      groups.get(color)!.push({
        id: echoId,
        x: echoState.position.x,
        y: echoState.position.y,
        rotation,
        scale
      });
    });

    return Array.from(groups.entries()).map(([color, echos]) => ({
      color,
      echos
    }));
  }, [echosMap]);

  const totalEchos = echosMap.size;

  if (totalEchos === 0) {
    return null;
  }

  return (
    <>
      {echosByColor.map(({ color, echos }) => (
        <EchoGroup key={color} color={color} echos={echos} />
      ))}
    </>
  );
}

