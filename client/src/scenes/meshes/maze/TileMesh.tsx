import { useTexture } from "@react-three/drei";
import { useTilemapState, useGameStatusStore } from "@state/store";


interface TileMeshProps {
  x: number;
  z: number;
}

export default function TileMesh({ x, z }: TileMeshProps) {
  const level = useGameStatusStore((state) => state.level);
  const tileValue = useTilemapState((state) => state.getTile({ x, y: z }));
  const floor = useTexture(`assets/floor${(level- 1)%4}.jpg`);
  const walls = useTexture(`assets/walls${(level- 1)%4}.jpg`);

  return (
    <>
      {tileValue !== ( 1 && -2) && (
        <group position={[x, 0, z]}>
          <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial map={floor} />
            </mesh>
          {tileValue === 0 && (
            <mesh>
              <sphereGeometry args={[0.1, 30, 30]} />
              <meshStandardMaterial color="white" />
            </mesh>
          )}
          {tileValue === 2 && (
            <mesh>
              <sphereGeometry args={[0.25, 30, 30]} />
              <meshStandardMaterial color="white" />
            </mesh>
          )}
        </group>
      )}
      {tileValue === 1 && (
        <mesh position={[x, 0, z]}>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshStandardMaterial map={walls} />
        </mesh>
      )}
    </>
  );
}
