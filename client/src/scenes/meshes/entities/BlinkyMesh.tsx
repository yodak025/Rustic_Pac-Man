interface BlinkyMeshProps {
  x: number;
  z: number;
}

export default function BlinkyMesh({ x, z }: BlinkyMeshProps) {

  return (
    <mesh position={[x, 1, z]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}