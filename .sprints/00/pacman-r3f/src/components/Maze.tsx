// filepath: c:\Users\diego\Desktop\TFG-RusticPacman\testing_react-three-fiber\pacman-r3f\src\components\Maze.tsx
import { useMemo } from "react";
import { BufferGeometry, BoxGeometry, PlaneGeometry } from "three";

interface MazeProps {
  map: number[][];
  wallColor?: string;
  floorColor?: string;
  wallHeight?: number;
}

export default function Maze({
  map,
  wallColor = "#1e88e5", // default blue color
  floorColor = "#A2f2f2", // default grey color
  wallHeight = 0.3,
}: MazeProps) {
  // Memoize the geometries to prevent unnecessary recalculation
  const { floorGeometry, blocks } = useMemo(() => {
    if (!map.length) return { floorGeometry: null, blocks: [] };

    // Calculate overall dimensions of the maze
    const rows = map.length;
    const cols = map[0].length;
    
    // Create floor
    const floorGeometry = new PlaneGeometry(cols, rows);
    
    // Create blocks where map value is 1
    const blocks: { position: [number, number, number]; geometry: BufferGeometry }[] = [];
    const blockGeometry = new BoxGeometry(1, wallHeight, 1);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        console.log(` Processing cell at row: ${row}, col: ${col}`);
        if (map[row][col] === 1) {
          blocks.push({
            position: [
              col  + 0.5,  // Center the maze: x position
              wallHeight / 2,        // Half the height to sit on the floor
              row + 0.5,  // Center the maze: z position
            ],
            geometry: blockGeometry,
          });
        }
      }
    }
    
    return { floorGeometry, blocks };
  }, [map, wallHeight]);

  if (!floorGeometry) return null;
  
  return (
    <group>
      {/* Floor */}
      <mesh 
        position={[map[0].length /2, 0, map.length /2]} 
        rotation={[-Math.PI / 2, 0, 0]} // Rotate to horizontal
      >
        <primitive object={floorGeometry} attach="geometry" />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Walls */}
      {blocks.map((block, index) => (
        <mesh key={index} position={block.position}>
          <primitive object={block.geometry} attach="geometry" />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      ))}
    </group>
  );
}