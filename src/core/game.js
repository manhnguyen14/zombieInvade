/**
 * Game Class
 *
 * The main game controller that manages the game loop and coordinates
 * all game systems. It handles initialization, updates, and rendering.
 * 
 * The game uses a fixed time step of 1/12 seconds (12 updates per second)
 * for both game logic updates and rendering to create a retro effect.
 * This approach ensures consistent game behavior regardless of the actual frame rate,
 * and allows game mechanics like zombie attacks and movement to operate on a predictable schedule.
 * The limited frame rate of 12 FPS gives the game an authentic retro feel reminiscent of
 * early computer games.
 */

import { ServiceLocator } from './service-locator.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input-handler.js';
import { Timer } from './timer.js';
import { EventBus } from './event-bus.js';
import { EntityManager } from './entity-manager.js';
import { BonusService } from './bonus-service.js';
import { EntityFactory } from '../entities/entity-factory.js';
import { EffectSystem } from '../systems/effect-system.js';
import { BonusSystem } from '../systems/bonus-system.js';
import { RenderSystem } from '../systems/render-system.js';
import { EffectService } from './effect-service.js';
import { PlayerSoldierService } from './player-soldier-service.js';
import { LaneSystem } from '../systems/lane-system.js';
import { MovementSystem } from '../systems/movement-system.js';
import { CollisionSystem } from '../systems/collision-system.js';
import { DamageSystem } from '../systems/damage-system.js';
import { ShootingSystem } from '../systems/shooting-system.js';
import { AssetLoader } from './asset-loader.js';

export class Game {
    /**
     * Create a new Game instance
     * @param {Object} config - Configuration object
     * @param {HTMLCanvasElement} config.canvas - The canvas element
     * @param {number} config.width - Canvas width
     * @param {number} config.height - Canvas height
     * @param {Object} [config.finishLine] - Finish line configuration
     * @param {number} [config.finishLine.position] - Initial position of the finish line
     * @param {boolean} [config.finishLine.enabled] - Whether the finish line is enabled
     */
    constructor(config) {
        if (!config || !config.canvas) {
            throw new Error('Game requires a valid configuration with canvas element');
        }

        this.config = config;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTimestamp = 0;
        this.frameCount = 0;
        this.accumulatedTime = 0;
        this.debugMode = config.debugMode || false;
        this.systems = [];
        this.killCount = 0;
        this.escapedCount = 0;
        this.eventBus = null;
        
        // Player position tracking
        this.playerWorldPosition = 100; // Initial player position in world coordinates
        
        // Finish line configuration
        this.finishLine = {
            enabled: config.finishLine?.enabled || false,
            initialPosition: config.finishLine?.position || 0,
            currentPosition: config.finishLine?.position || 0,
            passed: false
        };

        // Initialize core systems
        this._initializeSystems();
    }

