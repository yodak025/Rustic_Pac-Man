'use client'

import { useState } from "react"
import { useGameHotState, usePacmanHotState, useGhostsHotState, useMazeHotState } from "@state/useHotState";
import useDebugConfigStore from "@/state/useDebugConfigStore";
import GlassPanel from "@/ui/components/GlassPanel";

export default function DebugBar() {
  const [isOpen, setIsOpen] = useState(true);
  const { debug } = useDebugConfigStore();

  const game = useGameHotState();
  const pacman = usePacmanHotState();
  const ghosts = useGhostsHotState();
  const maze = useMazeHotState();

  if (!debug) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <GlassPanel variant="heavy" insetShadow="md" showBorder={false}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2 text-left font-bold font-mono text-[var(--color-accent)] hover:text-[var(--color-text-main)] transition-organic"
        >
          🐛 DEBUG BAR {isOpen ? '▼' : '▲'}
        </button>
        
        {isOpen && (
          <div className="p-4 grid grid-cols-4 gap-4 max-h-48 overflow-y-auto text-[var(--color-text-body)] font-mono">
            {/* Game State */}
            <div>
              <h3 className="font-bold text-[var(--color-accent)] mb-2">GAME</h3>
              <p>Status: {game.status}</p>
              <p>Score: {game.score}</p>
              <p>Level: {game.level}</p>
            </div>

            {/* Pacman State */}
            <div>
              <h3 className="font-bold text-[var(--color-accent)] mb-2">PACMAN</h3>
              <p>Pos: ({pacman.position.x.toFixed(1)}, {pacman.position.y.toFixed(1)})</p>
              <p>Health: {pacman.health}</p>
              <p>Invuln: {pacman.isInvulnerable ? 'YES' : 'NO'}</p>
              <p>Dir: {pacman.direction || 'NONE'}</p>
            </div>

            {/* Maze State */}
            <div>
              <h3 className="font-bold text-[var(--color-accent)] mb-2">MAZE</h3>
              <p>Loaded: {maze.isLoaded ? 'YES' : 'NO'}</p>
              <p>Walls: {maze.walls.size}</p>
              <p>Essence: {maze.essenceDotsCollected}/{maze.essenceDotsTotal}</p>
              <p>WNBalls: {maze.whiteNoiseBalls.size}</p>
            </div>

            {/* Ghosts State */}
            <div>
              <h3 className="font-bold text-[var(--color-accent)] mb-2">GHOSTS</h3>
              <p className="text-[var(--color-alert)]">Blinky: ({ghosts.blinky.position.x}, {ghosts.blinky.position.y}) [{ghosts.blinky.mode}]</p>
              <p className="text-[#FF1493]">Pinky: ({ghosts.pinky.position.x}, {ghosts.pinky.position.y}) [{ghosts.pinky.mode}]</p>
              <p className="text-[#00CED1]">Inky: ({ghosts.inky.position.x}, {ghosts.inky.position.y}) [{ghosts.inky.mode}]</p>
              <p className="text-[var(--color-accent)]">Clyde: ({ghosts.clyde.position.x}, {ghosts.clyde.position.y}) [{ghosts.clyde.mode}]</p>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
