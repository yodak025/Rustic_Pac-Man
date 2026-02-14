import { movementSystem } from './systems/discreteMovementSystem';
import { generateMaze } from './mazeGen';
import { useHotState } from '@/state/useHotState';
import type { Position } from '@custom-types/gameComponents';
import GameStatus from '@custom-types/gameStatus';
import * as config from '@/config/defaultPositions.json';
import { CollectableKind } from '@custom-types/gameComponents';
import type { PyodideInterface } from 'pyodide';
import { preloadAllWorldConfigs } from '@core/worldConfigLoader';

// New ECS Architecture imports
import { GameWorld } from './GameWorld';
import { DEBUG_LOG_GAME_WORLD } from '@config/featureFlags';
import { ComponentType, PACMAN_ENTITY_ID, BLINKY_ENTITY_ID, PINKY_ENTITY_ID, INKY_ENTITY_ID, CLYDE_ENTITY_ID } from '@custom-types/componentTypes';
import * as gameDefaults from '@config/gameDefaults.json';
import { createGhostEntity } from './entityFactory';
import { GhostBehaviorKind } from '@custom-types/gameComponents';

// ECS Systems
import { inputCaptureSystem } from './systems/inputCaptureSystem';
import { playerIntentSystem } from './systems/playerIntentSystem';
import { continuousMovementSystem } from './systems/continuousMovementSystem';
import { alignmentSystem } from './systems/alignmentSystem';
import { discretePositionSyncSystem } from './systems/discretePositionSyncSystem';
import { syncToHotStateSystem } from './systems/syncToHotStateSystem';
import { ghostBehaviorModeSystem } from './systems/ghostBehaviorModeSystem';
import { ghostTargetingSystem } from './systems/ghostTargetingSystem';
import { ghostDirectionSystem } from './systems/ghostDirectionSystem';
import { behaviorTimerTickSystem } from './systems/behaviorTimerTickSystem';
import { timerUpdateSystem } from './systems/timerUpdateSystem';
import { entityCollisionSystem } from './systems/entityCollisionSystem';
import { collectionDetectionSystem } from './systems/collectionDetectionSystem';
import { damageSystem } from './systems/damageSystem';
import { collectionEffectSystem } from './systems/collectionEffectSystem';
import { powerPelletEffectSystem } from './systems/powerPelletEffectSystem';
import { invulnerabilityTickSystem } from './systems/invulnerabilityTickSystem';
import { victoryConditionSystem } from './systems/victoryConditionSystem';
import { defeatConditionSystem } from './systems/defeatConditionSystem';
import { cleanupEventsSystem } from './systems/cleanupEventsSystem';

const STARTING_POSITIONS = config.DEFAULT_POSITIONS.HOME;

export class RusticGameEngine {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyState = { w: false, a: false, s: false, d: false };
  private pyodide: PyodideInterface;

  private gameWorld: GameWorld;

  constructor(pyodide: PyodideInterface) {
    this.pyodide = pyodide;
    this.gameWorld = new GameWorld();
  }

  /**
   * Get the GameWorld instance for external access
   */
  getGameWorld(): GameWorld {
    return this.gameWorld;
  }

