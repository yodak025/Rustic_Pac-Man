import useGameState from "@state/store";

interface TileMeshProps {
  x: number;
  z: number;
}

export default function TileMesh({ x, z }: TileMeshProps) {
  const { tileMap } = useGameState((state) => state);
  return (
    <>
      {tileMap?.get(x, z) === 1 && (
      <mesh position={[x, 0, z]}>
        <boxGeometry args={[0.95, 1, 0.95]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      )}
      {tileMap?.get(x, z) === 0 && (
      <mesh position={[x, 0, z]}>
        <sphereGeometry args={[0.2, 30, 30]} />
        <meshStandardMaterial color="white" />
      </mesh>
      )}
    </>
  );
}
