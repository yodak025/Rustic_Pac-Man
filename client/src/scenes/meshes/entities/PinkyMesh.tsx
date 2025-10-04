import { useGLTF } from "@react-three/drei";
import useGhostsStore from "@/state/useGhostsStore";
import ConfigManager from "@/services/configManager";
import { GhostBehaviorMode, type Position } from "@/types/gameComponents";

import { useGraphicPositionInterpolation } from "@/scenes/hooks/useGraphicPositionInterpolation";

//! ESTE COMPONENTE VIOLA DRY, ARREGLALO

export default function PinkyMesh() {
  const pinkyPosition = useGhostsStore((state) => state.pinky.components.position as Position);
  const pinkyDirection = useGhostsStore((state) => state.pinky.components.directions);
  const pinkyTimer = useGhostsStore((state) => state.pinky.components.movementTimer);
  const lastPosition = useGhostsStore((state) => state.pinky.components.lastPosition as Position);
  
  const iPos = useGraphicPositionInterpolation(
    pinkyPosition,
    pinkyTimer,
    pinkyDirection,
    lastPosition
  );

  const mode = useGhostsStore((state) => state.pinky.components.behavior.mode);

  const isDebug = new ConfigManager().getDebugConfig().debug;

  const { x: tx, y: tz } = useGhostsStore(
    (state) => state.pinky.components.behavior.target.position
  );

  const { nodes, materials } = useGLTF("assets/pinky-model.glb") as any;

  const escapeMaterial = materials["Material.005"].clone();
  escapeMaterial.color.setHex(0x0000ff);
  const deadMaterial = materials["Material.005"].clone();
  deadMaterial.color.setHex(0x000000);

  return (
    <>
      <group position={[iPos.x, 0, iPos.y]} scale={0.5} dispose={null}>
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
      {isDebug && (
        <mesh position={[tx, 2, tz]}>
          <sphereGeometry args={[0.2, 30, 30]} />
          <meshStandardMaterial color="pink" />
        </mesh>
      )}
      
    </>
  );
}
