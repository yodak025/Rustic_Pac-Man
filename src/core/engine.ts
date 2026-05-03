import { movementSystem } from "./systems/discreteMovementSystem";
import { generateMaze, MEDALLION_TILE_CHARS } from "./mazeGen";
import { useHotState } from "@/state/useHotState";
import type { Position } from "@custom-types/gameComponents";
import GameStatus from "@custom-types/gameStatus";
import * as config from "@/config/defaultPositions.json";
import { CollectableKind } from "@custom-types/gameComponents";
import type { PyodideInterface } from "pyodide";
import { preloadAllWorldConfigs } from "@core/worldConfigLoader";

// New ECS Architecture imports
import { GameWorld } from "./GameWorld";
import { DEBUG_LOG_GAME_WORLD } from "@config/featureFlags";
import {
  ComponentType,
  PACMAN_ENTITY_ID,
  BLINKY_ENTITY_ID,
  PINKY_ENTITY_ID,
  INKY_ENTITY_ID,
  CLYDE_ENTITY_ID,
} from "@custom-types/componentTypes";
import gameDefaults from "@config/gameDefaults.json";
import { createGhostEntity, createEchoEntity } from "./entityFactory";
import {
  GhostBehaviorKind,
  EchoBehaviorKind,
} from "@custom-types/gameComponents";
import { SINUSOID_CONFIG } from "@config/echoConfig";

// ECS Systems
import { inputCaptureSystem } from "./systems/inputCaptureSystem";
import { playerIntentSystem } from "./systems/playerIntentSystem";
import { playerAbilityInputSystem } from "./systems/playerAbilityInputSystem";
import { continuousMovementSystem } from "./systems/continuousMovementSystem";
import { alignmentSystem } from "./systems/alignmentSystem";
import { discretePositionSyncSystem } from "./systems/discretePositionSyncSystem";
import { dashEnergySystem } from "./systems/dashEnergySystem";
import { dashSystem } from "./systems/dashSystem";
import { syncToHotStateSystem } from "./systems/syncToHotStateSystem";
import { ghostBehaviorModeSystem } from "./systems/ghostBehaviorModeSystem";
import { ghostTargetingSystem } from "./systems/ghostTargetingSystem";
import { targetBasedDirectionSystem } from "./systems/targetBasedDirectionSystem";
import { behaviorTimerTickSystem } from "./systems/behaviorTimerTickSystem";
import { timerUpdateSystem } from "./systems/timerUpdateSystem";
import { entityCollisionSystem } from "./systems/entityCollisionSystem";
import { collectionDetectionSystem } from "./systems/collectionDetectionSystem";
import { damageSystem } from "./systems/damageSystem";
import { collectionEffectSystem } from "./systems/collectionEffectSystem";
import { wnoiseActivateSystem } from "./systems/wnoiseActivateSystem";
import { medallionChargeSystem } from "./systems/medallionChargeSystem";
import { medallionActivateSystem } from "./systems/medallionActivateSystem";
import { superDashSystem } from "./systems/superDashSystem";
import { invulnerabilityTickSystem } from "./systems/invulnerabilityTickSystem";
import { victoryConditionSystem } from "./systems/victoryConditionSystem";
import { defeatConditionSystem } from "./systems/defeatConditionSystem";
import { cleanupEventsSystem } from "./systems/cleanupEventsSystem";
import { echoBehaviorModeSystem } from "./systems/echoBehaviorModeSystem";
import { echoTargetingSystem } from "./systems/echoTargetingSystem";
import { echoEatenSystem } from "./systems/echoEatenSystem";
import { playerAttributeSystem } from "./systems/playerAttributeSystem";
import { MEDALLION_ATTRIBUTES } from "@config/medallionAttributes";

const STARTING_POSITIONS = config.DEFAULT_POSITIONS.HOME;

export class RusticGameEngine {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyState = {
    w: false,
    a: false,
    s: false,
    d: false,
    m: false,
    comma: false,
    j: false,
    k: false,
    dot: false,
  };
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
    console.log("[Engine] Loading next level...");

    const currentScore = this.gameWorld.getGameState().score;
    const currentLevel = this.gameWorld.getGameState().level;

