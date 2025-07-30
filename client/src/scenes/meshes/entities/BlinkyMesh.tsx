import { useGLTF } from "@react-three/drei";
import useGhostsStore from "@/state/useGhostsStore";

//! ESTE COMPONENTE VIOLA DRY, ARREGLALO

export default function BlinkyMesh() {
  const {x, y: z} = useGhostsStore((state) => state.blinky.components.position);

  const { nodes, materials } = useGLTF("assets/blinky-model.glb") as any;

  const escapeMaterial = materials.Material.clone();
  escapeMaterial.color.setHex(0x0000ff);
  const deadMaterial = materials.Material.clone();
  deadMaterial.color.setHex(0x000000);

  return (
    <group position={[x, 0, z]} scale={0.5} dispose={null}>
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
      <mesh geometry={nodes.Sphere.geometry} material={materials.Material} />
    </group>
  );
}
