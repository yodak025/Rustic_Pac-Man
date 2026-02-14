'use client'

import { Instances, Instance } from '@react-three/drei';
import { useWorldColors } from '@core/hooks/useWorldColors';
import type { Position } from '@custom-types/gameComponents';

export interface InstancedWallsProps {
  positions: Position[];
}

export default function InstancedWalls({ positions }: InstancedWallsProps) {
  const { walls } = useWorldColors();

  return (
    <Instances limit={positions.length}>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial color={walls} />
      {positions.map(({ x, y }) => (
        <Instance key={`${x},${y}`} position={[x, 0, y]} />
      ))}
    </Instances>
  );
}
