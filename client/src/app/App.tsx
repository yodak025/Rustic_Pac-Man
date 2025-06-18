import GameScene from "@/scenes/GameScene";
import { useGameStatusStore } from "@state/store";
import gameStatusValue from "@custom-types/gameStatusValue";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import MainMenu from "@ui/layout/MainMenu";
import HUD from "@ui/layout/HUD";
import LoadingScreen from "@ui/layout/LoadingScreen";

export default function App() {
  const { status: gameStatus } = useGameStatusStore((state) => state);

  return gameStatus !== gameStatusValue.NOT_STARTED ? (
    <>
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w"] },
          { name: "backward", keys: ["ArrowDown", "s"] },
          { name: "left", keys: ["ArrowLeft", "a"] },
          { name: "right", keys: ["ArrowRight", "d"] },
        ]}
      >
        <HUD />
        <Canvas
          className="bg-gradient-to-br from-stone-800 to-stone-600 "
          style={{ height: "100vh" }}
        >
          <GameScene />
        </Canvas>
      </KeyboardControls>
      {(gameStatus === gameStatusValue.GENERATING_MAZE ||
        gameStatus === gameStatusValue.SETTING_PACMAN ||
        gameStatus === gameStatusValue.SETTING_GHOSTS) && <LoadingScreen />}
    </>
  ) : (
    <MainMenu />
  );
}
