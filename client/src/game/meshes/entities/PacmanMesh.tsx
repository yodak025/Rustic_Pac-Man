import pacmanStatusValue from "@/types/pacmanStatusValue";

export default function PacmanMesh({x, y}: {x: number, y: number}) {
  let status = pacmanStatusValue.COMMON;
  return (
    <mesh position={[x, 0, y]}>
      <sphereGeometry args={[0.5, 32, 32]} />      
        <meshStandardMaterial color={status === pacmanStatusValue.INVINCIBLE ? "orange" : "yellow"} />
    </mesh>
  );
}
