import React, { useEffect, useState } from 'react';
import useGameStatusStore from '@/state/useGameStatusStore';
import gameStatusValue from '@/types/gameStatusValue';
import PageTitle from '@/ui/components/PageTitle';
import ProgressBar from '@/ui/components/ProgressBar';

const LoadingScreen: React.FC = () => {
  const game = useGameStatusStore((state) => state);
  const [progress, setProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);

  useEffect(() => {
    // Determinar el progreso objetivo basado en el estado del juego
    switch (game.status) {
      case gameStatusValue.LOADING_CORE:
        setTargetProgress(33);
        break;
      case gameStatusValue.LOADING_GRAPHICS:
        setTargetProgress(66);
        break;
      case gameStatusValue.GRAPHICS_LOADED:
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
      case gameStatusValue.RESTARTING:
        return 'REINICIANDO...';
      case gameStatusValue.LOADING_CORE:
      case gameStatusValue.CORE_LOADED:
        return 'GENERANDO LABERINTO...';
      case gameStatusValue.LOADING_GRAPHICS:
        return 'CARGANDO MUNDO...';
      case gameStatusValue.GRAPHICS_LOADED:
        return 'TODO LISTO!';
      default:
        return 'CARGANDO...';
    }
  };

  return (
    <div className="fixed inset-0 z-5000 flex flex-col items-center justify-center bg-black text-yellow-400">
      <PageTitle>RUSTIC PAC-MAN</PageTitle>
      
      <div className="flex flex-col items-center space-y-6">
        <p className="text-2xl font-mono font-bold tracking-wide">
          {getLoadingText()}
        </p>
        
        <ProgressBar progress={progress} showPercentage animated />
      </div>
    </div>
  );
};

export default LoadingScreen;