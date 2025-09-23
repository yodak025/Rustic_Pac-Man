import usePacmanStore from "@/state/usePacmanStore";
import useGhostsStore from "@/state/useGhostsStore";
import {
  Direction,
  GhostBehaviorKind,
  TargetKind,
  GhostBehaviorMode,
} from "@custom-types/gameComponents";

export function manageChaseBehavior(ghost: any): void {
  switch (ghost.components.behavior.kind) {
    case GhostBehaviorKind.BLINKY:
      ghost.actions.setBehaviorTarget({
        kind: TargetKind.PLAYER,
        position: usePacmanStore.getState().pacman.components.position,
      });
      break;
    case GhostBehaviorKind.PINKY:
      // Target 4 tiles ahead of Pacman's current direction
      const pacman = usePacmanStore.getState().pacman;
      const pacPos = pacman.components.position;
      const pacDir = pacman.components.directions[0]; // [WARNING] It depends on the horrible input management currently implemented. Be careful if you change it.
      let targetPos = { x: pacPos.x, y: pacPos.y };
      switch (pacDir) {
        case Direction.UP:
          targetPos.y -= 4;
          break;
        case Direction.DOWN:
          targetPos.y += 4;
          break;
        case Direction.LEFT:
          targetPos.x -= 4;
          break;
        case Direction.RIGHT:
          targetPos.x += 4;
          break;
      }
      ghost.actions.setBehaviorTarget({
        kind: TargetKind.PLAYER,
        position: targetPos,
      });
      break;
    case GhostBehaviorKind.CLYDE:
      // If Clyde is more than 8 tiles away from Pacman, target Pacman
      // If within 8 tiles, target his scatter corner (bottom-left)
      const pac = usePacmanStore.getState().pacman;
      const pacPosition = pac.components.position;
      const { x: ghx, y: ghy } = ghost.components.position;
      const distance = Math.sqrt(
        Math.pow(ghx - pacPosition.x, 2) + Math.pow(ghy - pacPosition.y, 2)
      );
      if (distance > 8) {
        ghost.actions.setBehaviorTarget({
          kind: TargetKind.PLAYER,
          position: pacPosition,
        });
      } else {
        ghost.actions.setBehaviorTarget({
          kind: TargetKind.PLAYER,
          position: { x: 0, y: 34 },
        });
      }
      break;
    case GhostBehaviorKind.INKY:
      // Target is determined by a point 2 tiles ahead of Pacman and
      // a vector from Blinky to that point, doubled.
      console.log(`inky's peer is ${ghost.components.behavior.peer().components.behavior.mode}`)

      if (
        ghost.components.behavior.peer().components.behavior.mode ===
        GhostBehaviorMode.EATEN
      ) {
        // If Blinky is eaten, just target Pacman directly to replace Blinky role since Inky's behavior breaks if pacman takes distance from Blinky's body
        ghost.actions.setBehaviorTarget({
          kind: TargetKind.PLAYER,
          position: usePacmanStore.getState().pacman.components.position,
        });
        return;
      }
      const pacmanInky = usePacmanStore.getState().pacman;
      const pacPosInky = pacmanInky.components.position;
      const pacDirInky = pacmanInky.components.directions[0]; // [WARNING] It depends on the horrible input management currently implemented. Be careful if you change it.
      let intermediatePos = { x: pacPosInky.x, y: pacPosInky.y };
      switch (pacDirInky) {
        case Direction.UP:
          intermediatePos.y -= 2;
          break;
        case Direction.DOWN:
          intermediatePos.y += 2;
          break;
        case Direction.LEFT:
          intermediatePos.x -= 2;
          break;
        case Direction.RIGHT:
          intermediatePos.x += 2;
          break;
      }
      const blinky = useGhostsStore.getState().blinky;
      const blinkyPos = blinky.components.position;
      const vectorX = intermediatePos.x - blinkyPos.x;
      const vectorY = intermediatePos.y - blinkyPos.y;
      const targetX = intermediatePos.x + vectorX;
      const targetY = intermediatePos.y + vectorY;
      ghost.actions.setBehaviorTarget({
        kind: TargetKind.PLAYER,
        position: { x: targetX, y: targetY },
      });
      break;
  }
}
