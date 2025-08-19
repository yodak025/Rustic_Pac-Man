import {useGameStatusStore} from "@state/store";
import gameStatusValue from '@/types/gameStatusValue';

const InGameMenu = () => {
  const game = useGameStatusStore((state) => state);
  //# const pacman = usePacmanState((state) => state);
  //# const tilemap = useTilemapState((state) => state);
  //# const ghosts = useGhostsState((state) => state);
  const reStart = () => {
    game.reStart()
    //# pacman.reStart();
    //# tilemap.reStart();
    //# ghosts.reStart();
  }

  const handleContinue = () => {
    game.setPlayingStatus();
  };

  const handleRestart = () => {
    console.log("\n \n\n\n\n\n\n\n\n\n\n");
    console.log("Hola, Diego del futuro!");
    console.log("Verdad que te habías olvidado de mí?");
    console.log("Espero que estés disfrutando de tu día.");
    console.log("....");
    console.log("El reset lleva roto desde el sprint 1.");
    console.log("igual va siendo hora de arreglarlo, no?");
    console.log("\n \n\n\n\n\n\n\n\n\n\n");
    game.setRestartingStatus();
    // Reset all game entities
    reStart();
    game.setStatus(gameStatusValue.NOT_STARTED);
    //!!! CHAPUZA DE CONCURRENCIA EXTREMA
    //!!! REVISAR
    setTimeout(() => {
      game.setStatus(gameStatusValue.GENERATING_MAZE);
    }, 1); // Delay to ensure the game state is reset properly
    
  };

  const handleMainMenu = () => {
    reStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-black border-4 border-yellow-400 p-8 rounded-lg shadow-2xl shadow-yellow-400/50">
        <h2 className="text-4xl font-bold text-yellow-400 font-mono text-center mb-8 tracking-wider">
          PAUSA
        </h2>
        
        <div className="flex flex-col gap-4 w-64">
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-yellow-400 text-black font-mono font-bold text-lg border-2 border-yellow-400 hover:bg-black hover:text-yellow-400 transition-all duration-200 uppercase tracking-wide"
          >
            SEGUIR JUGANDO
          </button>
          
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-yellow-400 text-black font-mono font-bold text-lg border-2 border-yellow-400 hover:bg-black hover:text-yellow-400 transition-all duration-200 uppercase tracking-wide"
          >
            REINICIAR PARTIDA
          </button>
          
          <button
            onClick={handleMainMenu}
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