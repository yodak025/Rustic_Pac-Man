'use client'

import { useRef, useEffect, useMemo } from 'react';
import { InstancedMesh, Object3D, BoxGeometry, MeshStandardMaterial } from 'three';
import { useWorldColors } from '@core/hooks/useWorldColors';
import type { Position } from '@custom-types/gameComponents';

export interface InstancedWallsProps {
  positions: Position[];
}

const MAX_INSTANCES = 100000;

export default function InstancedWalls({ positions }: InstancedWallsProps) {
  const { walls } = useWorldColors();
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  const geometry = useMemo(() => new BoxGeometry(1, 0.5, 1), []);
  const material = useMemo(() => new MeshStandardMaterial({ color: walls }), [walls]);

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

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_INSTANCES]}
      frustumCulled={false}
    />
  );
}
