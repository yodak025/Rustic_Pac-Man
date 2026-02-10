import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import useDebugConfigStore from "@/state/useDebugConfigStore";
import {
  type Position,
  type MovementTimer,
  Direction,
} from "@/types/gameComponents";

export function useGraphicPositionInterpolation(
  position: Position,
  movementTimer: MovementTimer,
  directions: Direction[],
  lastPosition: Position,
) {
  const { view } = useDebugConfigStore();
  const [interpolatedPosition, setInterpolatedPosition] = useState(position);

  useFrame(() => {
    if (view.isDiscrete) {
      setInterpolatedPosition(position);
      return;
    }
    
    if (!directions) {
      setInterpolatedPosition(position);
    } else {
      const factor = movementTimer.elapsed / movementTimer.interval;

      setInterpolatedPosition({
        x: position.x * factor + lastPosition.x * (1 - factor),
        y: position.y * factor + lastPosition.y * (1 - factor),
      })
    }
  });

  
  return view.isDiscrete ? position : interpolatedPosition;
}
