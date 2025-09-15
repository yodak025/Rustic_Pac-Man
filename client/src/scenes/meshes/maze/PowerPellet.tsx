
import useMazeState from "@/state/useMazeStore";

export default function PowerPellet({ id }: { id: string }) {
  const {x, y: z} = useMazeState(
    (state) => state.maze.collectables.powerPellets[id].components.position
  );

  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.3, 30, 30]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

