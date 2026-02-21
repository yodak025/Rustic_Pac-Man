'use client'

import { Instances, Instance } from '@react-three/drei';
import { useCollectablesColors } from '@core/hooks/useCollectablesColors';
import type { Position } from '@custom-types/gameComponents';

export interface InstancedPowerPelletsProps {
  positions: Position[];
  totalCount: number;
}

export default function InstancedPowerPellets({ positions, totalCount }: InstancedPowerPelletsProps) {
  const { powerPellets } = useCollectablesColors();

  if (positions.length === 0) return null;

  return (
    <Instances limit={totalCount}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshStandardMaterial color={powerPellets} />
      {positions.map(({ x, y }) => (
        <Instance key={`${x},${y}`} position={[x, 0, y]} />
      ))}
    </Instances>
  );
}
