import { usePacmanHotState } from "@state/useHotState";

export default function PacmanMesh() {
  const pacman = usePacmanHotState();
  
  return (
    <mesh position={[pacman.position.x, 0.5, pacman.position.y]}>
      <sphereGeometry args={[0.5, 32, 32]} />      
      <meshStandardMaterial color={pacman.isInvulnerable ? "white" : "yellow"} /> 
    </mesh>
  );
}
