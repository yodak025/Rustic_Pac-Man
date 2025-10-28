import React from 'react';

export interface GameStatsProps {
  level: number;
  score: number;
  currentPacDots?: number;
  totalPacDots?: number;
  className?: string;
}

const GameStats: React.FC<GameStatsProps> = ({
  level,
  score,
  currentPacDots,
  totalPacDots,
  className = ''
}) => {
  return (
    <div className={`flex gap-6 p-2 rounded-md border-2 border-[var(--color-accent)] bg-[var(--color-background)] shadow-lg shadow-[var(--color-accent)]/30 text-[var(--color-text-light)] font-mono text-lg ${className}`}>      <div>Nivel: {level}</div>
      {currentPacDots !== undefined && totalPacDots !== undefined && (
        <div>PacDots: {`${currentPacDots}/${totalPacDots}`}</div>
      )}
      <div>Puntuación: {score}</div>
    </div>
  );
};

export default GameStats;
