import { useGLTF } from "@react-three/drei";
import useGhostsStore from "@/state/useGhostsStore";
import ConfigManager from "@/services/configManager";
import { GhostBehaviorMode, type Position } from "@/types/gameComponents";

import { useGraphicPositionInterpolation } from "@/scenes/hooks/useGraphicPositionInterpolation";

//! ESTE COMPONENTE VIOLA DRY, ARREGLALO

export default function InkyMesh() {
  const inkyPosition = useGhostsStore((state) => state.inky.components.position as Position);
  const inkyDirection = useGhostsStore((state) => state.inky.components.directions);
  const inkyTimer = useGhostsStore((state) => state.inky.components.movementTimer);
  const lastPosition = useGhostsStore((state) => state.inky.components.lastPosition as Position);
  
  const iPos = useGraphicPositionInterpolation(
    inkyPosition,
    inkyTimer,
    inkyDirection,
    lastPosition
  );

  const mode = useGhostsStore((state) => state.inky.components.behavior.mode);

  const isDebug = new ConfigManager().getDebugConfig().debug;

  const { x: tx, y: tz } = useGhostsStore(
    (state) => state.inky.components.behavior.target.position
  );

  const { nodes, materials } = useGLTF("assets/inky-model.glb") as any;

  const escapeMaterial = materials["Material.005"].clone();
  escapeMaterial.color.setHex(0x0000ff);
  const deadMaterial = materials["Material.005"].clone();
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
          : materials["Material.005"]
        } />
      </group>
      {isDebug && (
        <mesh position={[tx, 2.5, tz]}>
          <sphereGeometry args={[0.2, 30, 30]} />
          <meshStandardMaterial color="cyan" />
        </mesh>
      )}
    </>
  );
}
