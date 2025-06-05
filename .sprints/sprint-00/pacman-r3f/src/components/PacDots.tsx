import { forwardRef, useImperativeHandle, useMemo, useState, useCallback } from 'react';
import { Sphere } from '@react-three/drei';

interface PacDotsProps {
  mazeMap: number[][];
  onPacDotConsumed: (position: [number, number]) => void;
  onAllConsumed: () => void;
}

export interface PacDotsRef {
  consumePacDot: (x: number, z: number) => boolean;
  getRemainingCount: () => number;
}

const PacDots = forwardRef<PacDotsRef, PacDotsProps>(
  ({ mazeMap, onPacDotConsumed, onAllConsumed }, ref) => {
    
    // Set para trackear posiciones consumidas - mucho más eficiente
    const [consumedPositions, setConsumedPositions] = useState<Set<string>>(new Set());
    
    // Calcular el total de pac-dots iniciales (solo una vez)
    const initialPacDotsCount = useMemo(() => {
      return mazeMap.flat().filter(cell => cell === 0).length;
    }, [mazeMap]);

    const consumePacDot = useCallback((x: number, z: number): boolean => {
      // Verificar que la posición esté dentro del mapa y contenga un pac-dot
      if (z >= 0 && z < mazeMap.length && 
          x >= 0 && x < mazeMap[z].length && 
          mazeMap[z][x] === 0) {
        
        const positionKey = `${x}-${z}`;
        
        // Verificar si ya fue consumido
        if (consumedPositions.has(positionKey)) {
          return false;
        }
        
        // Agregar a las posiciones consumidas - O(1)
        setConsumedPositions(prev => new Set(prev).add(positionKey));
        
        // Verificar si se han consumido todos los pac-dots
        const newRemainingCount = initialPacDotsCount - (consumedPositions.size + 1);
        if (newRemainingCount === 0) {
          setTimeout(() => onAllConsumed(), 100);
        }
        
        onPacDotConsumed([x, z]);
        return true;
      }
      return false;
    }, [mazeMap, consumedPositions, initialPacDotsCount, onPacDotConsumed, onAllConsumed]);

    const getRemainingCount = useCallback((): number => {
      return initialPacDotsCount - consumedPositions.size;
    }, [initialPacDotsCount, consumedPositions.size]);

    useImperativeHandle(ref, () => ({
      consumePacDot,
      getRemainingCount
    }));

    // Generar pac-dots solo para posiciones con valor 0 y no consumidas
    const pacDots = useMemo(() => {
      const dots = [];
      for (let z = 0; z < mazeMap.length; z++) {
        for (let x = 0; x < mazeMap[z].length; x++) {
          if (mazeMap[z][x] === 0 && !consumedPositions.has(`${x}-${z}`)) {
            dots.push(
              <Sphere
                key={`${x}-${z}`}
                position={[x + 0.5, 0.2, z + 0.5]}
                args={[0.08, 8, 8]}
              >
                <meshBasicMaterial color="#ffff00" />
              </Sphere>
            );
          }
        }
      }
      return dots;
    }, [mazeMap, consumedPositions]);

    return <group>{pacDots}</group>;
  }
);

PacDots.displayName = 'PacDots';

export default PacDots;
