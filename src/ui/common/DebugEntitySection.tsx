import React from 'react';
import DebugDetails from '@/ui/components/DebugDetails';
import DebugInput from '@/ui/components/DebugInput';

export interface DebugEntitySectionProps {
  entityName: string;
  position: { x: number; y: number };
  movementTimer?: { interval: number; elapsed: number };
  directions?: string[];
  mode?: string;
  ticks?: number;
  targetPosition?: { x: number; y: number } | null;
  health?: { value: number; iTicks: number };
  onSetPosition?: (position: { x: number; y: number }) => void;
  onSetMovementInterval?: (interval: number) => void;
  onSetHealth?: (value: number) => void;
  open?: boolean;
}

const DebugEntitySection: React.FC<DebugEntitySectionProps> = ({ 
  entityName,
  position,
  movementTimer,
  directions,
  mode,
  ticks,
  targetPosition,
  health,
  onSetPosition,
  onSetMovementInterval,
  onSetHealth,
  open = false
}) => {
  const formatDirections = (directions?: string[]) => {
    if (!directions || directions.length === 0) return 'None';
    if (directions.length === 1) return directions[0];
    return directions.join(', ');
  };

  const handleInputChange = (setter: (value: any) => void, value: string, type: 'number' | 'position') => {
    if (type === 'number') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setter(numValue);
      }
    } else if (type === 'position') {
      const [x, y] = value.split(',').map(v => parseFloat(v.trim()));
      if (!isNaN(x) && !isNaN(y)) {
        setter({ x, y });
      }
    }
  };

  return (
    <details className="mb-2" open={open}>
      <summary className="font-medium cursor-pointer hover:text-red-300 text-xs">
        {entityName}
      </summary>
      <div className="pl-2 mt-1 space-y-2">
        <DebugDetails summary={`Position: x=${position.x}, y=${position.y}`}>
          {onSetPosition && (
            <DebugInput
              type="text"
              placeholder="x,y"
              onSubmit={(value) => handleInputChange(onSetPosition, value, 'position')}
            />
          )}
        </DebugDetails>

        {movementTimer && (
          <DebugDetails summary={`Movement Timer: interval=${movementTimer.interval}, elapsed=${movementTimer.elapsed.toFixed(2)}`}>
            {onSetMovementInterval && (
              <DebugInput
                type="number"
                placeholder="interval"
                onSubmit={(value) => handleInputChange(onSetMovementInterval, value, 'number')}
              />
            )}
          </DebugDetails>
        )}

        {directions && (
          <p className="text-xs">{`Direction: ${formatDirections(directions)}`}</p>
        )}

        {mode && (
          <p className="text-xs">{`Mode: ${mode}`}</p>
        )}

        {ticks !== undefined && (
          <p className="text-xs">{`Ticks: ${ticks}`}</p>
        )}

        {targetPosition !== undefined && (
          <p className="text-xs">{`Target: x=${targetPosition?.x || 0}, y=${targetPosition?.y || 0}`}</p>
        )}

        {health && (
          <DebugDetails summary={`Health: ${health.value}`}>
            <summary className="text-xs cursor-pointer hover:text-red-300">
              {`Invencibility ticks: ${health.iTicks}`}
            </summary>
            {onSetHealth && (
              <DebugInput
                type="number"
                placeholder="health"
                min="0"
                onSubmit={(value) => handleInputChange(onSetHealth, value, 'number')}
              />
            )}
          </DebugDetails>
        )}
      </div>
    </details>
  );
};

export default DebugEntitySection;
