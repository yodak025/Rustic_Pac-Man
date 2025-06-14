
interface PacmanMeshProps {
  x: number;
  z: number;
}

export default function PacmanMesh({ x, z }: PacmanMeshProps) {

  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
}