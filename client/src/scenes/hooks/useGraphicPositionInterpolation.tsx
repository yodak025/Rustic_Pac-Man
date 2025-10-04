import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as debug from "@config/debug.json";
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
  if (debug.view.isDiscrete) {
    return position;
  }
  const [interpolatedPosition, setInterpolatedPosition] = useState(position);

  useFrame(() => {
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

  
  return interpolatedPosition;
}
