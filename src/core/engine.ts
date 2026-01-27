import usePacmanStore from '@/state/usePacmanStore';
import useGhostsStore from '@/state/useGhostsStore';
import { movementSystem } from './systems/discreteMovementSystem';
import { playerControlSystem } from './systems/playerControlSystem';
import { ghostBehaviorSystem } from './systems/ghost-behavior-system/ghostBehaviorSystem';
import { collisionSystem } from './systems/collisionSystem';
import endgameConditions from './endgameConditions';
import useGameStatusStore from '@/state/useGameStatusStore';
import { generateMaze } from './mazeGen';
import useMazeState from '@/state/useMazeStore';
import type { Position} from '@custom-types/gameComponents';
import gameStatusValue from '@custom-types/gameStatusValue';
import * as config from '@/config/ghostBehavior.json';
import { GhostBehaviorMode, TargetKind, CollectableKind} from '@custom-types/gameComponents';
import type { PyodideInterface } from 'pyodide';

// New ECS Architecture imports
import { GameWorld } from './GameWorld';
import { DEBUG_LOG_GAME_WORLD, USE_ECS_GAME_STATUS } from '@config/featureFlags';

const STARTING_POSITIONS = config.DEFAULT_POSITIONS.HOME;

export class RusticGameEngine {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyState = { w: false, a: false, s: false, d: false };
  private pyodide: PyodideInterface;

  // New ECS Architecture: GameWorld instance (Cold State)
  // Currently not used in the game loop - will be integrated in Phase 1+
  private gameWorld: GameWorld;

  constructor(pyodide: PyodideInterface) {
    this.pyodide = pyodide;
    this.gameWorld = new GameWorld();
  }

