import React from 'react';
import {useGameStatusStore} from "@state/store";
import PageTitle from '@/ui/components/PageTitle';
import MenuButtonGroup from '@/ui/common/MenuButtonGroup';

const DeathScreen: React.FC = () => {
  const game = useGameStatusStore((state) => state);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-400">
      <PageTitle>GAME OVER</PageTitle>
      
      <MenuButtonGroup
        onRestart={game.reStart}
        onMainMenu={game.reboot}
        restartLabel="JUGAR DE NUEVO"
        mainMenuLabel="MENÚ PRINCIPAL"
        className="w-64"
      />
    </div>
  );
};

export default DeathScreen;