    // Persist ability state before reset so initPacmanEntity restores it next level
    const medallionRack = this.gameWorld.getComponent(
      PACMAN_ENTITY_ID,
      ComponentType.MEDALLION_RACK,
    );
    const essenceBar = this.gameWorld.getComponent(
      PACMAN_ENTITY_ID,
      ComponentType.ESSENCE_BAR,
    );
    const health = this.gameWorld.getComponent(
      PACMAN_ENTITY_ID,
      ComponentType.HEALTH,
    );
    const dashState = this.gameWorld.getComponent(
      PACMAN_ENTITY_ID,
      ComponentType.DASH_STATE,
    );
    const wnbStock = this.gameWorld.getComponent(
      PACMAN_ENTITY_ID,
      ComponentType.WNB_STOCK,
    );
    if (medallionRack && essenceBar) {
      this.gameWorld.updateProgressState({
        medallionRack: {
          slots: medallionRack.slots.map((s) => ({ ...s })),
          selectedIndex: medallionRack.selectedIndex,
        },
        essenceBar: { ...essenceBar },
        health: health ? health.current : gameDefaults.pacman.initialHealth,
        dashEnergy: dashState ? dashState.energy : 0,
        wnbStock: wnbStock ? wnbStock.count : 0,
      });
    }

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

    console.log("[Engine] Next level loaded");

    if (autoStart) {
      // Automatically start playing (for debug key)
      console.log("[Engine] Auto-starting game...");
      this.gameWorld.setGameStatus(GameStatus.PLAYING);
      this.start();
    } else {
      // Wait for React to call beginGame() (for VictoryScreen flow)
      console.log("[Engine] Waiting for beginGame() call...");
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
    console.log("[Engine] Starting new game...");
    this.stop();
    this.gameWorld.reset();
    this.gameWorld.setGameStatus(GameStatus.LOADING);

    await this.load();

    console.log("[Engine] New game loaded, ready to begin");
  }

  /**
   * Begin playing the game (start game loop)
   */
  beginGame(): void {
    const currentStatus = this.gameWorld.getGameState().status;
    if (currentStatus !== GameStatus.READY) {
      console.warn(
        "[Engine] Cannot begin game - not in READY state, current:",
        currentStatus,
      );
      return;
    }
    this.gameWorld.setGameStatus(GameStatus.PLAYING);
    this.start();
    console.log("[Engine] Game started!");
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

    console.log("[Engine] Game paused");
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
    console.log("[Engine] Game resumed");
  }

  /**
   * Restart the game
   */
  async restartGame(): Promise<void> {
    console.log("[Engine] Restarting game...");
    await this.startNewGame();

    // Sync LOADING state to HotState
    syncToHotStateSystem(this.gameWorld);

    this.beginGame();
  }

  /**
   * Exit to menu
   */
  exitToMenu(): void {
    console.log("[Engine] Exiting to menu...");
    this.stop();
    this.gameWorld.reset();

    // Sync reset state to HotState
    syncToHotStateSystem(this.gameWorld);
  }

  private setupKeyboardListeners(): void {
    window.addEventListener("keydown", (event) => {
      switch (event.key.toLowerCase()) {
        case "w":
          this.keyState.w = true;
          break;
        case "a":
          this.keyState.a = true;
          break;
        case "s":
          this.keyState.s = true;
          break;
        case "d":
          this.keyState.d = true;
          break;
        case "m":
          this.keyState.m = true;
          break;
        case ",":
          this.keyState.comma = true;
          break;
        case "j":
          this.keyState.j = true;
          break;
        case "k":
          this.keyState.k = true;
          break;
        case ".":
          this.keyState.dot = true;
          break;
        case "n":
          // Debug: Skip to next level (only works when playing)
          if (this.gameWorld.getGameState().status === GameStatus.PLAYING) {
            console.log("[Engine] Debug: Forcing instant level transition...");
            this.loadNextLevel(true).catch((err) => {
              console.error("[Engine] Error loading next level:", err);
            });
          }
          break;
      }
    });

    window.addEventListener("keyup", (event) => {
      switch (event.key.toLowerCase()) {
        case "w":
          this.keyState.w = false;
          break;
        case "a":
          this.keyState.a = false;
          break;
        case "s":
          this.keyState.s = false;
          break;
        case "d":
          this.keyState.d = false;
          break;
        case "m":
          this.keyState.m = false;
          break;
        case ",":
          this.keyState.comma = false;
          break;
        case "j":
          this.keyState.j = false;
          break;
        case "k":
          this.keyState.k = false;
          break;
        case ".":
          this.keyState.dot = false;
          break;
      }
    });
  }

