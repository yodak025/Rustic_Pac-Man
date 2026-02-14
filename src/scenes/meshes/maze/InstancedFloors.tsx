'use client'

import { Instances, Instance } from '@react-three/drei';
import { useWorldColors } from '@core/hooks/useWorldColors';
import type { Position } from '@custom-types/gameComponents';

export interface InstancedFloorsProps {
  positions: Position[];
}

export default function InstancedFloors({ positions }: InstancedFloorsProps) {
  const { floor } = useWorldColors();

  return (
    <Instances limit={positions.length}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={floor} />
      {positions.map(({ x, y }) => (
        <Instance key={`${x},${y}`} position={[x, -0.3, y]} />
      ))}
    </Instances>
  );
}
