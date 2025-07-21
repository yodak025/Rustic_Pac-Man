import useECSStore from '../state/useECSStore';
import type { Entity } from '../state/useECSStore';
import { movementSystem } from './systems/discreteMovementSystem';
import { playerControlSystem } from './systems/playerControlSystem';
import { Direction } from '../state/components';
import type { Position, MovementTimer, DirectionComponent, Playable } from '../state/components';

export class RusticGameEngine {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyState = { w: false, a: false, s: false, d: false };
  private playableEntities: string[] = [];

  constructor() {
    this.setupKeyboardListeners();
    this.createPacmanEntity();
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

  private createPacmanEntity(): void {
    const pacmanComponents = {
      position: { x: 0, y: 0 } as Position,
      movementTimer: { elapsed: 0, interval: 200 } as MovementTimer,
      direction: { direction: Direction.STOP } as DirectionComponent,
      playable: { value: true } as Playable
    };

    this.createEntity('pacman', pacmanComponents);
    this.playableEntities.push('pacman');
  }

  createEntity(id: string, components: Record<string, any>): Entity {
    const entity: Entity = { id, components };
    const { setEntity } = useECSStore.getState();
    setEntity(entity);
    return entity;
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
    playerControlSystem(this.keyState, this.playableEntities);
    movementSystem(deltaTime, this.playableEntities);
    
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}
