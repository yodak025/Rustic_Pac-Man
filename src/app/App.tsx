import GameScene from "@/scenes/GameScene";
import { useGameStatusStore } from "@state/store";
import gameStatusValue from "@custom-types/gameStatusValue";
import { Canvas } from "@react-three/fiber";
import MainMenu from "@/ui/pages/MainMenu";
import MazeTilemapAnalyzer from "@/ui/pages/MazeTilemapAnalyzer";
import DebugSettings from "@/ui/pages/DebugSettings";
import DeathScreen from "@/ui/pages/DeathScreen";
import TutorialPage from "@/ui/pages/TutorialPage";
import HUD from "@ui/layout/HUD";
import LoadingScreen from "@/ui/common/LoadingScreen";
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
          className="z-0"
          style={{ 
            height: "100vh",
            background: "var(--color-background)"
          }}
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

    case gameStatusValue.DEBUG_SETTINGS:
      return <DebugSettings />;

    case gameStatusValue.TUTORIAL:
      return <TutorialPage />;
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
