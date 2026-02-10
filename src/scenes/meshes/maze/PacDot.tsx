export default function PacDot({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.1, 30, 30]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}