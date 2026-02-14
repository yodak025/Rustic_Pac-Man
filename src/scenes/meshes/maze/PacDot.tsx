'use client'

import { useCollectablesColors } from '@core/hooks/useCollectablesColors';

export default function PacDot({ x, z }: { x: number; z: number }) {
  const { pacDots } = useCollectablesColors();

  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={pacDots} />
    </mesh>
  );
}