    /**
     * Initialize core game systems
     * @private
     */
    _initializeSystems() {
        // Check if renderer already exists
        let renderer;
        try {
            renderer = ServiceLocator.getService('renderer');
        } catch (e) {
            // Create renderer if it doesn't exist
            renderer = new Renderer({
                canvas: this.config.canvas,
                width: this.config.width,
                height: this.config.height
            });
            ServiceLocator.registerService('renderer', renderer);
        }
        this.renderer = renderer;

        // Check if input handler already exists
        let inputHandler;
        try {
            inputHandler = ServiceLocator.getService('input');
        } catch (e) {
            // Create input handler if it doesn't exist
            inputHandler = new InputHandler();
            ServiceLocator.registerService('input', inputHandler);
        }

        // Check if timer already exists
        let timer;
        try {
            timer = ServiceLocator.getService('timer');
        } catch (e) {
            // Create timer if it doesn't exist
            timer = new Timer();
            ServiceLocator.registerService('timer', timer);
        }

        // Check if event bus already exists
        let eventBus;
        try {
            eventBus = ServiceLocator.getService('eventBus');
        } catch (e) {
            // Create event bus if it doesn't exist
            eventBus = new EventBus();
            ServiceLocator.registerService('eventBus', eventBus);
        }
        this.eventBus = eventBus;

        // Check if entity manager already exists
        let entityManager;
        try {
            entityManager = ServiceLocator.getService('entityManager');
        } catch (e) {
            // Create entity manager if it doesn't exist
            entityManager = new EntityManager();
            ServiceLocator.registerService('entityManager', entityManager);
        }
        
        // Check if bonus service already exists
        let bonusService;
        try {
            bonusService = ServiceLocator.getService('bonusService');
        } catch (e) {
            // Create bonus service if it doesn't exist
            bonusService = new BonusService();
            ServiceLocator.registerService('bonusService', bonusService);
            bonusService.initialize();
        }

        // Check if effect service already exists
        let effectService;
        try {
            effectService = ServiceLocator.getService('effectService');
        } catch (e) {
            // Create and register effect service if it doesn't exist
            effectService = new EffectService();
            ServiceLocator.registerService('effectService', effectService);
            effectService.initialize();
        }

        // Check if player soldier service already exists
        try {
            ServiceLocator.getService('playerSoldierService');
        } catch (e) {
            // Register the PlayerSoldierService object (not a class)
            ServiceLocator.registerService('playerSoldierService', PlayerSoldierService);
        }

        let assetLoader;
        try {
            assetLoader = ServiceLocator.getService('assetLoader');
        } catch(e) {
                // Create asset loader if it doesn't exist
                assetLoader = new AssetLoader();
                ServiceLocator.registerService('assetLoader', assetLoader);
                assetLoader.loadAssets();
        }


            // Create and add core game systems if they don't exist
        
        // Lane system
        let laneSystem;
        try {
            laneSystem = ServiceLocator.getService('laneSystem');
        } catch (e) {
            laneSystem = new LaneSystem({
                laneCount: 9,
                laneHeight: 60,
                laneWidth: this.config.width,
                bonusLaneColor: '#1f1f1f',
                combatLaneColor: '#0d0d0d'
            });
            ServiceLocator.registerService('laneSystem', laneSystem);
            this.addSystem(laneSystem);
        }
        
        // Movement system
        let movementSystem;
        try {
            movementSystem = ServiceLocator.getService('movementSystem');
        } catch (e) {
            movementSystem = new MovementSystem();
            ServiceLocator.registerService('movementSystem', movementSystem);
            this.addSystem(movementSystem);
        }
        
        // Collision system
        let collisionSystem;
        try {
            collisionSystem = ServiceLocator.getService('collisionSystem');
        } catch (e) {
            collisionSystem = new CollisionSystem();
            ServiceLocator.registerService('collisionSystem', collisionSystem);
            this.addSystem(collisionSystem);
        }
        
        // Damage system
        let damageSystem;
        try {
            damageSystem = ServiceLocator.getService('damageSystem');
        } catch (e) {
            damageSystem = new DamageSystem();
            ServiceLocator.registerService('damageSystem', damageSystem);
            this.addSystem(damageSystem);
        }
        
        // Shooting system
        let shootingSystem;
        try {
            shootingSystem = ServiceLocator.getService('shootingSystem');
        } catch (e) {
            shootingSystem = new ShootingSystem();
            ServiceLocator.registerService('shootingSystem', shootingSystem);
            this.addSystem(shootingSystem);
        }
        
        // Render system
        let renderSystem;
        try {
            renderSystem = ServiceLocator.getService('renderSystem');
        } catch (e) {
            renderSystem = new RenderSystem();
            ServiceLocator.registerService('renderSystem', renderSystem);
            this.addSystem(renderSystem);
        }

        // Check if bonus system already exists
        let bonusSystem;
        try {
            bonusSystem = ServiceLocator.getService('bonusSystem');
            if (!this.systems.includes(bonusSystem)) {
                this.systems.push(bonusSystem);
            }
        } catch (e) {
            // Create bonus system if it doesn't exist
            bonusSystem = new BonusSystem();
            ServiceLocator.registerService('bonusSystem', bonusSystem);
            bonusSystem.initialize();
            this.systems.push(bonusSystem);
        }
        
        // Store references to systems for update loop if not already added
        if (!this.systems.includes(inputHandler)) {
            this.systems.push(inputHandler);
        }
        
        if (!this.systems.includes(timer)) {
            this.systems.push(timer);
        }
        
        // Check if effect system already exists
        let effectSystem;
        try {
            effectSystem = ServiceLocator.getService('effectSystem');
            if (!this.systems.includes(effectSystem)) {
                this.systems.push(effectSystem);
            }
        } catch (e) {
            // Create and add the effect system if it doesn't exist
            effectSystem = new EffectSystem();
            effectSystem.initialize();
            this.systems.push(effectSystem);
            ServiceLocator.registerService('effectSystem', effectSystem);
        }

        // Store reference to the effect system
        this.effectSystem = effectSystem;
    }
    
