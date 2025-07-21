import { useTilemapState, useGameStatusStore } from "@state/store";
import gameStatusValue from "@/types/gameStatusValue";
import TileMesh from "@scenes/meshes/maze/TileMesh";
import { useEffect, useMemo, useState } from "react";
import { loadMaze } from "@/services/api";
import type { JSX } from "react";

export default function Maze() {
  const tilemap = useTilemapState((state) => state);
  const game = useGameStatusStore((state) => state);
  const [isTilemapReadyToRender, setTilemapRenderState] = useState(false);

  

  const useLoadMaze = () => {
    useEffect(() => {
      if (game.status === gameStatusValue.GENERATING_MAZE) {
        loadMaze().then((maze) => {
          if (maze) {
            tilemap.setTileMap(maze);
            setTilemapRenderState(true);
            game.setStatus(gameStatusValue.SETTING_PACMAN);
          }
        });
      }
    }, [game.status, game.setStatus]);
  };

  const tileMeshes = useMemo(() => {
    if (!isTilemapReadyToRender) return [];

    const meshes: JSX.Element[] = [];
    tilemap.forEachTile((_: number, x: number, y: number) => {
      meshes.push(<TileMesh key={`${x},${y}`} x={x} z={y} />);
    });
    return meshes;
  }, [isTilemapReadyToRender]);

  useLoadMaze();
  return tileMeshes;
}
