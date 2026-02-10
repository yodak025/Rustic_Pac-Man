import { useGLTF } from "@react-three/drei";
import { GhostBehaviorMode } from "@/types/gameComponents";
import { useGhostRenderState } from "@/scenes/hooks/useGhostRenderState";

export default function PinkyMesh() {
  const { position, mode, rotationY, scale } = useGhostRenderState('pinky');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes, materials } = useGLTF("assets/pinky-model.glb") as any;

  const escapeMaterial = materials["Material.005"].clone();
  escapeMaterial.color.setHex(0x0000ff);
  const deadMaterial = materials["Material.005"].clone();
  deadMaterial.color.setHex(0x000000);

  return (
    <group position={[position.x, 0.5, position.y]} rotation={[0, rotationY, 0]} scale={scale} dispose={null}>
      <mesh
        geometry={nodes.Sphere.geometry}
        material={
          mode === GhostBehaviorMode.EATEN ? deadMaterial
          : mode === GhostBehaviorMode.FRIGHTENED ? escapeMaterial
          : materials["Material.005"]}
      />
      <mesh
        geometry={nodes.Sphere001.geometry}
        material={materials["Material.001"]}
        position={[-0.373, 0, 0.811]}
        scale={0.205}
      />
      <mesh
        geometry={nodes.Sphere003.geometry}
        material={materials["Material.003"]}
        position={[-0.399, 0, 0.961]}
        scale={0.083}
      />
    </group>
  );
}