    /**
     * Initialize the game with a player
     * @param {Object} options - Initialization options
     * @param {boolean} options.createPlayer - Whether to create a player (default: true)
     * @param {number} options.initialSoldiers - Number of initial soldiers (default: 0)
     */
    initializeGame(options = {}) {
        const { createPlayer = true, initialSoldiers = 0 } = options;
        
        if (createPlayer) {
            // Create a player with the specified number of soldiers
            const entityManager = ServiceLocator.getService('entityManager');
            if (entityManager) {
                this.player = EntityFactory.createPlayer(entityManager, initialSoldiers);
                console.log(`Game initialized with player and ${initialSoldiers} soldiers`);
            }
        }
    }

    /**
     * Start the game loop
     */
    start(startPaused = false) {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.isPaused = startPaused;
        this.lastTimestamp = performance.now();
        this.frameCount = 0;

        // Start the game loop
        requestAnimationFrame(this._gameLoop.bind(this));

        // Dispatch start event if in debug mode
        if (this.debugMode && typeof window.dispatchEvent === 'function') {
            const startEvent = new CustomEvent('game:start', {
                detail: { paused: startPaused }
            });
            window.dispatchEvent(startEvent);
        }
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;

        // Dispatch stop event if in debug mode
        if (this.debugMode && typeof window.dispatchEvent === 'function') {
            const stopEvent = new CustomEvent('game:stop');
            window.dispatchEvent(stopEvent);
        }
    }

    /**
     * Pause the game loop
     */
    pause() {
        if (!this.isRunning || this.isPaused) return;

        this.isPaused = true;

        // Dispatch pause event if in debug mode
        if (this.debugMode && typeof window.dispatchEvent === 'function') {
            const pauseEvent = new CustomEvent('game:pause');
            window.dispatchEvent(pauseEvent);
        }
    }

    /**
     * Resume the game loop
     */
    resume() {
        if (!this.isRunning || !this.isPaused) return;

        this.isPaused = false;
        this.lastTimestamp = performance.now(); // Reset timestamp to avoid large delta

        // Dispatch resume event if in debug mode
        if (this.debugMode && typeof window.dispatchEvent === 'function') {
            const resumeEvent = new CustomEvent('game:resume');
            window.dispatchEvent(resumeEvent);
        }
    }

    /**
     * Step the game loop by one frame
     */
    step() {
        if (!this.isRunning || !this.isPaused) return;

        // Use the same fixed time step as the game loop (12 updates per second)
        const fixedTimeStep = 1/12;

        console.log("===== STEP: STARTING UPDATE OF ALL SYSTEMS =====");

        // Update ALL systems explicitly, not just through _update()
        for (const system of this.systems) {
            if (typeof system.update === 'function') {
                system.update(fixedTimeStep);
            }
        }

        console.log("===== STEP: FINISHED UPDATE OF ALL SYSTEMS =====");
        // Increment frame count
        this.frameCount++;

        // Dispatch step event if in debug mode
        if (this.debugMode && typeof window.dispatchEvent === 'function') {
            const stepEvent = new CustomEvent('game:step', {
                detail: { frameCount: this.frameCount, deltaTime: fixedTimeStep }
            });
            window.dispatchEvent(stepEvent);
        }
    }
    /**
     * The main game loop
     * @param {number} timestamp - The current timestamp
     * @private
     */
    _gameLoop(timestamp) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // Fixed time step for updates (12 updates per second)
        const fixedTimeStep = 1 / 12;

        // Only update if not paused
        if (!this.isPaused) {
            // Accumulate time since last update
            this.accumulatedTime = (this.accumulatedTime || 0) + deltaTime;

            // Update game state at fixed intervals
            let updated = false;
            while (this.accumulatedTime >= fixedTimeStep) {
                this._update(fixedTimeStep);
                this.accumulatedTime -= fixedTimeStep;
                updated = true;

                // Increment frame count only when an update occurs
                this.frameCount++;
            }

            // Dispatch frame event if in debug mode and an update occurred
            if (updated && this.debugMode && typeof window.dispatchEvent === 'function') {
                const frameEvent = new CustomEvent('game:frame', {
                    detail: { frameCount: this.frameCount, deltaTime: fixedTimeStep }
                });
                window.dispatchEvent(frameEvent);
            }
        }

