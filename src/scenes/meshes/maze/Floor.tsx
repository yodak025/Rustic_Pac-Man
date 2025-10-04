import { useTexture } from "@react-three/drei";
import { useGameStatusStore } from "@state/store";

export default function Floor({ x, z }: { x: number; z: number }) {
  const level = useGameStatusStore((state) => state.level);
  const floor = useTexture(`assets/floor${(level - 1) % 4}.jpg`);

  return (
    <mesh position={[x, -0.3, z]}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial map={floor} />
    </mesh>
  );
}
