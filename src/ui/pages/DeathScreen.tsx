'use client'

import React from 'react';
import Modal from "@/ui/common/Modal";
import MenuButtonGroup from "@/ui/common/MenuButtonGroup";
import { useGameWorldContext } from "@core/contexts/GameWorldContext";
import useAppStateStore from "@/state/useAppStateStore";

const DeathScreen: React.FC = () => {
  const { startRestartLevel, exitToMenu } = useGameWorldContext();
  const { goToMainMenu } = useAppStateStore();

  const handleMainMenu = () => {
    exitToMenu();
    goToMainMenu();
  };

  return (
    <Modal isOpen={true} title="GAME OVER" className="w-3xl h-2/7">
      <MenuButtonGroup
        onRestart={startRestartLevel}
        onMainMenu={handleMainMenu}
        restartLabel="RESTART"
        mainMenuLabel="MAIN MENU"
      />
    </Modal>
  );
};

export default DeathScreen;
