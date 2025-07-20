import PacmanMesh from "@/game/meshes/entities/PacmanMesh";
import { Entity } from "../ecs/Entity";
import { EntityComponents } from "../ecs/EntityComponents";
import { EntitySystems } from "../ecs/EntitySystems";
import { Position } from "../components/Position";
import Movement from "../systems/Movement";
import { useEntitiesState } from "@state/store";
import { useEffect } from "react";


export default function Pacman() {
  const entityName = "player";
  let {x, y} = {
    x: NaN,
    y: NaN
  };
  const position = useEntitiesState(state => state.entities[entityName]?.components.position);

  useEffect(() => {
    if (position) {
      x = useEntitiesState(state => state.entities[entityName]?.components.position!.x);
      y = useEntitiesState(state => state.entities[entityName]?.components.position!.y);
    }
  }, [position]);  

  return (
    <> 
      <Entity id={entityName}>

        <EntityComponents>
          <Position x={0} y={0} />
        </EntityComponents>

        <EntitySystems>
          <Movement id={entityName} />
        </EntitySystems>

      </Entity>

      <PacmanMesh x={x} y={y} />
    </>
    
  );
}
