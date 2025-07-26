import usePacmanStore from '@/state/usePacmanStore';
import { movementSystem } from './systems/discreteMovementSystem';
import { playerControlSystem } from './systems/playerControlSystem';

import type { Position, MovementTimer, Direction, Playable } from '@custom-types/gameComponents';

export class RusticGameEngine {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyState = { w: false, a: false, s: false, d: false };
  private playableEntities: string[] = [];

  constructor() {
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
    pacmanStore.actions.setPosition({ x: 0, y: 0 } as Position);
    pacmanStore.actions.setMovementTimerInterval(100);
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
