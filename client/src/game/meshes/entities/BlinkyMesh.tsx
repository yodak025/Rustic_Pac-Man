import { useGhostsState, useTilemapState } from "@/state/store";
import { useRef } from "react";
import MovementSystem from "@/game/core/systems/movementSystem";
import GhostBehaviorSystem from "@/game/core/systems/ghostBehaviorSystem";
import useGameFrame from "@/game/core/hooks/useGameFrame";
import { usePacmanState } from "@state/store";
import pacmanStatusValue from "@/types/pacmanStatusValue";
import { useGLTF } from "@react-three/drei";

//! ESTE COMPONENTE VIOLA DRY, ARREGLALO

export default function BlinkyMesh({ index }: { index: number }) {
  const tilemap = useTilemapState((state) => state);
  const pacman = usePacmanState((state) => state);

  const { x, y: z } = useGhostsState((state) => state.ghosts[index].position);
  const ghost = useGhostsState((state) => state.ghosts[index]);
  const setPosition = useGhostsState((state) => state.setPosition);
  const killGhost = useGhostsState((state) => state.killGhost);
  const movement = useRef<MovementSystem>(new MovementSystem(5, 0.5));
  const behaviour = useRef<GhostBehaviorSystem>(new GhostBehaviorSystem());
  const rotation = useRef<[x:number, y:number, z:number]>([0, 0, 0]);

  const getBlinkyDirections = () => {
    behaviour.current.decideDirection(tilemap, { x, y: z }, pacman);
    const dirs = behaviour.current.directions;
    if (dirs.left) rotation.current = [0, -Math.PI / 2, 0];
    if (dirs.right) rotation.current = [0, Math.PI / 2, 0];
    if (dirs.forward) rotation.current = [0, Math.PI, 0];
    if (dirs.backward) rotation.current = [0, 0, 0];
    return dirs as any;
  };

  useGameFrame((_, delta) => {
    if (ghost.isDead) return; // If the ghost is dead, do not move
    movement.current.move(
      { x, y: z },
      (position) => setPosition(position, index),
      getBlinkyDirections(),
      delta,
      tilemap
    );
    // Check if Pacman and Blinky are in the same tile
    if (
      Math.round(x) === Math.round(pacman.position.x) &&
      Math.round(z) === Math.round(pacman.position.y)
    ) {
      if (pacman.status === pacmanStatusValue.HUNTING) {
        // If Pacman is hunting, kill the ghost
        killGhost(index);
        pacman.addLive(); // Increment Pacman's lives
      } else {
        pacman.takeDamage();
      }
    }
  });

  const { nodes, materials } = useGLTF("assets/blinky-model.glb") as any;

  const escapeMaterial = materials.Material.clone();
  escapeMaterial.color.setHex(0x0000ee);
  const deadMaterial = materials.Material.clone();
  deadMaterial.color.setHex(0x000000);

  return (
    <group position={[x, 0.5, z]} scale={0.5} rotation={rotation.current} dispose={null}>
      <mesh
        geometry={nodes.Sphere004.geometry}
        material= {materials["Material.004"]}
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
          ghost.isDead
            ? deadMaterial
            : pacman.status === pacmanStatusValue.HUNTING
              ? escapeMaterial
              : materials.Material
        } />
    </group>
  );
}
