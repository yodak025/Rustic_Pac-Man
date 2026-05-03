'use client'

import { useCollectablesColors } from '@core/hooks/useCollectablesColors';

export default function PowerPellet({ x, z }: { x: number; z: number }) {
  const { whiteNoiseBalls } = useCollectablesColors();

  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshStandardMaterial color={whiteNoiseBalls} />
    </mesh>
  );
}