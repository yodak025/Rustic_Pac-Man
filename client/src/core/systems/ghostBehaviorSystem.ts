import pacmanStatusValue from "@/types/pacmanStatusValue";
enum GhostBehaviorMode {
  Chase = "chase",
  Nap = "nap",
  Escape = "escape",
}

export default class GhostBehaviorSystem {
  constructor(
    private mode: GhostBehaviorMode = GhostBehaviorMode.Chase,
    public directions: {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
    } = { forward: true, backward: false, left: false, right: false }
  ) {}
  setMode(mode: GhostBehaviorMode) {
    this.mode = mode;
  }
  //! Lazy anys más adelante
  decideDirection(getTile: any, position: { x: number; y: number }, pacman: any) {

    switch (pacman.status) {
      case pacmanStatusValue.COMMON:
        this.mode = GhostBehaviorMode.Chase;
        break;
      case pacmanStatusValue.INVINCIBLE:
        this.mode = GhostBehaviorMode.Nap;
        break;
      case pacmanStatusValue.HUNTING:
         if (this.mode === GhostBehaviorMode.Chase) {
          this.directions.forward = false;
          this.directions.backward = false;
          this.directions.left = false;
          this.directions.right = false;
         }
        this.mode = GhostBehaviorMode.Escape;
        break;
    }

    switch (this.mode) {
      case GhostBehaviorMode.Nap:
        // Reset all directions
        this.directions.forward = false;
        this.directions.backward = false;
        this.directions.left = false;
        this.directions.right = false;
        break;

      case GhostBehaviorMode.Chase:
      case GhostBehaviorMode.Escape:
        const validDirections: any = [];
        
        // Check up
        const upTile = getTile({x: Math.round(position.x), y: Math.round(position.y) - 1});
        if (!this.directions.backward && !isNaN(upTile) && upTile !== 1) {
          const upDistance = Math.sqrt(Math.pow(position.x - pacman.position.x, 2) + Math.pow((position.y - 1) - pacman.position.y, 2));
          validDirections.push({ direction: 'forward', distance: upDistance });
        }
        
        // Check down
        const downTile = getTile({x: Math.round(position.x), y: Math.round(position.y) + 1});
        if (!this.directions.forward && !isNaN(downTile) && downTile !== 1) {
          const downDistance = Math.sqrt(Math.pow(position.x - pacman.position.x, 2) + Math.pow((position.y + 1) - pacman.position.y, 2));
          validDirections.push({ direction: 'backward', distance: downDistance });
        }
        
        // Check left
        const leftTile = getTile({x: Math.round(position.x) - 1, y: Math.round(position.y)});
        if (!this.directions.right && !isNaN(leftTile) && leftTile !== 1) {
          const leftDistance = Math.sqrt(Math.pow((position.x - 1) - pacman.position.x, 2) + Math.pow(position.y - pacman.position.y, 2));
          validDirections.push({ direction: 'left', distance: leftDistance });
        }
        
        // Check right
        const rightTile = getTile({x: Math.round(position.x) + 1, y: Math.round(position.y)});
        if (!this.directions.left && !isNaN(rightTile) && rightTile !== 1) {
          const rightDistance = Math.sqrt(Math.pow((position.x + 1) - pacman.position.x, 2) + Math.pow(position.y - pacman.position.y, 2));
          validDirections.push({ direction: 'right', distance: rightDistance });
        }
        
        // Reset all directions
        this.directions.forward = false;
        this.directions.backward = false;
        this.directions.left = false;
        this.directions.right = false;
        
        // Choose direction based on mode
        if (validDirections.length > 0) {
          const bestDirection = this.mode === GhostBehaviorMode.Chase
        ? validDirections.reduce((min: any, current: any) => 
            current.distance < min.distance ? current : min
          )
        : validDirections.reduce((max: any, current: any) => 
            current.distance > max.distance ? current : max
          );
          this.directions[bestDirection.direction] = true; //! Lazy any implicito, revisar
        }
        break;
      default:
        throw new Error(`Unknown mode: ${this.mode}`);
    }
  }
}
