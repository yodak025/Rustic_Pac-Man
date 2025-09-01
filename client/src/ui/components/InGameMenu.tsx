import {useGameStatusStore} from "@state/store";

const InGameMenu = () => {
  const game = useGameStatusStore((state) => state);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-black border-4 border-yellow-400 p-8 rounded-lg shadow-2xl shadow-yellow-400/50">
        <h2 className="text-4xl font-bold text-yellow-400 font-mono text-center mb-8 tracking-wider">
          PAUSA
        </h2>
        
        <div className="flex flex-col gap-4 w-64">
          <button
            onClick={game.setPlayingStatus}
            className="px-6 py-3 bg-yellow-400 text-black font-mono font-bold text-lg border-2 border-yellow-400 hover:bg-black hover:text-yellow-400 transition-all duration-200 uppercase tracking-wide"
          >
            SEGUIR JUGANDO
          </button>
          
          <button
            onClick={game.reStart}
            className="px-6 py-3 bg-yellow-400 text-black font-mono font-bold text-lg border-2 border-yellow-400 hover:bg-black hover:text-yellow-400 transition-all duration-200 uppercase tracking-wide"
          >
            REINICIAR PARTIDA
          </button>
          
          <button
            onClick={game.reboot}
            className="px-6 py-3 bg-yellow-400 text-black font-mono font-bold text-lg border-2 border-yellow-400 hover:bg-black hover:text-yellow-400 transition-all duration-200 uppercase tracking-wide"
          >
            MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};

export default InGameMenu