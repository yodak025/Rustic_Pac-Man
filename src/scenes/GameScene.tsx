import { PerspectiveCamera } from "@react-three/drei";
import { useProgress } from "@react-three/drei";

import { useGameStatusStore } from "@state/store";

import PacmanMesh from "@scenes/meshes/entities/PacmanMesh";
import BlinkyMesh from "@scenes/meshes/entities/BlinkyMesh";
import ClydeMesh from "./meshes/entities/ClydeMesh";
import PinkyMesh from "./meshes/entities/PinkyMesh";
import InkyMesh from "./meshes/entities/InkyMesh";

import Maze from "./meshes/maze/Maze";
import { useEffect } from "react";
import gameStatusValue from "@/types/gameStatusValue";

export default function GameScene() {
  const { progress, active, loaded, total } = useProgress();
  const game = useGameStatusStore((state) => state);
  console.log('GameScene render - game status:', game.status, 'progress:', progress, 'loaded:', loaded, 'total:', total);

  useEffect(() => {
    if (
      game.status === gameStatusValue.CORE_LOADED &&
      loaded === total &&
      total > 0
    ) {
      game.setLoadingGraphicsStatus();
      console.log("Loading graphics...");
    }
  }, [game]);

  useEffect(() => {
    if (game.status === gameStatusValue.LOADING_GRAPHICS && progress === 100) {
      game.setGraphicsLoadedStatus();
      console.log("Graphics loaded!");
    }
  }, [active, progress, game.status]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[14, 25, 22]}
        rotation={[-Math.PI / 2.5, 0, 0]}
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
