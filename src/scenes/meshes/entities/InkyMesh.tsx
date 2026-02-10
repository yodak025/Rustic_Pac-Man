import { useGLTF } from "@react-three/drei";
import { GhostBehaviorMode } from "@/types/gameComponents";
import { useGhostRenderState } from "@/scenes/hooks/useGhostRenderState";

export default function InkyMesh() {
  const { position, mode, rotationY, scale } = useGhostRenderState('inky');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes, materials } = useGLTF("assets/inky-model.glb") as any;

  const escapeMaterial = materials["Material.005"].clone();
  escapeMaterial.color.setHex(0x0000ff);
  const deadMaterial = materials["Material.005"].clone();
  deadMaterial.color.setHex(0x000000);

  return (
    <group position={[position.x, 0.5, position.y]} rotation={[0, rotationY, 0]} scale={scale} dispose={null}>
      <mesh
        geometry={nodes.Sphere004.geometry}
        material={materials["Material.004"]}
        position={[0.416, 0.014, 0.961]}
        scale={0.083}
      />
      <mesh
        geometry={nodes.Sphere002.geometry}
        material={materials["Material.002"]}
        position={[0.4, 0, 0.811]}
        scale={0.205}
      />
      <mesh 
        geometry={nodes.Sphere.geometry} 
        material={
          mode === GhostBehaviorMode.EATEN ? deadMaterial
          : mode === GhostBehaviorMode.FRIGHTENED ? escapeMaterial
          : materials["Material.005"]
        } 
      />
    </group>
  );
}