  /**
   * Get the GameWorld instance for external access (e.g., React Context)
   * This allows debug tools to inspect and modify the game state
   */
  getGameWorld(): GameWorld {
    return this.gameWorld;
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

  private initGameStatus(): void {
    // New ECS: Initialize GameWorld game state
    this.gameWorld.setScore(0);
    this.gameWorld.setLevel(1);
    // Note: GameWorld status is synced from gameStatusStore during game loop
    
    if (DEBUG_LOG_GAME_WORLD) {
      console.log('[GameWorld] Game state initialized:', this.gameWorld.getGameState());
    }
  }

  private initGhostsEntities(): void {
    const blinkyStore = useGhostsStore.getState().blinky;
    blinkyStore.actions.clearDirections();
    blinkyStore.actions.setPosition(STARTING_POSITIONS.BLINKY as Position);
    blinkyStore.actions.setMovementTimerInterval(250);
    blinkyStore.actions.initBehavior(0); // Inicializa el comportamiento con 7 ticks
    blinkyStore.actions.setBehaviorMode(GhostBehaviorMode.HOUSE); // Establece el modo inicial a 'CHASE'
    blinkyStore.actions.setBehaviorTarget({
      kind: TargetKind.HOUSE,
      position: STARTING_POSITIONS.BLINKY as Position
    })

    const pinkyStore = useGhostsStore.getState().pinky;
    pinkyStore.actions.clearDirections();
    pinkyStore.actions.setPosition(STARTING_POSITIONS.PINKY as Position);
    pinkyStore.actions.setMovementTimerInterval(250);
    pinkyStore.actions.initBehavior(15); // Inicializa el comportamiento con 7 ticks
    pinkyStore.actions.setBehaviorMode(GhostBehaviorMode.HOUSE); // Establece el modo inicial a 'CHASE'
    pinkyStore.actions.setBehaviorTarget({
      kind: TargetKind.HOUSE,
      position: STARTING_POSITIONS.PINKY as Position
    })

    const inkyStore = useGhostsStore.getState().inky;
    inkyStore.actions.clearDirections();
    inkyStore.actions.setPosition(STARTING_POSITIONS.INKY as Position);
    inkyStore.actions.setMovementTimerInterval(250);
    inkyStore.actions.initBehavior(30); // Inicializa el comportamiento con 7 ticks
    inkyStore.actions.setBehaviorMode(GhostBehaviorMode.HOUSE); // Establece el modo inicial a 'CHASE'
    inkyStore.actions.setBehaviorTarget({
      kind: TargetKind.HOUSE,
      position: STARTING_POSITIONS.INKY as Position
    })
    // [TODO] Manage peer connection in a less messy way
    inkyStore.actions.setPeer(()=> {return useGhostsStore.getState().blinky});

    const clydeStore = useGhostsStore.getState().clyde;
    clydeStore.actions.clearDirections();
    clydeStore.actions.setPosition(STARTING_POSITIONS.CLYDE as Position);
    clydeStore.actions.setMovementTimerInterval(250);
    clydeStore.actions.initBehavior(45); // Inicializa el comportamiento con 7 ticks
    clydeStore.actions.setBehaviorMode(GhostBehaviorMode.HOUSE); // Establece el modo inicial a 'CHASE'
    clydeStore.actions.setBehaviorTarget({
      kind: TargetKind.HOUSE,
      position: STARTING_POSITIONS.CLYDE as Position
    })
  }

  private async initMazeEntities(): Promise<void> {
    const mazeTiles = await generateMaze(this.pyodide);
    const WALL = 1;
    const HOUSE = -3;
    const PAC_DOT = 0;
    const POWER_PELLET = 2;
    const mazeState = useMazeState.getState();
    let pacDotCounter = 0;
    let powerPelletCounter = 0;
    
    // Legacy store initialization
    mazeState.initializeMazeEntities();
    
    // New ECS Architecture: Clear and prepare GameWorld for maze data
    this.gameWorld.clearSpatialGrids();
    
    if (!mazeTiles) {
      console.error('Failed to load maze tiles');
      throw new Error('Maze tiles not found');
    }
    
    mazeTiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        const localPosition = { x: x, y: y } as Position;
        if (tile === WALL) {
          // Legacy store
          mazeState.createWall(localPosition);
          // New ECS: Populate GameWorld
          this.gameWorld.addWall(x, y);
        } else if (tile === PAC_DOT) {
          // Legacy store
          mazeState.createPacDot(localPosition);
          // New ECS: Populate GameWorld
          this.gameWorld.addCollectable(x, y, CollectableKind.PAC_DOT);
          pacDotCounter++;
        } else if (tile === POWER_PELLET) {
          // Legacy store
          mazeState.createPowerPellet(localPosition);
          // New ECS: Populate GameWorld
          this.gameWorld.addCollectable(x, y, CollectableKind.POWER_PELLET);
          powerPelletCounter++;
        } else if (tile === HOUSE) {
          // Legacy store
          mazeState.createHouseTile(localPosition);
          // New ECS: Populate GameWorld
          this.gameWorld.addHouseTile(x, y);
        }
      });
    });
    
    // Legacy store finalization
    mazeState.setMazeLoaded(true);
    mazeState.initializeMazeInfo(pacDotCounter, powerPelletCounter);
    
    // New ECS: Finalize GameWorld maze data
    this.gameWorld.initializeMazeInfo(pacDotCounter, powerPelletCounter);
    this.gameWorld.setMazeLoaded(true);
    
    // Debug: Log GameWorld maze stats
    if (DEBUG_LOG_GAME_WORLD) {
      const stats = this.gameWorld.debugGetFullState().spatialData;
      console.log('[GameWorld] Maze initialized:', {
        walls: stats.wallCount,
        collectables: stats.collectableCount,
        house: stats.houseCount,
        pacDots: pacDotCounter,
        powerPellets: powerPelletCounter
      });
    }
  }
  
  load(): void {
    this.initMazeEntities().then(() => {
      console.log('Maze entities initialized');
      this.setupKeyboardListeners();
      console.log('Keyboard listeners set up');
      this.initGameStatus();
      console.log('Game status initialized');
      this.initPacmanEntity();
      console.log('Pacman entity initialized');
      this.initGhostsEntities();
      console.log('Ghosts entities initialized');
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
        case gameStatusValue.WON: 
          useGameStatusStore.getState().setNextLevel();
        case gameStatusValue.READY_TO_LOAD:
        case gameStatusValue.RESTARTING:
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
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
      return;
    }
    if (useGameStatusStore.getState().status !== 'PLAYING') {
      this.stop(); // Stop the game loop if the game is not in 'PLAYING' status
    }else{
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      endgameConditions(this.gameWorld);

    // Run systems
    // TODO - Coleguita, esto de aquí es una chapuza monumental.
    // TODO - Los sistemas no conmutan. Hay que crear un sistema de eventos. 
      playerControlSystem(this.keyState); 
      ghostBehaviorSystem(deltaTime, this.gameWorld);
      collisionSystem(deltaTime); //! Cogido con papel de fumar 
      movementSystem(deltaTime, this.gameWorld); //! LOS INTERVALOS DE MOVIMIENTO ESTÁN ACOPLADOS, NO TOQUES EL ORDEN DE EJECUCIÓN

      // Debug: Log GameWorld state each frame if enabled
      if (DEBUG_LOG_GAME_WORLD) {
        console.log('[GameWorld]', this.gameWorld.debugGetFullState());
      }
    }
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}
