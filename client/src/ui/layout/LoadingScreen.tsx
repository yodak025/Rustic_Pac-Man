import React, { useEffect, useState } from 'react';
import useGameStatusStore from '@/state/useGameStatusStore';
import gameStatusValue from '@/types/gameStatusValue';

const LoadingScreen: React.FC = () => {
  const game = useGameStatusStore((state) => state);
  const [progress, setProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);

  useEffect(() => {
    // Determinar el progreso objetivo basado en el estado del juego
    switch (game.status) {
      case gameStatusValue.GENERATING_MAZE:
        setTargetProgress(33);
        break;
      case gameStatusValue.SETTING_PACMAN:
        setTargetProgress(66);
        break;
      case gameStatusValue.SETTING_GHOSTS:
        setTargetProgress(100);
        break;
      default:
        setTargetProgress(0);
    }
  }, [game.status]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          // Avanza automáticamente hacia el objetivo
          const increment = targetProgress > prev + 10 ? 2 : 1;
          return Math.min(prev + increment, targetProgress);
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [targetProgress]);

  useEffect(() => {
    // Animación rápida cuando el estado cambia antes de tiempo
    if (progress < targetProgress) {
      const fastInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < targetProgress) {
            return Math.min(prev + 5, targetProgress);
          }
          clearInterval(fastInterval);
          return prev;
        });
      }, 50);
    }
  }, [targetProgress, progress]);

  const getLoadingText = () => {
    switch (game.status) {
      case gameStatusValue.GENERATING_MAZE:
        return 'GENERANDO LABERINTO...';
      case gameStatusValue.SETTING_PACMAN:
        return 'CONFIGURANDO PAC-MAN...';
      case gameStatusValue.SETTING_GHOSTS:
        return 'CONFIGURANDO FANTASMAS...';
      default:
        return 'CARGANDO...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-yellow-400">
      <h1 className="text-6xl font-bold mb-8 text-yellow-400 font-mono tracking-wider">
        RUSTIC PAC-MAN
      </h1>
      
      <div className="flex flex-col items-center space-y-6">
        <p className="text-2xl font-mono font-bold tracking-wide">
          {getLoadingText()}
        </p>
        
        <div className="w-96 h-4 bg-gray-800 border-2 border-yellow-400 relative overflow-hidden">
          <div 
            className="h-full bg-yellow-400 transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent animate-pulse" />
        </div>
        
        <p className="text-lg font-mono text-yellow-400/70">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;