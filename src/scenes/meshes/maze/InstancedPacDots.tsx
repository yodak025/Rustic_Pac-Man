'use client'

import { Instances, Instance } from '@react-three/drei';
import { useCollectablesColors } from '@core/hooks/useCollectablesColors';
import type { Position } from '@custom-types/gameComponents';

export interface InstancedPacDotsProps {
  positions: Position[];
}

export default function InstancedPacDots({ positions }: InstancedPacDotsProps) {
  const { pacDots } = useCollectablesColors();

  if (positions.length === 0) return null;

  return (
    <Instances limit={positions.length}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={pacDots} />
      {positions.map(({ x, y }) => (
        <Instance key={`${x},${y}`} position={[x, 0, y]} />
      ))}
    </Instances>
  );
}
