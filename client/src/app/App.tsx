import GameScene from "@/scenes/GameScene";
import { useGameStatusStore } from "@state/store";
import gameStatusValue from "@custom-types/gameStatusValue";
import { Canvas } from "@react-three/fiber";
import MainMenu from "@ui/layout/MainMenu";
import MazeTilemapAnalyzer from "@/ui/layout/MazeTilemapAnalyzer";
import DeathScreen from "@ui/layout/DeathScreen";
import HUD from "@ui/layout/HUD";
import LoadingScreen from "@/ui/layout/LoadingScreen";
import { Suspense, useMemo } from "react";

export default function App() {
  const { status: gameStatus } = useGameStatusStore((state) => state);

  // TODO - Esto no funciona guapisimo, pero creo que me agradecerás que te ceda esta parte y me ocupe de lograr una versión funcional.
  // Tu tarea es leerte bien la documentación de React y React Three Fiber para entender cómo se hacen estas cosas. Estudia.
  const sceneLayout = useMemo(() => {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <HUD />
        <Canvas
          className="bg-gradient-to-b from-stone-300 to-stone-800 z-0"
          style={{ height: "100vh" }}
        >
          <Suspense>
            <GameScene />
          </Suspense>
        </Canvas>
      </Suspense>
    );
  }, []);

  switch (gameStatus) {
    // Main menu cases
    case gameStatusValue.NOT_STARTED:
      return <MainMenu />;

    case gameStatusValue.DEBUG_MAZE_ANALYZER:
      return <MazeTilemapAnalyzer />;

    // Loading screen cases
    case gameStatusValue.READY_TO_LOAD:
    case gameStatusValue.LOADING_CORE:
    case gameStatusValue.WON: // Provisional, should have its own screen later
    case gameStatusValue.RESTARTING:
      return <LoadingScreen />;

    case gameStatusValue.PLAYING:
    case gameStatusValue.PAUSED:
    case gameStatusValue.CORE_LOADED:
    case gameStatusValue.LOADING_GRAPHICS:
    case gameStatusValue.GRAPHICS_LOADED:
      return sceneLayout;

    case gameStatusValue.LOST:
      return <DeathScreen />; 

    default:
      throw new Error(`Unknown game status: ${gameStatus}`);
  }
}