  private initPacmanEntity(initialPosition: Position): void {
    const defaults = gameDefaults.pacman;
    const baseSpeed = gameDefaults.movement.baseSpeed;

    this.gameWorld.createEntity(PACMAN_ENTITY_ID);
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_TAG, {
      _tag: "player" as const,
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.TIMER, {
      elapsed: 0,
      interval: defaults.movementInterval,
      baseInterval: defaults.movementInterval,
      isTimeToMove: false,
    });
    this.gameWorld.addComponent(
      PACMAN_ENTITY_ID,
      ComponentType.CONTINUOUS_POSITION,
      {
        x: initialPosition.x,
        y: initialPosition.y,
      },
    );
    this.gameWorld.addComponent(
      PACMAN_ENTITY_ID,
      ComponentType.DISCRETE_POSITION,
      {
        x: initialPosition.x,
        y: initialPosition.y,
      },
    );
    this.gameWorld.addComponent(
      PACMAN_ENTITY_ID,
      ComponentType.MOVEMENT_SPEED,
      {
        current: baseSpeed,
        base: baseSpeed,
      },
    );
    this.gameWorld.addComponent(
      PACMAN_ENTITY_ID,
      ComponentType.MOVEMENT_INTENT,
      {
        direction: null,
      },
    );
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_INTENT, {
      desiredDirection: null,
      lastValidDirection: null,
    });
    this.gameWorld.addComponent(
      PACMAN_ENTITY_ID,
      ComponentType.ALIGNMENT_STATE,
      {
        isAligned: true,
        aligningDirection: null,
      },
    );

