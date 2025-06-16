enum GhostBehaviourMode {
  Chase = "chase",
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
  decideDirection(getTile:any, position: { x: number; y: number }) {
    switch (this.mode) {
      case GhostBehaviourMode.Chase:
        if (!this.directions.backward && getTile(position.x, position.y - 1) !== (NaN || 1)) {
          this.directions.forward = true;
          this.directions.backward = false;
          this.directions.left = false;
          this.directions.right = false;
        }else if (!this.directions.forward && getTile(position.x, position.y + 1) !== (NaN || 1)) {
          this.directions.forward = false;
          this.directions.backward = true;
          this.directions.left = false;
          this.directions.right = false;
        }
        else if (!this.directions.right && getTile(position.x - 1, position.y) !== (NaN || 1)) {
          this.directions.forward = false;
          this.directions.backward = false;
          this.directions.left = true;
          this.directions.right = false;
        }
        else if (!this.directions.left && getTile(position.x + 1, position.y) !== (NaN || 1)) {
          this.directions.forward = false;
          this.directions.backward = false;
          this.directions.left = false;
          this.directions.right = true;
        } else {
          // If no valid direction is found, stop moving
          this.directions.forward = false;
          this.directions.backward = false;
          this.directions.left = false;
          this.directions.right = false;
        }
        break;
      default:
        throw new Error(`Unknown mode: ${this.mode}`);
    }
  }
}