        // Schedule next frame
        requestAnimationFrame(this._gameLoop.bind(this));
    }

    /**
     * Update all game systems
     * @param {number} deltaTime - Time elapsed since last update in seconds
     * @private
     */
    _update(deltaTime) {
        // Log update cycle (only if window.debugLog is defined)
        if (typeof window.debugLog === 'function') {
            window.debugLog(`Game update cycle: deltaTime=${deltaTime.toFixed(4)}s`);
        }

        // Update player world position based on game speed
        const speedController = ServiceLocator.getService('speedController');
        if (speedController) {
            const baseSpeed = speedController.getBaseSpeed();
            const speedModifier = speedController.getPlayerSpeedModifier();
            this.playerWorldPosition += deltaTime * (baseSpeed * speedModifier);
        }

        // Update finish line position
        this._updateFinishLinePosition(deltaTime);

        // Update all systems
        for (const system of this.systems) {
            if (typeof window.debugLog === 'function') {
                window.debugLog(`Updating system: ${system.name}`);
            }
            system.update(deltaTime);
        }

        // Check if player has passed the finish line
        this._checkFinishLine();

        if (typeof window.debugLog === 'function') {
            window.debugLog('Game update cycle completed');
        }
    }

    /**
     * Add a system to the game loop
     * @param {Object} system - The system to add
     */
    addSystem(system) {
        if (!system || typeof system.update !== 'function') {
            throw new Error('System must have an update method');
        }

        // Initialize the system if it has an initialize method
        if (typeof system.initialize === 'function') {
            system.initialize();
        }

        // Add the system to the list
        this.systems.push(system);

        // Sort systems by priority (higher priority systems update first)
        this.systems.sort((a, b) => {
            const priorityA = typeof a.getPriority === 'function' ? a.getPriority() : 0;
            const priorityB = typeof b.getPriority === 'function' ? b.getPriority() : 0;
            return priorityB - priorityA;
        });

        return system;
    }

    /**
     * Clean up resources when the game is destroyed
     */
    destroy() {
        this.stop();

        // Clean up systems
        for (const system of this.systems) {
            if (typeof system.destroy === 'function') {
                system.destroy();
            }
        }

        this.systems = [];

        // Clear services
        ServiceLocator.clearServices();

    }

    // Add a method to update the finish line position
    _updateFinishLinePosition(deltaTime) {
        if (!this.finishLine.enabled || this.finishLine.passed) return;
        
        // Get the speed controller
        let speedController;
        try {
            speedController = ServiceLocator.getService('speedController');
        } catch (e) {
            // If no speed controller, use default values
            const baseSpeed = 5;
            const speedModifier = 4;
            this.finishLine.currentPosition -= deltaTime * (baseSpeed * speedModifier);
            return;
        }
        
        // Calculate the effective speed
        const baseSpeed = speedController.getBaseSpeed();
        const speedModifier = speedController.getPlayerSpeedModifier();
        const effectiveSpeed = baseSpeed * speedModifier;
        
        // Update the finish line position
        this.finishLine.currentPosition -= deltaTime * effectiveSpeed;

    }

    // Update the method to check if player has passed the finish line
    _checkFinishLine() {
        if (!this.finishLine.enabled || this.finishLine.passed) return;
        
        // Player passes finish line when finish line position is less than 50
        if (this.finishLine.currentPosition < 50) {
            this.finishLine.passed = true;
            this._handleFinishLinePassed();
        }
    }

    // Method to handle when player passes the finish line
    _handleFinishLinePassed() {
        console.log('Player passed the finish line!');
        
        // Pause the game
        this.pause();
        
        // Publish game finished event using only the EventBus
        if (this.eventBus) {
            this.eventBus.publish('gameFinished', {
                result: 'victory',
                reason: 'finish_line_reached'
            });
        }
    }

    /**
     * Get the current finish line data for rendering
     * @returns {Object|null} Finish line data or null if disabled
     */
    getFinishLineData() {
        if (!this.finishLine.enabled) return null;
        
        return {
            position: this.finishLine.currentPosition,
            passed: this.finishLine.passed
        };
    }
}
