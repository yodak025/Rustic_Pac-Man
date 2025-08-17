import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";



//! Implementación sesgada para un jugador y un fantasma de tipo Blinky
export function collisionSystem(deltaTime: number): void {
  const pacman = usePacmanStore.getState().pacman;
  if (!pacman.actions.isTimeToMove(deltaTime)) {
    return;
  };

  const blinky = useGhostsStore.getState().blinky;
  const { x: ghx, y: ghy } = blinky.components.position;
  const { x: px, y: py } = pacman.components.position;
  if (ghx === px && ghy === py){
    pacman.actions.takeDamage(1);
    console.log(`Pacman ha chocado con Blinky. Salud restante: ${pacman.components.health.value}`);
  }
}