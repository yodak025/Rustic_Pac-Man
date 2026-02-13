'use client'

import { useWorldColors } from '@core/hooks/useWorldColors';

export default function Wall({ x, z }: { x: number; z: number }) {
  const { walls } = useWorldColors();

  return (
    <mesh position={[x, 0, z]}>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial color={walls} />
    </mesh>
  );
}
