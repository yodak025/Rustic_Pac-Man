'use client'

import { useWorldColors } from '@core/hooks/useWorldColors';

export default function Floor({ x, z }: { x: number; z: number }) {
  const { floor } = useWorldColors();

  return (
    <mesh position={[x, -0.3, z]}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={floor} />
    </mesh>
  );
}
