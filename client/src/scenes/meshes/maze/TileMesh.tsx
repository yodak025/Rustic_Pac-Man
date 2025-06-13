
interface TileMeshProps {
  x: number;
  z: number;
}

export default function TileMesh({ x, z }: TileMeshProps) {
  return (
    <mesh position={[x, 0, z]}>
      <boxGeometry args={[0.95, 1, 0.95]} />
      <meshStandardMaterial color="cyan" />
    </mesh>
  );
}