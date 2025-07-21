import GameScene from "@/scenes/GameScene";
import { useGameStatusStore, useTilemapState} from "@state/store";
import gameStatusValue from "@custom-types/gameStatusValue";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import MainMenu from "@ui/layout/MainMenu";
import HUD from "@ui/layout/HUD";
import LoadingScreen from "@ui/layout/LoadingScreen";
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
          className="bg-gradient-to-br from-stone-800 to-stone-600 "
          style={{ height: "100vh" }}
          onLoad={
            () =>{
              
            }
          }
        >
          <GameScene />
        </Canvas>
    </>
  ) : (
    <MainMenu />
  );
}
