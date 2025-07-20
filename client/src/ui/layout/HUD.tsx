import { useGameStatusStore, usePacmanState } from '@state/store';
import gameStatusValue from '@/types/gameStatusValue';
import InGameMenu from '@ui/components/InGameMenu';
import { useEffect } from 'react';


const HUD = () => {
  const { level, score, status, setStatus } = useGameStatusStore((state) => (state));
  const { lives } = usePacmanState((state) => (state));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setStatus(gameStatusValue.PAUSED);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setStatus]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-black text-yellow-400 font-bold text-lg border-b-2 border-blue-500">
        <div className="flex items-center gap-2">
          <span>Vidas:</span>
          <div className="flex gap-1 bg-black">
            {Array.from({ length: lives }, (_, index) => (
              <span key={index} className="text-red-500">❤️</span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-6 bg-black">
          <div>Nivel: {level}</div>
          <div>Puntuación: {score.toLocaleString()}</div>
        </div>
      </div>

      {status === gameStatusValue.PAUSED && <InGameMenu />}
    </>
  );
};

export default HUD;
