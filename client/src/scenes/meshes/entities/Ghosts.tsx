import { useTilemapState } from "@state/store";
import ghostName from "@/types/ghostName";
import type { JSX } from "react";
import BlinkyMesh from "@scenes/meshes/entities/BlinkyMesh";
import { useMemo } from "react";

export default function Ghosts() {
  const tilemap = useTilemapState((state) => state);
  
  const ghostMeshes = useMemo(() => {
    const meshes: JSX.Element[] = [];
    
    // Get two valid positions from the tilemap
    const position1 = tilemap.getRandomTileCoords(0);
    const position2 = tilemap.getRandomTileCoords(0);
    
    // Add two Blinky meshes at those positions
    if (position1) {
      meshes.push(<BlinkyMesh key={0} index={0} position={position1} />);
    }
    
    if (position2) {
      meshes.push(<BlinkyMesh key={1} index={1} position={position2} />);
    }
    
    return meshes;
  }, [tilemap]);

  return ghostMeshes;
}
