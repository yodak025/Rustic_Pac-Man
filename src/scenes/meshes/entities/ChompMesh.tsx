import { useRef } from 'react';
import { useGLTF } from "@react-three/drei";
import { usePacmanHotState } from "@state/useHotState";
import * as THREE from "three";
import { Direction } from "@/types/gameComponents";



/**
 * Calculate rotation based on direction
 */
function calculateRotation(direction: Direction | null): number {
  if (!direction) return 0;
  switch (direction) {
    case Direction.DOWN:
      return 0;
    case Direction.UP:
      return Math.PI;
    case Direction.RIGHT:
      return Math.PI / 2;
    case Direction.LEFT:
      return -Math.PI / 2;
    default:
      return 0;
  }
}


export default function PacmanMesh() {
  const {
    position,
    isInvulnerable,
    direction,
    agroRadius,
    visionRadius } = usePacmanHotState();
  const chompRef = useRef<THREE.Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF("/assets/models/chomp-base.glb") as any;

  // Calculate spotlight angle based on agro distance
  // The light is positioned at height h=20, and we want the light circle
  // to match the agro radius (+1 tile margin for visual feedback)
  const LIGHT_HEIGHT = 20;
  const VISUAL_MARGIN = 1;
  const agroAngle = Math.atan((agroRadius + VISUAL_MARGIN) / LIGHT_HEIGHT);
  const visionAngle = Math.atan((visionRadius + VISUAL_MARGIN) / LIGHT_HEIGHT);

  return (
    <group
      position={[position.x, 0.5, position.y]}
    >

      <spotLight
        position={[0, LIGHT_HEIGHT, 0]}
        target={chompRef.current!}
        intensity={5}
        angle={agroAngle}
        decay={0}
      />
      <spotLight
        position={[0, LIGHT_HEIGHT, 0]}
        target={chompRef.current!}
        intensity={5}
        color="blue"
        angle={visionAngle}
        decay={0}
      />
      <mesh
        ref={chompRef}
        geometry={nodes.mesh_0.geometry}
        rotation={[0, calculateRotation(direction), 0]}
        scale={0.6}
        dispose={null}
        material={nodes.mesh_0.material}
      >
        {/* Override material color when invulnerable (white) */}
        {isInvulnerable && (
          <meshStandardMaterial color="white" />
        )}
      </mesh>
    </group>
  );
}

useGLTF.preload('/assets/models/chomp-base.glb');
