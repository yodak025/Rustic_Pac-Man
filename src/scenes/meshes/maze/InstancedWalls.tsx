'use client'

import { Instances, Instance } from '@react-three/drei';
import { useWorldColors } from '@core/hooks/useWorldColors';
import type { Position } from '@custom-types/gameComponents';

export interface InstancedWallsProps {
  positions: Position[];
  totalCount: number;
}

export default function InstancedWalls({ positions, totalCount }: InstancedWallsProps) {
  const { walls } = useWorldColors();

  return (
    <Instances limit={totalCount}>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial color={walls} />
      {positions.map(({ x, y }) => (
        <Instance key={`${x},${y}`} position={[x, 0, y]} />
      ))}
    </Instances>
  );
}
