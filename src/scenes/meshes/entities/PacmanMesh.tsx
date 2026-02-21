import { useRef } from 'react';
import { useGLTF } from "@react-three/drei";
import { usePacmanRenderState } from "@/scenes/hooks/usePacmanRenderState";
import * as THREE from "three";

export default function PacmanMesh() {
  const { position, isInvulnerable, rotationY } = usePacmanRenderState();
  const chompRef = useRef<THREE.Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF("/assets/models/chomp-base.glb") as any;

  return (
    <group
      position={[position.x, 0.5, position.y]}
    >

      <spotLight
        position={[0, 20, 0]}
        target={chompRef.current!}
        intensity={5}
        angle={Math.PI / 16}
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
