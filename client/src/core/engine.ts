import { PacmanEntity, GhostEntity, createGhosts} from './entities';
import { State } from './state';

// Interface for the game engine
interface IEngine {
  tileMap: number[][];
  pacman: PacmanEntity;
  ghosts: GhostEntity[];
  state: State;
  tick(delta:number): void;
}

// Engine class implementation
export class Engine implements IEngine {
  tileMap: number[][];
  pacman: PacmanEntity;
  ghosts: GhostEntity[];
  state: State;

  constructor(
  ) {
    this.tileMap = [];
    this.pacman = new PacmanEntity(0, 0, 1);
    this.ghosts = createGhosts();
    this.state = new State(3);
  }


  tick(delta:number): void {
    // TODO: Implement tick method
  }
}