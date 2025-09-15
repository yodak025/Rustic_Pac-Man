import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";

//! Implementación sesgada para un jugador y un fantasma de tipo Blinky
export function collisionSystem(deltaTime: number): void {
  const pacman = usePacmanStore.getState().pacman;
  if (!pacman.actions.isTimeToMove(deltaTime)) {
    return;
  }

  const ghosts = useGhostsStore.getState();
  const { blinky, pinky, inky, clyde } = ghosts;
  const { x: px, y: py } = pacman.components.position;
  
  // Check collision with each ghost
  const checkGhostCollision = (ghost: any, name: string) => {
    const { x: ghx, y: ghy } = ghost.components.position;
    if (ghx === px && ghy === py) {
      pacman.actions.takeDamage(1);
      console.log(
        `Pacman ha chocado con ${name}. Salud restante: ${pacman.components.health.value}`
      );
      return true;
    }
    return false;
  };

  checkGhostCollision(blinky, "Blinky") || 
  checkGhostCollision(pinky, "Pinky") || 
  checkGhostCollision(inky, "Inky") || 
  checkGhostCollision(clyde, "Clyde");
}
