import { useTilemapState } from "@state/store";
import { useMemo } from "react";

interface TileMeshProps {
  x: number;
  z: number;
}

export default function TileMesh({ x, z }: TileMeshProps) {
  const {getTile} = useTilemapState((state) => state);

   const tileValue = useMemo(() => {
    return getTile(x, z);
  }, [getTile, x, z]);
  
  return (
    <>
      {tileValue === 1 && (
      <mesh position={[x, 0, z]}>
        <boxGeometry args={[0.95, 1, 0.95]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      )}
      {tileValue === 0 && (
      <mesh position={[x, 0, z]}>
        <sphereGeometry args={[0.2, 30, 30]} />
        <meshStandardMaterial color="white" />
      </mesh>
      )}
    </>
  );
}
