import pacmanStatusValue from "@/types/pacmanStatusValue";
enum GhostBehaviourMode {
  Chase = "chase",
  Nap = "nap",
}

export default class GhostBehaviourSystem {
  constructor(
    private mode: GhostBehaviourMode = GhostBehaviourMode.Chase,
    public directions: {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
    } = { forward: true, backward: false, left: false, right: false }
  ) {}
  setMode(mode: GhostBehaviourMode) {
    this.mode = mode;
  }
  //! Lazy anys más adelante
  decideDirection(getTile: any, position: { x: number; y: number }, pacman: any) {

    switch (pacman.status) {
      case pacmanStatusValue.COMMON:
        this.mode = GhostBehaviourMode.Chase;
        break;
      case pacmanStatusValue.INVINCIBLE:
        this.mode = GhostBehaviourMode.Nap;
        break;
    }

    switch (this.mode) {
      case GhostBehaviourMode.Nap:
        // Reset all directions
        this.directions.forward = false;
        this.directions.backward = false;
        this.directions.left = false;
        this.directions.right = false;
        break;

      case GhostBehaviourMode.Chase:
        const validDirections:any = [];
        
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
        
        // Choose the direction with minimum distance
        if (validDirections.length > 0) {
          const bestDirection = validDirections.reduce((min: any, current: any) => 
            current.distance < min.distance ? current : min
          );
          this.directions[bestDirection.direction] = true;
        }
        break;
      default:
        throw new Error(`Unknown mode: ${this.mode}`);
    }
  }
}
