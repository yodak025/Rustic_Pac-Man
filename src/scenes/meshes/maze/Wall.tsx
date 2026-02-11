export default function Wall({ x, z }: { x: number; z: number }) {

  return (
    <mesh position={[x, 0, z]}>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial color="#44403C" />
    </mesh>
  );
}
