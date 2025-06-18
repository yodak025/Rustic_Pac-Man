import { useTilemapState } from "@state/store";

interface TileMeshProps {
  x: number;
  z: number;
}

export default function TileMesh({ x, z }: TileMeshProps) {


   const tileValue = useTilemapState((state) => state.getTile({x, y: z}));
  
  return (
    <>
      {tileValue === 2 && (
        <mesh position={[x, 0, z]}>
        <sphereGeometry args={[0.25, 30, 30]} />
        <meshStandardMaterial color="white" />
      </mesh>
      )}
      {tileValue === 1 && (
      <mesh position={[x, 0, z]}>
        <boxGeometry args={[0.95, 0.5, 0.95]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      )}
      {tileValue === 0 && (
      <mesh position={[x, 0, z]}>
        <sphereGeometry args={[0.1, 30, 30]} />
        <meshStandardMaterial color="white" />
      </mesh>
      )}
    </>
  );
}
