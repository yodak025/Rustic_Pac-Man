'use client'

import Modal from "@/ui/common/Modal";
import MenuButtonGroup from "@/ui/common/MenuButtonGroup";
import { useGameWorldContext } from "@core/contexts/GameWorldContext";
import useAppStateStore from "@/state/useAppStateStore";

const InGameMenu = () => {
  const { resumeGame, restartGame, exitToMenu } = useGameWorldContext();
  const { goToMainMenu } = useAppStateStore();

  const handleMainMenu = () => {
    exitToMenu();
    goToMainMenu();
  };

  return (
    <Modal isOpen={true} title="PAUSE" className="w-3xl h-2/7">
      <MenuButtonGroup
        onContinue={resumeGame}
        onRestart={restartGame}
        onMainMenu={handleMainMenu}
        continueLabel="RESUME GAME"
        restartLabel="RESTART LEVEL"
        mainMenuLabel="MAIN MENU"
      />
    </Modal>
  );
};

export default InGameMenu