'use client'

import { useRef, useEffect, useMemo } from 'react';
import { InstancedMesh, Object3D, SphereGeometry, MeshStandardMaterial } from 'three';
import { useCollectablesColors } from '@core/hooks/useCollectablesColors';
import type { Position } from '@custom-types/gameComponents';

export interface InstancedPacDotsProps {
  positions: Position[];
}

const MAX_INSTANCES = 100000;

export default function InstancedPacDots({ positions }: InstancedPacDotsProps) {
  const { essenceDots } = useCollectablesColors();
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  const geometry = useMemo(() => new SphereGeometry(0.1, 8, 8), []);
  const material = useMemo(() => new MeshStandardMaterial({ color: essenceDots }), [essenceDots]);

  useEffect(() => {
    if (!meshRef.current) return;

    const count = positions.length;
    meshRef.current.count = count;

    positions.forEach((pos, i) => {
      tempObject.position.set(pos.x, 0, pos.y);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, tempObject]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material = material;
    }
  }, [material]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_INSTANCES]}
      frustumCulled={false}
    />
  );
}
