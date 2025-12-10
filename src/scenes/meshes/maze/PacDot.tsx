
import useMazeState from "@/state/useMazeStore";

export default function PacDot({ id }: { id: string }) {
  const {x, y: z} = useMazeState(
    (state) => state.maze.collectables.pacDots[id].components.position
  );
  const isCollected = useMazeState(
    (state) => !state.maze.collectables.pacDots[id].components.collectable.value
  );

  if (isCollected) {
    return null;
  }
  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.1, 30, 30]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

