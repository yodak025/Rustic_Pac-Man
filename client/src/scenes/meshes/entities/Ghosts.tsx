import {
  useTilemapState,
  useGameStatusStore,
  useGhostsState,
} from "@state/store";
import gameStatusValue from "@/types/gameStatusValue";
import ghostName from "@/types/ghostName";
import type { JSX } from "react";
import BlinkyMesh from "@scenes/meshes/entities/BlinkyMesh";
import { useEffect, useMemo, useState } from "react";

export default function Ghosts() {
  const [isGhostsReadyToRender, setGhostsRenderState] = useState(false);

  const tilemap = useTilemapState((state) => state);
  const game = useGameStatusStore((state) => state);
  const { ghosts, addGhost, setPosition } = useGhostsState((state) => state);

  const useInitGhosts = () => {
    useEffect(() => {
      if (game.status !== gameStatusValue.SETTING_GHOSTS){
        if (game.status === gameStatusValue.NOT_STARTED) setGhostsRenderState(false);
        return;
      } ;
      const position = tilemap.getRandomTileCoords(0);
      setPosition(position, 0);
      addGhost({ position, type: ghostName.BLINKY });
      setGhostsRenderState(true);
      game.setStatus(gameStatusValue.PLAYING);
    }, [game.status]);
  };

  const ghostMeshes = useMemo(() => {
    let meshes: JSX.Element[] = [];
    if (!isGhostsReadyToRender) meshes = [];
    else {
      ghosts.forEach((ghost, index) => {
        if (ghost.type === ghostName.BLINKY) {
          meshes.push(<BlinkyMesh key={index} index={index} />);
        }
        // Add other ghost types here as needed
      });
    }


    return meshes;
  }, [isGhostsReadyToRender]);

  useInitGhosts();
  return ghostMeshes;
}
