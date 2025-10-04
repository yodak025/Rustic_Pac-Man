import { useGLTF } from "@react-three/drei";
import useGhostsStore from "@/state/useGhostsStore";
import ConfigManager from "@/services/configManager";
import { GhostBehaviorMode, type Position } from "@/types/gameComponents";

import { useGraphicPositionInterpolation } from "@/scenes/hooks/useGraphicPositionInterpolation";

//! ESTE COMPONENTE VIOLA DRY, ARREGLALO

export default function BlinkyMesh() {
  const blinkyPosition = useGhostsStore((state) => state.blinky.components.position as Position);
  const blinkyDirection = useGhostsStore((state) => state.blinky.components.directions);
  const blinkyTimer = useGhostsStore((state) => state.blinky.components.movementTimer);
  const lastPosition = useGhostsStore((state) => state.blinky.components.lastPosition as Position);
  
  const iPos = useGraphicPositionInterpolation(
    blinkyPosition,
    blinkyTimer,
    blinkyDirection,
    lastPosition
  );

  const mode = useGhostsStore((state) => state.blinky.components.behavior.mode);

  const isDebug = new ConfigManager().getDebugConfig().debug;

  const { x: tx, y: tz } = useGhostsStore(
    (state) => state.blinky.components.behavior.target.position
  );
  console.log(tx, tz);

  const { nodes, materials } = useGLTF("assets/blinky-model.glb") as any;

  const escapeMaterial = materials.Material.clone();
  escapeMaterial.color.setHex(0x0000ff);
  const deadMaterial = materials.Material.clone();
  deadMaterial.color.setHex(0x000000);

  return (
    <>
      <group position={[iPos.x, 0, iPos.y]} scale={0.5} dispose={null}>
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

        <mesh geometry={nodes.Sphere.geometry} material={
          mode === GhostBehaviorMode.EATEN ? deadMaterial
          : mode === GhostBehaviorMode.FRIGHTENED ? escapeMaterial
          : materials.Material
        } />
      </group>
      {isDebug && (
        <mesh position={[tx, 1.5, tz]}>
          <sphereGeometry args={[0.2, 30, 30]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </>
  );
}