    // Ability components — restore from progressState (persists between levels)
    const progress = this.gameWorld.getProgressState();
    const abilityCfg = gameDefaults.abilities;

    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.HEALTH, {
      current: progress.health,
      max: defaults.initialHealth,
    });
    this.gameWorld.addComponent(
      PACMAN_ENTITY_ID,
      ComponentType.INVULNERABILITY,
      {
        ticksRemaining: 0,
      },
    );
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.COLLECTOR, {
      canCollect: [
        CollectableKind.ESSENCE,
        CollectableKind.WHITE_NOISE_BALL,
        CollectableKind.MEDALLION_HEALTH,
        CollectableKind.MEDALLION_STEALTH,
        CollectableKind.MEDALLION_VISION,
        CollectableKind.MEDALLION_SHOUT,
        CollectableKind.MEDALLION_SPEED,
        CollectableKind.MEDALLION_ESSENCE,
        CollectableKind.POWER_UP_SUPER_DASH,
      ],
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYABLE, {
      _tag: "playable" as const,
    });

    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.DASH_STATE, {
      energy: progress.dashEnergy,
      maxEnergy: abilityCfg.dash.maxEnergy,
      isDashing: false,
      dashTimeRemaining: 0,
      cooldownTimeRemaining: 0,
    });
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.WNB_STOCK, {
      count: progress.wnbStock,
    });
    this.gameWorld.addComponent(
      PACMAN_ENTITY_ID,
      ComponentType.MEDALLION_RACK,
      {
        slots: [...progress.medallionRack.slots.map((s) => ({ ...s }))],
        selectedIndex: progress.medallionRack.selectedIndex,
      },
    );
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.ESSENCE_BAR, {
      current: progress.essenceBar.current,
      max: progress.essenceBar.max,
      activePowerUp: progress.essenceBar.activePowerUp,
    });
    this.gameWorld.addComponent(
      PACMAN_ENTITY_ID,
      ComponentType.PLAYER_ABILITY_INPUT,
      {
        dash: false,
        useWnb: false,
        prevMedallion: false,
        nextMedallion: false,
        activateAbility: false,
      },
    );

    // Derived stats — level-0 values from MEDALLION_ATTRIBUTES (recalculated each frame)
    this.gameWorld.addComponent(PACMAN_ENTITY_ID, ComponentType.PLAYER_STATS, {
      agroRadius: MEDALLION_ATTRIBUTES.agroRadiusPerLevel[0],
      visionRadius: MEDALLION_ATTRIBUTES.visionRadiusPerLevel[0],
      frightDuration: MEDALLION_ATTRIBUTES.frightDurationPerLevel[0],
      speedMultiplier: MEDALLION_ATTRIBUTES.speedMultiplierPerLevel[0],
      essenceMultiplier: MEDALLION_ATTRIBUTES.essenceMultiplierPerLevel[0],
      dashMaxEnergy: MEDALLION_ATTRIBUTES.dashMaxEnergyPerLevel[0],
    });

    if (DEBUG_LOG_GAME_WORLD) {
      console.log(
        "[GameWorld] Pacman entity created at position:",
        initialPosition,
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GHOST INITIALIZATION (Currently disabled - kept for future use)
  // ══════════════════════════════════════════════════════════════════════════

  private initGhostsEntities(): void {
    const GHOST_MOVEMENT_INTERVAL = 250;

    createGhostEntity(
      this.gameWorld,
      BLINKY_ENTITY_ID,
      GhostBehaviorKind.BLINKY,
      STARTING_POSITIONS.BLINKY as Position,
      GHOST_MOVEMENT_INTERVAL,
      0,
    );

    createGhostEntity(
      this.gameWorld,
      PINKY_ENTITY_ID,
      GhostBehaviorKind.PINKY,
      STARTING_POSITIONS.PINKY as Position,
      GHOST_MOVEMENT_INTERVAL,
      15,
    );

    createGhostEntity(
      this.gameWorld,
      INKY_ENTITY_ID,
      GhostBehaviorKind.INKY,
      STARTING_POSITIONS.INKY as Position,
      GHOST_MOVEMENT_INTERVAL,
      30,
    );

    createGhostEntity(
      this.gameWorld,
      CLYDE_ENTITY_ID,
      GhostBehaviorKind.CLYDE,
      STARTING_POSITIONS.CLYDE as Position,
      GHOST_MOVEMENT_INTERVAL,
      45,
    );

    if (DEBUG_LOG_GAME_WORLD) {
      console.log("[GameWorld] 4 ghost entities created");
    }
  }

  private async initMazeEntities(): Promise<Position> {
    const mazeResult = await generateMaze(this.pyodide);

    // ASCII tile character constants
    const TILE_ESSENCE = ".";
    const TILE_WALL = "|";
    const TILE_CHOMP = "c";
    const TILE_ECHO = "x";
    const TILE_WNB = "o";
    const TILE_POWER_UP = "p";
    // Note: TILE_EMPTY ('_') is not processed - empty tiles are ignored

    /** Reverse mapping: tile char → CollectableKind for the 5 medallion tiles */
    const MEDALLION_CHAR_TO_KIND: Record<string, CollectableKind> = {
      [MEDALLION_TILE_CHARS.STEALTH]: CollectableKind.MEDALLION_STEALTH,
      [MEDALLION_TILE_CHARS.VISION]: CollectableKind.MEDALLION_VISION,
      [MEDALLION_TILE_CHARS.SHOUT]: CollectableKind.MEDALLION_SHOUT,
      [MEDALLION_TILE_CHARS.SPEED]: CollectableKind.MEDALLION_SPEED,
      [MEDALLION_TILE_CHARS.ESSENCE]: CollectableKind.MEDALLION_ESSENCE,
    };

    let essenceCounter = 0;
    let wnbCounter = 0;
    let echoCounter = 0;
    let chompPosition: Position | null = null;

    this.gameWorld.clearSpatialGrids();

    if (!mazeResult || !mazeResult.tilemap) {
      console.error("Failed to load maze tiles");
      throw new Error("Maze tiles not found");
    }

    // Process ASCII tilemap
    mazeResult.tilemap.forEach((row: string[], y: number) => {
      row.forEach((tile: string, x: number) => {
        if (tile === TILE_WALL) {
          this.gameWorld.addWall(x, y);
        } else if (tile === TILE_ESSENCE) {
          this.gameWorld.addCollectable(x, y, CollectableKind.ESSENCE);
          essenceCounter++;
        } else if (tile === TILE_WNB) {
          this.gameWorld.addCollectable(x, y, CollectableKind.WHITE_NOISE_BALL);
          wnbCounter++;
        } else if (tile === TILE_CHOMP) {
          // Mark chomp spawn position
          chompPosition = { x, y };
          // Add essence at chomp position so it's walkable
          this.gameWorld.addCollectable(x, y, CollectableKind.ESSENCE);
          essenceCounter++;
        } else if (tile === TILE_ECHO) {
          // Echo spawn position - create echo entity
          const echoId = `echo_${echoCounter}`;
          createEchoEntity(
            this.gameWorld,
            echoId,
            EchoBehaviorKind.SINUSOID,
            { x, y },
            SINUSOID_CONFIG.MOVEMENT_INTERVAL,
          );
          echoCounter++;
          // Add essence at echo position so it's walkable
          this.gameWorld.addCollectable(x, y, CollectableKind.ESSENCE);
          essenceCounter++;
        } else if (MEDALLION_CHAR_TO_KIND[tile] !== undefined) {
          // Dedicated medallion tile — char directly encodes the kind
          this.gameWorld.addCollectable(x, y, MEDALLION_CHAR_TO_KIND[tile]);
        } else if (tile === TILE_POWER_UP) {
          // Power Up tile — type resolved from maze metadata
          const powerUpKind = mazeResult.metadata.power_up_kinds?.[`${y},${x}`];
          if (powerUpKind === "SUPER_DASH") {
            this.gameWorld.addCollectable(
              x,
              y,
              CollectableKind.POWER_UP_SUPER_DASH,
            );
          }
        }
        // TILE_EMPTY ('_') is ignored - no tile added
      });
    });

    // Use chomp position from metadata if available, otherwise use detected position
    if (mazeResult.metadata.chomp_spawn) {
      const [row, col] = mazeResult.metadata.chomp_spawn;
      chompPosition = { x: col, y: row };
      console.log(`[Engine] Chomp spawn from metadata: (${col}, ${row})`);
    }

    if (!chompPosition) {
      console.error("No chomp spawn position found in maze");
      throw new Error("Chomp spawn position not found");
    }

    this.gameWorld.initializeMazeInfo(essenceCounter, wnbCounter);
    this.gameWorld.setMazeLoaded(true);

    // Initialize floor tiles in HotState for rendering (once, never updated)
    const floorTiles = new Set<`${number},${number}`>();
    this.gameWorld.getEssenceDots().forEach((key) => floorTiles.add(key));
    this.gameWorld.getWhiteNoiseBalls().forEach((key) => floorTiles.add(key));
    useHotState.getState().initializeFloorTiles(floorTiles);
    console.log(
      `[Engine] Initialized ${floorTiles.size} floor tiles in HotState`,
    );

    if (DEBUG_LOG_GAME_WORLD) {
      const stats = this.gameWorld.debugGetFullState().spatialData;
      console.log("[GameWorld] Maze initialized:", {
        walls: stats.wallCount,
        collectables: stats.collectableCount,
        house: stats.houseCount,
        essenceDots: essenceCounter,
        whiteNoiseBalls: wnbCounter,
        echos: echoCounter,
        chompSpawn: chompPosition,
      });
    }

    return chompPosition;
  }

  async load(): Promise<void> {
    // Preload all world configs before starting game (only once)
    if (this.gameWorld.getGameState().level === 1) {
      await preloadAllWorldConfigs();
      console.log("[Engine] World configs preloaded");
    }

    const chompSpawn = await this.initMazeEntities();
    console.log("[Engine] Maze entities initialized");
    this.setupKeyboardListeners();
    console.log("[Engine] Keyboard listeners set up");
    this.initPacmanEntity(chompSpawn);
    console.log("[Engine] Pacman entity initialized");
    // Ghosts disabled for now
    // this.initGhostsEntities();
    console.log("[Engine] Ghosts entities initialization skipped (disabled)");
    this.gameWorld.setGameStatus(GameStatus.READY);
    console.log("[Engine] Core loaded!");
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
    playerAbilityInputSystem(this.gameWorld, this.keyState);
    playerAttributeSystem(this.gameWorld); // Derive PLAYER_STATS from medallion levels

    // PHASE 2: PLAYER INTENT (decision system)
    playerIntentSystem(this.gameWorld);

    // PHASE 3: MOVEMENT (physics)
    dashEnergySystem(this.gameWorld, deltaTime); // Decrement dash timers, restore speed on expiry
    dashSystem(this.gameWorld); // Instant-tile dash
    continuousMovementSystem(this.gameWorld, deltaTime);
    alignmentSystem(this.gameWorld, deltaTime);
    discretePositionSyncSystem(this.gameWorld);

    // PHASE 4: GHOSTS & ECHOS
    // New ECS ghost systems
    const currentLevel = this.gameWorld.getGameState().level;
    ghostBehaviorModeSystem(this.gameWorld, currentLevel);
    ghostTargetingSystem(this.gameWorld);

    // New ECS echo systems
    echoBehaviorModeSystem(this.gameWorld);
    echoTargetingSystem(this.gameWorld);

    // Shared direction and movement systems
    targetBasedDirectionSystem(this.gameWorld);
    movementSystem(deltaTime, this.gameWorld); // Discrete movement for ghosts and echos

    // PHASE 5: COLLISIONS & EFFECTS
    // New ECS collision and effects systems
    entityCollisionSystem(this.gameWorld);
    collectionDetectionSystem(this.gameWorld);
    damageSystem(this.gameWorld);
    echoEatenSystem(this.gameWorld); // Process echo eaten events
    collectionEffectSystem(this.gameWorld);
    wnoiseActivateSystem(this.gameWorld);
    medallionChargeSystem(this.gameWorld);
    medallionActivateSystem(this.gameWorld);
    superDashSystem(this.gameWorld);
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
      console.log(
        "[GameWorld] Frame complete:",
        this.gameWorld.debugGetFullState(),
      );
    }

    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}
