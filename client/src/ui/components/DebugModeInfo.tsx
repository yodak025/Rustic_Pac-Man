import React from 'react';
import { 

useGameStatusStore, 
useTilemapState, 
usePacmanState, 
useGhostsState 
} from '@state/store';

interface DebugModeInfoProps {
isOpen: boolean;
onClose: () => void;
}

const DebugModeInfo: React.FC<DebugModeInfoProps> = ({ isOpen, onClose }) => {
const gameStatus = useGameStatusStore();
const tilemap = useTilemapState();
const pacman = usePacmanState();
const ghosts = useGhostsState();

if (!isOpen) return null;

const formatValue = (value: any): string => {
  if (typeof value === 'function') return 'function()';
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

return (
    <div className="fixed top-10 left-0 bottom-0 z-50 w-1/3 text-green-400 font-mono text-xs overflow-y-auto p-4 border-r border-green-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Debug State Info</h2>
        <button 
        onClick={onClose}
        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
        >
        Close
        </button>
      </div>

    <div className="space-y-6">
      <section>
        <h3 className="text-white text-md font-bold mb-2 border-b border-green-500">Game Status</h3>
        <pre className="whitespace-pre-wrap">
          {Object.entries(gameStatus).map(([key, value]) => (
            typeof value !== 'function' && (
              <div key={key} className="mb-1">
                <span className="text-yellow-400">{key}: </span>
                {formatValue(value)}
              </div>
            )
          ))}
        </pre>
      </section>

      <section>
        <h3 className="text-white text-md font-bold mb-2 border-b border-green-500">Pacman State</h3>
        <pre className="whitespace-pre-wrap">
          {Object.entries(pacman).map(([key, value]) => (
            typeof value !== 'function' && (
              <div key={key} className="mb-1">
                <span className="text-yellow-400">{key}: </span>
                {formatValue(value)}
              </div>
            )
          ))}
        </pre>
      </section>

      <section>
        <h3 className="text-white text-md font-bold mb-2 border-b border-green-500">Ghosts State</h3>
        <pre className="whitespace-pre-wrap">
          <div className="mb-1">
            <span className="text-yellow-400">ghosts count: </span>
            {ghosts.ghosts.length}
          </div>
          {ghosts.ghosts.map((ghost, index) => (
            <div key={index} className="pl-4 mb-2 border-l-2 border-blue-500">
              <div><span className="text-yellow-400">Ghost {index}:</span></div>
              <div className="pl-4">
                <div><span className="text-yellow-400">type: </span>{ghost.type}</div>
                <div><span className="text-yellow-400">position: </span>{`{x: ${ghost.position.x}, y: ${ghost.position.y}}`}</div>
                <div><span className="text-yellow-400">isDead: </span>{String(ghost.isDead)}</div>
              </div>
            </div>
          ))}
        </pre>
      </section>

      <section>
        <h3 className="text-white text-md font-bold mb-2 border-b border-green-500">Tilemap Info</h3>
        <pre className="whitespace-pre-wrap">
          <div className="mb-1"><span className="text-yellow-400">width: </span>{tilemap.width}</div>
          <div className="mb-1"><span className="text-yellow-400">height: </span>{tilemap.height}</div>
          <div className="mb-1"><span className="text-yellow-400">pacDots remaining: </span>{tilemap.pacDots}</div>
          <div className="mb-1"><span className="text-yellow-400">tiles count: </span>{Object.keys(tilemap.tiles).length}</div>
        </pre>
      </section>
    </div>
  </div>
);
};

export default DebugModeInfo;