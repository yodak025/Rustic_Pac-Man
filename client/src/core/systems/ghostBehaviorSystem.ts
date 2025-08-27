import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import useMazeState from "@/state/useMazeStore";
import { Direction } from "@custom-types/gameComponents";

export function ghostBehaviorSystem(deltaTime: number): void {
  if (!useGhostsStore.getState().blinky.actions.isTimeToMove(deltaTime)) {
    return;
  }
  //! Implementación sesgada para un jugador y un fantasma de tipo Blinky
  const { x: ghx, y: ghy } =
    useGhostsStore.getState().blinky.components.position;
  const { x: px, y: py } = usePacmanStore.getState().pacman.components.position;
  const isWallAt = useMazeState.getState().isWallAt;
  const directions = useGhostsStore.getState().blinky.components
    .directions as Array<Direction>;

  const clearDirections =
    useGhostsStore.getState().blinky.actions.clearDirections;
  const addDirection = useGhostsStore.getState().blinky.actions.addDirection;

  const decide = () => {
    //? Esto es una pequeña macarrada caprichosa.
    //? El fantasma decide su dirección en función de la posición del Pacman
    //? y de su propia dirección actual, para no retroceder.
    //? Está implementado como un mapa de candidatos a dirección
    //? y se elige la dirección con menor distancia Euclidea al Pacman.

    const candidates = new Map<Direction, number>();

    if (directions[0] != Direction.LEFT && !isWallAt({ x: ghx + 1, y: ghy })) {
      candidates.set(
        Direction.RIGHT,
        Math.sqrt(Math.pow(ghx + 1 - px, 2) + Math.pow(ghy - py, 2))
      );
    }
    if (directions[0] != Direction.RIGHT && !isWallAt({ x: ghx - 1, y: ghy })) {
      candidates.set(
        Direction.LEFT,
        Math.sqrt(Math.pow(ghx - 1 - px, 2) + Math.pow(ghy - py, 2))
      );
    }
    if (directions[0] != Direction.UP && !isWallAt({ x: ghx, y: ghy + 1 })) {
      candidates.set(
        Direction.DOWN,
        Math.sqrt(Math.pow(ghx - px, 2) + Math.pow(ghy + 1 - py, 2))
      );
    }
    if (directions[0] != Direction.DOWN && !isWallAt({ x: ghx, y: ghy - 1 })) {
      candidates.set(
        Direction.UP,
        Math.sqrt(Math.pow(ghx - px, 2) + Math.pow(ghy - 1 - py, 2))
      );
    }
    clearDirections();

    if (candidates.size !== 0) {
      addDirection(
        [...candidates.entries()].reduce((min, [direction, distance]) =>
          distance < min[1] ? [direction, distance] : min
        )[0]
      );
    }
  };
  decide();
}
