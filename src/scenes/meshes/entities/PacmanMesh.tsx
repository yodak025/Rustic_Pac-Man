import { useRef } from 'react';
import { useGLTF } from "@react-three/drei";
import { usePacmanRenderState } from "@/scenes/hooks/usePacmanRenderState";
import * as THREE from "three";
import { SINUSOID_CONFIG } from '@config/echoConfig';

export default function PacmanMesh() {
  const { position, isInvulnerable, rotationY } = usePacmanRenderState();
  const chompRef = useRef<THREE.Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF("/assets/models/chomp-base.glb") as any;

  // Calculate spotlight angle based on agro distance
  // The light is positioned at height h=20, and we want the light circle
  // to match the agro radius (+1 tile margin for visual feedback)
  const LIGHT_HEIGHT = 20;
  const VISUAL_MARGIN = 1;
  const desiredRadius = SINUSOID_CONFIG.AGRO_TRIGGER_DISTANCE + VISUAL_MARGIN;
  const spotlightAngle = Math.atan(desiredRadius / LIGHT_HEIGHT);

  return (
    <group
      position={[position.x, 0.5, position.y]}
    >

      <spotLight
        position={[0, LIGHT_HEIGHT, 0]}
        target={chompRef.current!}
        intensity={5}
        angle={spotlightAngle}
        decay={0}
      />
      <mesh
        ref={chompRef}
        geometry={nodes.mesh_0.geometry}
        rotation={[0, rotationY, 0]}
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
