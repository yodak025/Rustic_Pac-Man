import React from 'react';
import {useGameStatusStore} from "@state/store";

const DeathScreen: React.FC = () => {
  const game = useGameStatusStore((state) => state);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-400">
      <h1 className="text-6xl font-bold mb-8 text-yellow-400 font-mono tracking-wider text-center">
        GAME OVER
      </h1>
      
      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={game.reStart}
          className="px-8 py-4 bg-yellow-400 text-black font-mono font-bold text-xl border-4 border-yellow-400 hover:bg-black hover:text-yellow-400 transition-all duration-200 shadow-2xl shadow-yellow-400/50 uppercase tracking-wide"
        >
          JUGAR DE NUEVO
        </button>
        
        <button
          onClick={game.reboot}
          className="px-8 py-4 bg-yellow-400 text-black font-mono font-bold text-xl border-4 border-yellow-400 hover:bg-black hover:text-yellow-400 transition-all duration-200 shadow-2xl shadow-yellow-400/50 uppercase tracking-wide"
        >
          MENÚ PRINCIPAL
        </button>
      </div>
    </div>
  );
};

export default DeathScreen;
