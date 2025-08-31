import usePacmanStore from '@/state/usePacmanStore';
import useGhostsStore from '@/state/useGhostsStore';
import { movementSystem } from './systems/discreteMovementSystem';
import { playerControlSystem } from './systems/playerControlSystem';
import { ghostBehaviorSystem } from './systems/ghostBehaviorSystem';
import { collisionSystem } from './systems/collisionSystem';
import endgameConditions from './endgameConditions';

import useGameStatusStore from '@/state/useGameStatusStore';

import { loadMaze } from '@/services/api';
import useMazeState from '@/state/useMazeStore';

import type { Position} from '@custom-types/gameComponents';
import gameStatusValue from '@custom-types/gameStatusValue';
import { use } from 'react';


export class RusticGameEngine {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyState = { w: false, a: false, s: false, d: false };
  constructor() {
    
  }

  private setupKeyboardListeners(): void {
    //! Yo creo que esto se podría encapsular 
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
    pacmanStore.actions.setHealth(3); 
    pacmanStore.actions.setMovementTimerInterval(200);
  }

  private initBlinkyEntity(): void {
    const blinkyStore = useGhostsStore.getState().blinky;
    blinkyStore.actions.setPosition({ x: 14, y: 14 } as Position);
    blinkyStore.actions.setMovementTimerInterval(300);
  }

  private async initMazeEntities(): Promise<void> {
    const mazeTiles = await loadMaze();
    const WALL = 1;
    const PAC_DOT = 0;
    const mazeState = useMazeState.getState();
    let pacDotCounter = 0;
    mazeState.initializeMazeEntities()
    
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
          pacDotCounter++;
        }
      });
    })
    mazeState.setMazeLoaded(true); // Set maze as loaded
    mazeState.initializeMazeInfo(pacDotCounter);
  }
  
  load(): void {
    //! Maneja la promesa como un hombre joder, esto es lo mas cobarde que he visto en mi vida
    this.initMazeEntities().then(() => {
      console.log('Maze entities initialized');
      this.setupKeyboardListeners();
      console.log('Keyboard listeners set up');
      this.initPacmanEntity();
      console.log('Pacman entity initialized');
      this.initBlinkyEntity();
      console.log('Blinky entity initialized');
      useGameStatusStore.getState().setCoreLoadedStatus(); 
      console.log('Core loaded!'); 
    }).catch((error) => {
      console.error('Error initializing maze entities:', error);
    });
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
      switch (useGameStatusStore.getState().status) {
        case gameStatusValue.READY_TO_LOAD:
        case gameStatusValue.WON:
        case gameStatusValue.LOST:
          this.load()
          useGameStatusStore.getState().setLoadingCoreStatus();
          console.log('Loading core...');
          break;
        case gameStatusValue.GRAPHICS_LOADED:
          useGameStatusStore.getState().setPlayingStatus();
          break;
        case gameStatusValue.PLAYING:
          this.start();
          break;
        default:
          break;
      }

    }
    if (useGameStatusStore.getState().status !== 'PLAYING') {
      this.stop(); // Stop the game loop if the game is not in 'PLAYING' status
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    endgameConditions()

    // Run systems
    // TODO - Coleguita, esto de aquí es una chapuza monumental.
    // TODO - Los sistemas no conmutan. Hay que crear un sistema de eventos. 
    playerControlSystem(this.keyState); 
    ghostBehaviorSystem(deltaTime);
    collisionSystem(deltaTime); //! Cogido con papel de fumar 
    movementSystem(deltaTime); //! LOS INTERVALOS DE MOVIMIENTO ESTÁN ACOPLADOS, NO TOQUES EL ORDEN DE EJECUCIÓN

    
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}
