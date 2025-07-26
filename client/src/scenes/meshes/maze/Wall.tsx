import useMazeState from "@/state/useMazeState";
import { useTexture } from "@react-three/drei";
import { useTilemapState, useGameStatusStore } from "@state/store";

export default function Wall({ id }: { id: string }) {
  const level = useGameStatusStore((state) => state.level);
  const position = useMazeState(
    (state) => state.maze.walls[id].components.position
  );
  const walls = useTexture(`assets/walls${(level - 1) % 4}.jpg`);

  return (
    <mesh position={[position.x, 0, position.y]}>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial map={walls} />
    </mesh>
  );
}
