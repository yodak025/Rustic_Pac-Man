export default function Floor({ x, z }: { x: number; z: number }) {

  return (
    <mesh position={[x, -0.3, z]}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color="#1C1917" />
    </mesh>
  );
}
