import { Canvas } from "@react-three/fiber";
import { OrbitControls} from "@react-three/drei";
import TileMesh from "./meshes/maze/TileMesh";

export default function GameScene() {
  return (
    <Canvas className="bg-gradient-to-br from-stone-600 to-stone-300 " style={{ height: "60vh" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      <TileMesh x={0} z={0} />
      <TileMesh x={4} z={0} />
      <TileMesh x={2} z={1} />
      <TileMesh x={1} z={3} />
      
      <OrbitControls />
    </Canvas>
  );
}