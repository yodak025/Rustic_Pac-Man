import GameScene from "@/scenes/GameScene";
import { useGameStatusStore} from "@state/store";
import gameStatusValue from "@custom-types/gameStatusValue";
import { Canvas } from "@react-three/fiber";
import MainMenu from "@ui/layout/MainMenu";
import HUD from "@ui/layout/HUD";
import { RusticGameEngine } from "@/core/engine";
import { useEffect } from "react";

export default function App() {
  const { status: gameStatus } = useGameStatusStore((state) => state);

  useEffect(() => {
    let engine = new RusticGameEngine
    engine.start() 
  }, [])
  

  return gameStatus !== gameStatusValue.NOT_STARTED ? (
    <>

        <HUD />
        <Canvas
          className="bg-gradient-to-b from-stone-300 to-stone-800 "
          style={{ height: "100vh" }}
        >
          <GameScene />
        </Canvas>
    </>
  ) : (
    <MainMenu />
  );
}