  /**
   * Load next level (preserve score, increment level)
   * @param autoStart If true, automatically start playing. If false, wait for beginGame() call.
   */
  async loadNextLevel(autoStart: boolean = true): Promise<void> {
    console.log('[Engine] Loading next level...');
    
    const currentScore = this.gameWorld.getGameState().score;
    const currentLevel = this.gameWorld.getGameState().level;
    
    this.stop();
    
    // Reset world but preserve progress (score and level)
    this.gameWorld.reset(/* preserveProgress */ true);
    
    // Increment level and add bonus
    this.gameWorld.setLevel(currentLevel + 1);
    this.gameWorld.setScore(currentScore + 1000); // Level bonus
    
    // Load new level
    await this.load();
    
    // Sync to HotState
    syncToHotStateSystem(this.gameWorld);
    
    console.log('[Engine] Next level loaded');
    
    if (autoStart) {
      // Automatically start playing (for debug key)
      console.log('[Engine] Auto-starting game...');
      this.gameWorld.setGameStatus(GameStatus.PLAYING);
      this.start();
    } else {
      // Wait for React to call beginGame() (for VictoryScreen flow)
      console.log('[Engine] Waiting for beginGame() call...');
      // Status is already READY from load()
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COMMAND METHODS (called from React via GameWorldContext)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Start a new game (load maze and initialize entities)
   */
  async startNewGame(): Promise<void> {
    console.log('[Engine] Starting new game...');
    this.stop();
    this.gameWorld.reset();
    this.gameWorld.setGameStatus(GameStatus.LOADING);
    
    await this.load();
    
    console.log('[Engine] New game loaded, ready to begin');
  }

  /**
   * Begin playing the game (start game loop)
   */
  beginGame(): void {
    const currentStatus = this.gameWorld.getGameState().status;
    if (currentStatus !== GameStatus.READY) {
      console.warn('[Engine] Cannot begin game - not in READY state, current:', currentStatus);
      return;
    }
    this.gameWorld.setGameStatus(GameStatus.PLAYING);
    this.start();
    console.log('[Engine] Game started!');
  }

  /**
   * Pause the game
   */
  pauseGame(): void {
    if (this.gameWorld.getGameState().status !== GameStatus.PLAYING) {
      return;
    }
    this.isRunning = false;
    this.gameWorld.setGameStatus(GameStatus.PAUSED);
    
    // Sync to HotState immediately so React UI updates
    syncToHotStateSystem(this.gameWorld);
    
    console.log('[Engine] Game paused');
  }

  /**
   * Resume the game
   */
  resumeGame(): void {
    if (this.gameWorld.getGameState().status !== GameStatus.PAUSED) {
      return;
    }
    this.gameWorld.setGameStatus(GameStatus.PLAYING);
    
    // Sync to HotState before starting
    syncToHotStateSystem(this.gameWorld);
    
    this.start();
    console.log('[Engine] Game resumed');
  }

  /**
   * Restart the game
   */
  async restartGame(): Promise<void> {
    console.log('[Engine] Restarting game...');
    await this.startNewGame();
    
    // Sync LOADING state to HotState
    syncToHotStateSystem(this.gameWorld);
    
    this.beginGame();
  }

  /**
   * Exit to menu
   */
  exitToMenu(): void {
    console.log('[Engine] Exiting to menu...');
    this.stop();
    this.gameWorld.reset();
    
    // Sync reset state to HotState
    syncToHotStateSystem(this.gameWorld);
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
        case 'n':
          // Debug: Skip to next level (only works when playing)
          if (this.gameWorld.getGameState().status === GameStatus.PLAYING) {
            console.log('[Engine] Debug: Forcing instant level transition...');
            this.loadNextLevel(true).catch(err => {
              console.error('[Engine] Error loading next level:', err);
            });
          }
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
    const defaults = gameDefaults.pacman;
    const baseSpeed = gameDefaults.movement.baseSpeed;

    this.gameWorld.createEntity(PACMAN_ENTITY_ID);
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_TAG, {
      _tag: 'player' as const
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.TIMER, {
      elapsed: 0,
      interval: defaults.movementInterval,
      isTimeToMove: false
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.CONTINUOUS_POSITION, {
      x: defaults.initialPosition.x,
      y: defaults.initialPosition.y
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.DISCRETE_POSITION, {
      x: defaults.initialPosition.x,
      y: defaults.initialPosition.y
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_SPEED, {
      current: baseSpeed,
      base: baseSpeed
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.MOVEMENT_INTENT, {
      direction: null
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_INTENT, {
      desiredDirection: null,
      lastValidDirection: null
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.ALIGNMENT_STATE, {
      isAligned: true,
      aligningDirection: null
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.HEALTH, {
      current: defaults.initialHealth,
      max: defaults.initialHealth
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.INVULNERABILITY, {
      ticksRemaining: 0
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.COLLECTOR, {
      canCollect: [CollectableKind.PAC_DOT, CollectableKind.POWER_PELLET]
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYABLE, {
      _tag: 'playable' as const
    });

    if (DEBUG_LOG_GAME_WORLD) {
      console.log('[GameWorld] Pacman entity created:', PACMAN_ENTITY_ID);
    }
  }

  private initGhostsEntities(): void {
    const GHOST_MOVEMENT_INTERVAL = 250;

    createGhostEntity(
      this.gameWorld,
      BLINKY_ENTITY_ID,
      GhostBehaviorKind.BLINKY,
      STARTING_POSITIONS.BLINKY as Position,
      GHOST_MOVEMENT_INTERVAL,
      0
    );

    createGhostEntity(
      this.gameWorld,
      PINKY_ENTITY_ID,
      GhostBehaviorKind.PINKY,
      STARTING_POSITIONS.PINKY as Position,
      GHOST_MOVEMENT_INTERVAL,
      15
    );

    createGhostEntity(
      this.gameWorld,
      INKY_ENTITY_ID,
      GhostBehaviorKind.INKY,
      STARTING_POSITIONS.INKY as Position,
      GHOST_MOVEMENT_INTERVAL,
      30
    );

    createGhostEntity(
      this.gameWorld,
      CLYDE_ENTITY_ID,
      GhostBehaviorKind.CLYDE,
      STARTING_POSITIONS.CLYDE as Position,
      GHOST_MOVEMENT_INTERVAL,
      45
    );

    if (DEBUG_LOG_GAME_WORLD) {
      console.log('[GameWorld] 4 ghost entities created');
    }
  }

  private async initMazeEntities(): Promise<void> {
    const mazeTiles = await generateMaze(this.pyodide);
    const WALL = 1;
    const HOUSE = -3;
    const PAC_DOT = 0;
    const POWER_PELLET = 2;
    let pacDotCounter = 0;
    let powerPelletCounter = 0;

    this.gameWorld.clearSpatialGrids();

    if (!mazeTiles) {
      console.error('Failed to load maze tiles');
      throw new Error('Maze tiles not found');
    }

    mazeTiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === WALL) {
          this.gameWorld.addWall(x, y);
        } else if (tile === PAC_DOT) {
          this.gameWorld.addCollectable(x, y, CollectableKind.PAC_DOT);
          pacDotCounter++;
        } else if (tile === POWER_PELLET) {
          this.gameWorld.addCollectable(x, y, CollectableKind.POWER_PELLET);
          powerPelletCounter++;
        } else if (tile === HOUSE) {
          this.gameWorld.addHouseTile(x, y);
        }
      });
    });

    this.gameWorld.initializeMazeInfo(pacDotCounter, powerPelletCounter);
    this.gameWorld.setMazeLoaded(true);

    // Initialize floor tiles in HotState for rendering (once, never updated)
    const floorTiles = new Set<`${number},${number}`>();
    this.gameWorld.getPacDots().forEach(key => floorTiles.add(key));
    this.gameWorld.getPowerPellets().forEach(key => floorTiles.add(key));
    useHotState.getState().initializeFloorTiles(floorTiles);
    console.log(`[Engine] Initialized ${floorTiles.size} floor tiles in HotState`);

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

  async load(): Promise<void> {
    // Preload all world configs before starting game (only once)
    if (this.gameWorld.getGameState().level === 1) {
      await preloadAllWorldConfigs();
      console.log('[Engine] World configs preloaded');
    }
    
    await this.initMazeEntities();
    console.log('[Engine] Maze entities initialized');
    this.setupKeyboardListeners();
    console.log('[Engine] Keyboard listeners set up');
    this.initPacmanEntity();
    console.log('[Engine] Pacman entity initialized');
    this.initGhostsEntities();
    console.log('[Engine] Ghosts entities initialized');
    this.gameWorld.setGameStatus(GameStatus.READY);
    console.log('[Engine] Core loaded!');
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
      // Engine stopped - check if we need to perform any transitions
      const gameState = this.gameWorld.getGameState();
      
      switch (gameState.status) {
        case GameStatus.WON:
          // Level completed - stop and sync to show VictoryScreen
          // React will handle the transition by calling startNextLevel()
          this.stop();
          syncToHotStateSystem(this.gameWorld);
          break;
        
        case GameStatus.PLAYING:
          // Resume requested
          this.start();
          break;
          
        default:
          // Stay stopped
          break;
      }
      
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
      return;
    }
    
    // Check if game should pause
    const currentStatus = this.gameWorld.getGameState().status;
    if (currentStatus !== GameStatus.PLAYING) {
      this.stop();
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
      return;
    }

    // Game is running and playing - execute game loop
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Game is running and playing - execute systems pipeline

    // PHASE 1: INPUT CAPTURE
    inputCaptureSystem(this.gameWorld, this.keyState);

    // PHASE 2: PLAYER INTENT (decision system)
    playerIntentSystem(this.gameWorld);

    // PHASE 3: MOVEMENT (physics)
    continuousMovementSystem(this.gameWorld, deltaTime);
    alignmentSystem(this.gameWorld, deltaTime);
    discretePositionSyncSystem(this.gameWorld);

    // PHASE 4: GHOSTS
    // New ECS ghost systems
    const currentLevel = this.gameWorld.getGameState().level;
    ghostBehaviorModeSystem(this.gameWorld, currentLevel);
    ghostTargetingSystem(this.gameWorld);
    ghostDirectionSystem(this.gameWorld);
    movementSystem(deltaTime, this.gameWorld); // Discrete movement for ghosts

    // PHASE 5: COLLISIONS & EFFECTS
    // New ECS collision and effects systems
    entityCollisionSystem(this.gameWorld);
    collectionDetectionSystem(this.gameWorld);
    damageSystem(this.gameWorld);
    collectionEffectSystem(this.gameWorld);
    powerPelletEffectSystem(this.gameWorld);
    invulnerabilityTickSystem(this.gameWorld);

    timerUpdateSystem(this.gameWorld, deltaTime);

    // PHASE 5b: TIMER TICKS (decrement behavior timers)
    behaviorTimerTickSystem(this.gameWorld);

    // PHASE 6: GAME STATE CONDITIONS
    victoryConditionSystem(this.gameWorld);
    defeatConditionSystem(this.gameWorld);

    // PHASE 7: SYNC TO HOT STATE
    syncToHotStateSystem(this.gameWorld);

    // PHASE 8: CLEANUP
    cleanupEventsSystem(this.gameWorld);

    if (DEBUG_LOG_GAME_WORLD) {
      console.log('[GameWorld] Frame complete:', this.gameWorld.debugGetFullState());
    }

    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}
