import { useTexture } from "@react-three/drei";
import { useGameHotState } from "@state/useHotState";

export default function Wall({ x, z }: { x: number; z: number }) {
  const level = useGameHotState().level;
  const walls = useTexture(`assets/walls${(level - 1) % 4}.jpg`);

  return (
    <mesh position={[x, 0, z]}>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial map={walls} />
    </mesh>
  );
}
