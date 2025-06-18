import {useGhostsState, useTilemapState} from "@/state/store";
import { useRef } from "react";
import MovementSystem from "@core/systems/movementSystem";
import GhostBehaviourSystem from "@/core/systems/ghostBehaviourSystem";
import useGameFrame from "@core/hooks/useGameFrame";
import { usePacmanState } from "@state/store";
import pacmanStatusValue from "@/types/pacmanStatusValue";




//! ESTE COMPONENTE VIOLA DRY, ARREGLALO

export default function BlinkyMesh({index}: {index:number}){
  const tilemap = useTilemapState((state) => state);
  const pacman = usePacmanState((state) => state);

  const {x,y: z} = useGhostsState((state) => state.ghosts[index].position);
  const ghost = useGhostsState((state) => state.ghosts[index]);
  const setPosition = useGhostsState((state) => state.setPosition);
  const killGhost = useGhostsState((state) => state.killGhost);
  const movement = useRef<MovementSystem>(new MovementSystem(5, 0.5));
  const behaviour = useRef<GhostBehaviourSystem>(new GhostBehaviourSystem());

  const getBlinkyDirections = (() => {
      behaviour.current.decideDirection(tilemap.getTile, {x, y: z}, pacman);
      return behaviour.current.directions as any;
    });

  useGameFrame((_, delta) => {
    if (ghost.isDead) return; // If the ghost is dead, do not move
    movement.current.move(
      { x, y: z },
      (position) => setPosition(position, index),
      getBlinkyDirections(),
      delta,
      tilemap,
    );
    // Check if Pacman and Blinky are in the same tile
    if (Math.round(x) === Math.round(pacman.position.x) && Math.round(z) === Math.round(pacman.position.y)) {
      pacman.status === pacmanStatusValue.HUNTING
        ? killGhost(index)
        : pacman.takeDamage();
    }
  });

  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={ ghost.isDead ? "black" :pacman.status === pacmanStatusValue.HUNTING ? "blue" : "red"} />
    </mesh>
  );
}