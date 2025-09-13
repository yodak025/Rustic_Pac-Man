import { useGLTF } from "@react-three/drei";
import useGhostsStore from "@/state/useGhostsStore";

//! ESTE COMPONENTE VIOLA DRY, ARREGLALO

export default function PinkyMesh() {
  const {x, y: z} = useGhostsStore((state) => state.pinky.components.position);
  const { x: tx, y: tz } = useGhostsStore(
    (state) => state.pinky.components.behavior.target.position
  );

  const { nodes, materials } = useGLTF("assets/pinky-model.glb") as any;

  const escapeMaterial = materials["Material.003"].clone();
  escapeMaterial.color.setHex(0x0000ff);
  const deadMaterial = materials["Material.003"].clone();
  deadMaterial.color.setHex(0x000000);

  return (
    <>
      <group position={[x, 0, z]} scale={0.5} dispose={null}>
        <mesh geometry={nodes.Sphere.geometry} material={materials['Material.005']} />
        <mesh geometry={nodes.Sphere001.geometry} material={materials['Material.001']} position={[-0.373, 0, 0.811]} scale={0.205} />
        <mesh geometry={nodes.Sphere003.geometry} material={materials['Material.003']} position={[-0.399, 0, 0.961]} scale={0.083} />
      </group>
      <mesh position={[tx, 2, tz]}>
        <sphereGeometry args={[0.2, 30, 30]} />
        <meshStandardMaterial color="pink" />
      </mesh>
    </>
  );
}
