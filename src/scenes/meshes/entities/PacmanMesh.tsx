import { useGLTF } from "@react-three/drei";
import { usePacmanRenderState } from "@/scenes/hooks/usePacmanRenderState";

export default function PacmanMesh() {
  const { position, isInvulnerable, rotationY } = usePacmanRenderState();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF("/assets/models/chomp-base.glb") as any;

  return (
    <group
      position={[position.x, 0.5, position.y]}
      rotation={[0, rotationY, 0]}
      scale={0.6}
      dispose={null}
    >
      <mesh
        geometry={nodes.mesh_0.geometry}
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
