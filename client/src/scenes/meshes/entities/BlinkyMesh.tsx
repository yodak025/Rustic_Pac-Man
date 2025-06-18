import {useGhostsState, useTilemapState} from "@/state/store";
import { useRef } from "react";
import MovementSystem from "@core/systems/movementSystem";
import GhostBehaviourSystem from "@/core/systems/ghostBehaviourSystem";
import useGameFrame from "@core/hooks/useGameFrame";
import { usePacmanState } from "@state/store";



export default function BlinkyMesh({index}: {index:number}){
  const tilemap = useTilemapState((state) => state);
  const pacmanPosition = usePacmanState((state) => state.position);

  const {x,y: z} = useGhostsState((state) => state.ghosts[index].position);
  const setPosition = useGhostsState((state) => state.setPosition);
  const movement = useRef<MovementSystem>(new MovementSystem(5, 0.5));
  const behaviour = useRef<GhostBehaviourSystem>(new GhostBehaviourSystem());

  const getBlinkyDirections = (() => {
      behaviour.current.decideDirection(tilemap.getTile, {x, y: z}, pacmanPosition);
      return behaviour.current.directions as any;
    });

  useGameFrame((_, delta) => {
    movement.current.move(
      { x, y: z },
      (position) => setPosition(position, index),
      getBlinkyDirections(),
      delta,
      tilemap,
    );
  });

  return (
    <mesh position={[x, 0, z]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}