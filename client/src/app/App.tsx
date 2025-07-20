import GameScene from "@/game/GameScene";
import { useGameStatusStore, useTilemapState} from "@state/store";
import gameStatusValue from "@custom-types/gameStatusValue";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import MainMenu from "@ui/layout/MainMenu";
import HUD from "@ui/layout/HUD";
import LoadingScreen from "@ui/layout/LoadingScreen";

export default function App() {
  const { status: gameStatus } = useGameStatusStore((state) => state);
 //<HUD />
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
        
        <Canvas
          className="bg-gradient-to-br from-stone-800 to-stone-600 "
          style={{ height: "100vh" }}
          onCreated={() => {
        // Add event listeners for 'i' and 'o' keys
        window.addEventListener('keydown', (event) => {
          if (event.key === 'o') {
            useGameStatusStore.getState().setStatus(gameStatusValue.WON);
          } else if (event.key === 'i') {
            useTilemapState.getState().sustractPacDot();
          }
        });
          }}
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
