import { movementSystem } from "./systems/discreteMovementSystem";
import { generateMaze, MEDALLION_TILE_CHARS } from "./mazeGen";
import { useHotState } from "@/state/useHotState";
import type { Position } from "@custom-types/gameComponents";
import GameStatus from "@custom-types/gameStatus";
import { CollectableKind } from "@custom-types/gameComponents";
import type { PyodideInterface } from "pyodide";
import { preloadAllWorldConfigs } from "@core/worldConfigLoader";

// New ECS Architecture imports
import { GameWorld } from "./GameWorld";
import { DEBUG_LOG_GAME_WORLD } from "@config/featureFlags";
import { ComponentType, PACMAN_ENTITY_ID } from "@custom-types/componentTypes";
import gameDefaults from "@config/gameDefaults.json";
import { createEchoEntity, createPacmanEntity } from "./entityFactory";
import { setupKeyboardListeners, type KeyState } from "./keyboardListeners";
import { EchoBehaviorKind } from "@custom-types/gameComponents";
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
//import { superDashSystem } from "./systems/superDashSystem";
import { invulnerabilityTickSystem } from "./systems/invulnerabilityTickSystem";
import { victoryConditionSystem } from "./systems/victoryConditionSystem";
import { defeatConditionSystem } from "./systems/defeatConditionSystem";
import { cleanupEventsSystem } from "./systems/cleanupEventsSystem";
import { echoBehaviorModeSystem } from "./systems/echoBehaviorModeSystem";
import { echoTargetingSystem } from "./systems/echoTargetingSystem";
import { echoEatenSystem } from "./systems/echoEatenSystem";
import { playerAttributeSystem } from "./systems/playerAttributeSystem";

export class RusticGameEngine {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private keyState: KeyState = {
    up: false,
    down: false,
    left: false,
    right: false,
    dash: false,
    useWnb: false,
    prevMedallion: false,
    nextMedallion: false,
    activateAbility: false,
  };
  private teardownKeyboardListeners: (() => void) | null = null;
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

  private async initMazeEntities(): Promise<void> {
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
    this.gameWorld.getMedallions().forEach((_kind, key) => floorTiles.add(key));
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

    createPacmanEntity(this.gameWorld, chompPosition);
    console.log("[Engine] Pacman entity initialized");
  }

  async load(): Promise<void> {
    // Preload all world configs before starting game (only once)
    if (this.gameWorld.getGameState().level === 1) {
      await preloadAllWorldConfigs();
      console.log("[Engine] World configs preloaded");
    }

    await this.initMazeEntities();
    console.log("[Engine] Maze entities initialized");
    if (!this.teardownKeyboardListeners) {
      this.teardownKeyboardListeners = setupKeyboardListeners(
        this.keyState,
        () => {
          if (this.gameWorld.getGameState().status === GameStatus.PLAYING) {
            console.log("[Engine] Debug: Forcing instant level transition...");
            this.loadNextLevel(true).catch((err) => {
              console.error("[Engine] Error loading next level:", err);
            });
          }
        },
      );
    }
    console.log("[Engine] Keyboard listeners set up");
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

  /**
   * Destroy the engine: halt the game loop and remove all event listeners.
   * Must be called when the owning React component unmounts.
   */
  destroy(): void {
    this.stop();
    this.teardownKeyboardListeners?.();
    this.teardownKeyboardListeners = null;
    console.log("[Engine] Destroyed");
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

    // PHASE 4: ECHOS
    // ECS echo systems
    echoBehaviorModeSystem(this.gameWorld);
    echoTargetingSystem(this.gameWorld);
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
    //superDashSystem(this.gameWorld); Unsupported for now
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
