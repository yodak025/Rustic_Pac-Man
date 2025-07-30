
import useMazeState from "@/state/useMazeStore";
import { useTexture } from "@react-three/drei";
import { useGameStatusStore } from "@state/store";

export default function PacDot({ id }: { id: string }) {
  const level = useGameStatusStore((state) => state.level);
  const floor = useTexture(`assets/floor${(level- 1)%4}.jpg`);
  const {x, y: z} = useMazeState(
    (state) => state.maze.collectables.pacDots[id].components.position
  );

  return (
    <group position={[x, 0, z]}>
          <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial map={floor} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.1, 30, 30]} />
              <meshStandardMaterial color="white" />
            </mesh>
        </group>
  );
}

