import usePacmanStore from '@/state/usePacmanStore';
import { movementSystem } from './systems/discreteMovementSystem';
import { playerControlSystem } from './systems/playerControlSystem';

import { loadMaze } from '@/services/api';
import useMazeState from '@/state/useMazeState';

import type { Position, MovementTimer, Direction, Playable } from '@custom-types/gameComponents';
import PacmanMesh from '@/scenes/meshes/entities/PacmanMesh';

export class RusticGameEngine {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyState = { w: false, a: false, s: false, d: false };
  private playableEntities: string[] = [];

  constructor() {
    //? Asumo que la asincronía de la carga del laberinto justifica este orden de inicialización
    this.initMazeEntities().then(() => {
      console.log('Maze entities initialized');
    }).catch((error) => {
      console.error('Error initializing maze entities:', error);
    });

    this.setupKeyboardListeners();
    this.initPacmanEntity();
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          this.keyState.w = true;
          break;
        case 'a':
          this.keyState.a = true;
          break;
        case 's':
          this.keyState.s = true;
          break;
        case 'd':
          this.keyState.d = true;
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          this.keyState.w = false;
          break;
        case 'a':
          this.keyState.a = false;
          break;
        case 's':
          this.keyState.s = false;
          break;
        case 'd':
          this.keyState.d = false;
          break;
      }
    });
  }

  private initPacmanEntity(): void {
    const pacmanStore = usePacmanStore.getState().pacman;
    pacmanStore.actions.setPosition({ x: 14, y: 16 } as Position);
    pacmanStore.actions.setMovementTimerInterval(200);
  }

  private async initMazeEntities(): Promise<void> {
    const mazeTiles = await loadMaze();
    const WALL = 1;
    const PAC_DOT = 0;

    const mazeState = useMazeState.getState();
    
    if (!mazeTiles) {
      console.error('Failed to load maze tiles');
      throw new Error('Maze tiles not found');
    }
    mazeTiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        const localPosition = { x: x, y: y } as Position;
        if (tile === WALL) {
          mazeState.createWall(localPosition);
        } else if (tile === PAC_DOT) {
          mazeState.createPacDot(localPosition);
        }
      });
    })
    mazeState.setMazeLoaded(true); // Set maze as loaded
  }


  start(): void {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop(): void {
    if (!this.isRunning) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Run systems
    playerControlSystem(this.keyState);
    movementSystem(deltaTime);
    
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}
