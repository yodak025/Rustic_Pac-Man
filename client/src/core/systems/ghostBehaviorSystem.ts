import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import useMazeState from "@/state/useMazeStore";
import { Direction } from "@custom-types/gameComponents";

export function ghostBehaviorSystem(deltaTime: number): void {
  //! Implementación sesgada para un jugador y un fantasma de tipo Blinky
  const { x: ghx, y: ghy } =
    useGhostsStore.getState().blinky.components.position;
  const { x: px, y: py } = usePacmanStore.getState().pacman.components.position;
  const isWallAt = useMazeState.getState().isWallAt;
  const direction = useGhostsStore.getState().blinky.components
    .direction as Direction;
  const setDirection = useGhostsStore.getState().blinky.actions.setDirection;

  const decide = () => {
    //? Esto es una pequeña macarrada caprichosa. 
    //? El fantasma decide su dirección en función de la posición del Pacman
    //? y de su propia dirección actual, para no retroceder.
    //? Está implementado como un mapa de candidatos a dirección
    //? y se elige la dirección con menor distancia Euclidea al Pacman.
    
    const candidates = new Map<Direction, number>();

    if (direction != Direction.LEFT && !isWallAt({ x: ghx + 1, y: ghy })) {
      candidates.set(
        Direction.RIGHT,
        Math.sqrt(Math.pow(ghx + 1 - px, 2) + Math.pow(ghy - py, 2))
      );
    }
    if (direction != Direction.RIGHT && !isWallAt({ x: ghx - 1, y: ghy })) {
      candidates.set(
        Direction.LEFT,
        Math.sqrt(Math.pow(ghx - 1 - px, 2) + Math.pow(ghy - py, 2))
      );
    }
    if (direction != Direction.UP && !isWallAt({ x: ghx, y: ghy + 1 })) {
      candidates.set(
        Direction.DOWN,
        Math.sqrt(Math.pow(ghx - px, 2) + Math.pow(ghy + 1 - py, 2))
      );
    }
    if (direction != Direction.DOWN && !isWallAt({ x: ghx, y: ghy - 1 })) {
      candidates.set(
        Direction.UP, 
        Math.sqrt(Math.pow(ghx - px, 2) + Math.pow(ghy - 1 - py, 2))
      );
    }

    setDirection(
      candidates.size === 0
        ? Direction.STOP
        : [...candidates.entries()].reduce((min, [direction, distance]) =>
            distance < min[1] ? [direction, distance] : min
          )[0]
    );
  };
  decide();
}
