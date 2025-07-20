import React, { useEffect } from 'react';
import {useEntitiesState} from '@state/store';
import useGameFrame from '@core/hooks/useGameFrame';

interface MovementProps {
  id: string;
}

const Movement: React.FC<MovementProps> = ({ id }) => {
  const setPosition = useEntitiesState(state => state.setPosition);
  // TODO - Implementar una verificación de Componentes más robusta
  let x = NaN;
  let y = NaN;
  const position = useEntitiesState(state => state.entities[id]?.components.position);
  const speed = useEntitiesState(state => state.entities[id]?.components.speed);
  const direction = useEntitiesState(state => state.entities[id]?.components.direction);
  
  useEffect(() => {
    //! falta asegurar que este useEffect solo se ejecute al inicializar position y no en cada cambio
    if (position) {
      x = useEntitiesState(state => state.entities[id]?.components.position!.x);
      y = useEntitiesState(state => state.entities[id]?.components.position!.y);
    }
  }, [position]);

  useGameFrame((_, delta) => {
    if (!position || !speed || !direction) return;
    let newX = x;
    let newY = y;
    switch (direction) {
      case 'up':
        newY += speed * delta;
        break;
      case 'down':
        newY -= speed * delta;
        break;
      case 'left':
        newX -= speed * delta;
        break;
      case 'right':
        newX += speed * delta;
        break;
      default:
        return; // No movement if direction is not set
  }
  setPosition(id, { x: newX, y: newY });
})

  
  
  // Este componente no renderiza nada visible, solo añade la funcionalidad de movimiento
  return null;
};

export default Movement;