import pacmanStatusValue from "@/types/pacmanStatusValue";
enum GhostBehaviorMode {
  Chase = "chase",
  Nap = "nap",
  Escape = "escape",
  Decide = "decide",
  Iddle = "iddle"
}

export default class GhostBehaviorSystem {
  constructor(
    private mode: GhostBehaviorMode = GhostBehaviorMode.Chase,
    public directions: {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
    } = { forward: true, backward: false, left: false, right: false },
    private iddleTarget : {x: number, y: number} = { x: 0, y: 0 }
  ) {
    
  };
  setMode(mode: GhostBehaviorMode) {
    this.mode = mode;
  }


  decideMode(){
    const modes = [
      GhostBehaviorMode.Chase,
      GhostBehaviorMode.Iddle
    ];
    
    // Get random index
    const randomIndex = Math.floor(Math.random() * modes.length);
    
    // Set the mode to a random behavior
    this.mode = modes[randomIndex];
    return this.mode;
  }

  //! Lazy anys más adelante
  decideDirection(tilemap: any, position: { x: number; y: number }, pacman: any) {

    // Randomly decide to change mode to Decide
    if (Math.random() < 0.01) { // 1% chance per frame to change to decide mode
      this.mode = GhostBehaviorMode.Decide;
      // Early return since we'll handle the decision in the next frame
    }

    switch (pacman.status) {
      case pacmanStatusValue.INVINCIBLE:
        this.mode = GhostBehaviorMode.Iddle;
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
      case GhostBehaviorMode.Decide:
        const newMode = this.decideMode();
        // Si el modo decidido es Iddle, asignar un nuevo iddleTarget aleatorio
        if (newMode === GhostBehaviorMode.Iddle) {
          // Obtener una posición aleatoria de un tile con valor 0
          const randomTile = tilemap.getRandomTileCoords(0);
          this.iddleTarget = randomTile;
        }
        break;

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
        const upTile = tilemap.getTile({x: Math.round(position.x), y: Math.round(position.y) - 1});
        if (!this.directions.backward && !isNaN(upTile) && upTile !== 1) {
          const upDistance = Math.sqrt(Math.pow(position.x - pacman.position.x, 2) + Math.pow((position.y - 1) - pacman.position.y, 2));
          validDirections.push({ direction: 'forward', distance: upDistance });
        }
        
        // Check down
        const downTile = tilemap.getTile({x: Math.round(position.x), y: Math.round(position.y) + 1});
        if (!this.directions.forward && !isNaN(downTile) && downTile !== 1) {
          const downDistance = Math.sqrt(Math.pow(position.x - pacman.position.x, 2) + Math.pow((position.y + 1) - pacman.position.y, 2));
          validDirections.push({ direction: 'backward', distance: downDistance });
        }
        
        // Check left
        const leftTile = tilemap.getTile({x: Math.round(position.x) - 1, y: Math.round(position.y)});
        if (!this.directions.right && !isNaN(leftTile) && leftTile !== 1) {
          const leftDistance = Math.sqrt(Math.pow((position.x - 1) - pacman.position.x, 2) + Math.pow(position.y - pacman.position.y, 2));
          validDirections.push({ direction: 'left', distance: leftDistance });
        }
        
        // Check right
        const rightTile = tilemap.getTile({x: Math.round(position.x) + 1, y: Math.round(position.y)});
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
        ? validDirections.reduce((min: typeof validDirections[0], current: typeof validDirections[0]) => 
            current.distance < min.distance ? current : min
          )
        : validDirections.reduce((max: typeof validDirections[0], current: typeof validDirections[0]) => 
            current.distance > max.distance ? current : max
          );
          (this.directions as any)[bestDirection.direction] = true; //!- Lazy any implícito, Revisar
        }
        break;
      case GhostBehaviorMode.Iddle:
        // Comportamiento similar a Chase pero hacia iddleTarget
        const validDirectionsIddle: any = [];
        // Check up
        const upTileIddle = tilemap.getTile({x: Math.round(position.x), y: Math.round(position.y) - 1});
        if (!this.directions.backward && !isNaN(upTileIddle) && upTileIddle !== 1) {
          const upDistanceIddle = Math.sqrt(Math.pow(position.x - this.iddleTarget.x, 2) + Math.pow((position.y - 1) - this.iddleTarget.y, 2));
          validDirectionsIddle.push({ direction: 'forward', distance: upDistanceIddle });
        }
        // Check down
        const downTileIddle = tilemap.getTile({x: Math.round(position.x), y: Math.round(position.y) + 1});
        if (!this.directions.forward && !isNaN(downTileIddle) && downTileIddle !== 1) {
          const downDistanceIddle = Math.sqrt(Math.pow(position.x - this.iddleTarget.x, 2) + Math.pow((position.y + 1) - this.iddleTarget.y, 2));
          validDirectionsIddle.push({ direction: 'backward', distance: downDistanceIddle });
        }
        // Check left
        const leftTileIddle = tilemap.getTile({x: Math.round(position.x) - 1, y: Math.round(position.y)});
        if (!this.directions.right && !isNaN(leftTileIddle) && leftTileIddle !== 1) {
          const leftDistanceIddle = Math.sqrt(Math.pow((position.x - 1) - this.iddleTarget.x, 2) + Math.pow(position.y - this.iddleTarget.y, 2));
          validDirectionsIddle.push({ direction: 'left', distance: leftDistanceIddle });
        }
        // Check right
        const rightTileIddle = tilemap.getTile({x: Math.round(position.x) + 1, y: Math.round(position.y)});
        if (!this.directions.left && !isNaN(rightTileIddle) && rightTileIddle !== 1) {
          const rightDistanceIddle = Math.sqrt(Math.pow((position.x + 1) - this.iddleTarget.x, 2) + Math.pow(position.y - this.iddleTarget.y, 2));
          validDirectionsIddle.push({ direction: 'right', distance: rightDistanceIddle });
        }
        // Reset all directions
        this.directions.forward = false;
        this.directions.backward = false;
        this.directions.left = false;
        this.directions.right = false;
        // Elegir la dirección que más se acerque al iddleTarget
        if (validDirectionsIddle.length > 0) {
          const bestDirectionIddle = validDirectionsIddle.reduce((min: typeof validDirectionsIddle[0], current: typeof validDirectionsIddle[0]) =>
            current.distance < min.distance ? current : min
          );
          (this.directions as any)[bestDirectionIddle.direction] = true;
        }
        break;
      default:
        throw new Error(`Unknown mode: ${this.mode}`);
    }
  }
}

