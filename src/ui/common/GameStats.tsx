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
    <div className={`flex gap-6 bg-black ${className}`}>
      <div>Nivel: {level}</div>
      {currentPacDots !== undefined && totalPacDots !== undefined && (
        <div>PacDots: {`${currentPacDots}/${totalPacDots}`}</div>
      )}
      <div>Puntuación: {score}</div>
    </div>
  );
};

export default GameStats;
