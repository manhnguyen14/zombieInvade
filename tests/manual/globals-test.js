
import { Game } from '../../src/core/game.js';
import { ServiceLocator } from '../../src/core/service-locator.js';

// Global variables
let game;
let renderer;
let inputHandler;
let entityManager;
let eventBus;
let player;
let systems = {};
let selectedEntity;
let bonusService;


// Export globals for other modules to use
export const globals = {
    get game() { return game; },
    get renderer() { return renderer; },
    get inputHandler() { return inputHandler; },
    get entityManager() { return entityManager; },
    get eventBus() { return eventBus; },
    get systems() { return systems; },
    get selectedEntity() { return selectedEntity; },
    get bonusService() { return bonusService; },
    get player() { return player; },
    set selectedEntity(entity) { selectedEntity = entity; }
};

export function initGlobals(canvas) {
    console.log('[GLOBALS_TEST] Initializing globals...');
    // Initialize the game with configuration
    const gameConfig = {
        canvas: canvas,
        width: 800,
        height: 600,
        debugMode: true
    };

    // Create the game
    game = new Game(gameConfig);

    // Register the game instance with the service locator
    ServiceLocator.registerService('game', game);

    // Initialize the game with a player and no soldiers
    game.initializeGame({createPlayer: true, initialSoldiers: 0});

    // store player in globals for easy access
    player = game.player;

    // Get services from the service locator
    renderer = ServiceLocator.getService('renderer');
    inputHandler = ServiceLocator.getService('input');
    entityManager = ServiceLocator.getService('entityManager');
    eventBus = ServiceLocator.getService('eventBus');
    bonusService = ServiceLocator.getService('bonusService');
}