'use client'

import { Instances, Instance } from '@react-three/drei';
import { useWorldColors } from '@core/hooks/useWorldColors';
import type { Position } from '@custom-types/gameComponents';

export interface InstancedFloorsProps {
  positions: Position[];
  totalCount: number;
}

export default function InstancedFloors({ positions, totalCount }: InstancedFloorsProps) {
  const { floor } = useWorldColors();

  return (
    <Instances limit={totalCount}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={floor} />
      {positions.map(({ x, y }) => (
        <Instance key={`${x},${y}`} position={[x, -0.3, y]} />
      ))}
    </Instances>
  );
}
