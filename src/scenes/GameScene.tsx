import { PerspectiveCamera } from "@react-three/drei";

import PacmanMesh from "@scenes/meshes/entities/PacmanMesh";
import BlinkyMesh from "@scenes/meshes/entities/BlinkyMesh";
import ClydeMesh from "./meshes/entities/ClydeMesh";
import PinkyMesh from "./meshes/entities/PinkyMesh";
import InkyMesh from "./meshes/entities/InkyMesh";

import Maze from "./meshes/maze/Maze";

export default function GameScene() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[16,12,30]}
        rotation={[-Math.PI /3.5, 0, 0]}
        fov={75}
        near={0.1}
        far={1000}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <Maze />
      <PacmanMesh />
      <BlinkyMesh />
      <ClydeMesh />
      <PinkyMesh />
      <InkyMesh />

      {/* Controls for camera movement */}
      {/* <OrbitControls target={[14, 0, 19]} /> */}
    </>
  );
}
