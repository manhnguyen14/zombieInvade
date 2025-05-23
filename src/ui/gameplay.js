import { Game } from '../core/game.js';
import { ServiceLocator } from '../core/service-locator.js';
import { EntityFactory } from '../entities/entity-factory.js';
import { EntityAdapter } from './entity-adapter.js';
import { PlayerAdapter } from './player-adapter.js';
import { MapStorage } from '../map-editor/storage/map-storage.js';

// Initialize managers
const mapStorage = new MapStorage();

// DOM elements
const canvas = document.getElementById('gameCanvas');
const mapNameElement = document.getElementById('mapName');
const playerInfoElement = document.getElementById('playerInfo');
const standardGrenadesElement = document.getElementById('standardGrenades');
const stickyGrenadesElement = document.getElementById('stickyGrenades');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const restartButton = document.getElementById('restartButton');
const exitButton = document.getElementById('exitButton');

// Game state
let game;
let currentMap;
let player;
let playerSpeedModifier = 1.0;
let enemyKillCount = 0;
let enemyEscapeCount = 0;
let timePassed = 0;
let timerInterval;

// Initialize the game
function initGame() {
    // Reset game state
    enemyKillCount = 0;
    enemyEscapeCount = 0;
    timePassed = 0;
    playerSpeedModifier = 1.0;
    
    // Load map data from localStorage
    const mapData = localStorage.getItem('currentPlayMap');
    if (!mapData) {
        alert('No map data found. Please select a map in the editor first.');
        window.location.href = 'home-screen.html';
        return;
    }
    
    try {
        currentMap = JSON.parse(mapData);
        mapNameElement.textContent = `Map: ${currentMap.name || 'Unnamed Map'}`;
        
        // Initialize createdObjectIds if it doesn't exist
        if (!currentMap.createdObjectIds) {
            currentMap.createdObjectIds = new Set();
        }
    } catch (e) {
        console.error('Error parsing map data:', e);
        alert('Error loading map data. Returning to editor.');
        window.location.href = 'home-screen.html';
        return;
    }
    
    // Create the game with canvas configuration
    game = new Game({
        canvas: canvas,
        width: canvas.width,
        height: canvas.height,
        debugMode: false,
        finishLine: {
            position: currentMap.length || 6000,
            enabled: true
        }
    });

    // Register the game instance with the service locator
    ServiceLocator.registerService('game', game);

    // Get event bus and subscribe to game result event
    const eventBus = ServiceLocator.getService('eventBus');
    if (eventBus) {
        eventBus.subscribe('gameFinished', handleGameFinished);
        eventBus.subscribe('enemyKilled', handleEnemyKilled);
        eventBus.subscribe('enemyEscaped', handleEnemyEscaped);
    }

    // Create player and load initial entities
    const entityManager = ServiceLocator.getService('entityManager');
    player = EntityFactory.createPlayer(entityManager, 3);
    loadMapEntities();
    
    // Set up periodic entity spawning
    setupEntitySpawning();

    // Start the game
    game.start();
    
    // Start the timer
    startGameTimer();

    // Update player info display
    updatePlayerInfo();
}

// Load entities from the map data
function loadMapEntities() {
    if (!currentMap) return;
    
    // Get player world position from the game
    const game = ServiceLocator.getService('game');
    const playerWorldPosition = game ? game.playerWorldPosition : 100;
    
    // Use the EntityAdapter to create entities from map data
    EntityAdapter.createEntitiesFromMap(currentMap, playerWorldPosition);
}

// Start the game timer
function startGameTimer() {
    // Clear any existing timer
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (game && !game.isPaused) {
            timePassed++;
            updatePlayerInfo();
        }
    }, 1000);
}

// Update grenade stats display
function updateGrenadeStats() {
    if (!player) return;
    
    const playerComponent = player.getComponent('player');
    if (!playerComponent) return;
    
    standardGrenadesElement.textContent = `Standard Grenades: ${playerComponent.grenades.standard}`;
    stickyGrenadesElement.textContent = `Sticky Grenades: ${playerComponent.grenades.sticky}`;
    
    // Add kill count, escape count and time display
    const statsContainer = document.getElementById('grenadeStats');
    
    // Create or update kill count element
    let killCountElement = document.getElementById('killCount');
    if (!killCountElement) {
        killCountElement = document.createElement('div');
        killCountElement.id = 'killCount';
        statsContainer.appendChild(killCountElement);
    }
    killCountElement.textContent = `Enemies Killed: ${enemyKillCount}`;
    
    // Create or update escape count element
    let escapeCountElement = document.getElementById('escapeCount');
    if (!escapeCountElement) {
        escapeCountElement = document.createElement('div');
        escapeCountElement.id = 'escapeCount';
        statsContainer.appendChild(escapeCountElement);
    }
    escapeCountElement.textContent = `Enemies Escaped: ${enemyEscapeCount}`;
    
    // Create or update time element
    let timeElement = document.getElementById('timePassed');
    if (!timeElement) {
        timeElement = document.createElement('div');
        timeElement.id = 'timePassed';
        statsContainer.appendChild(timeElement);
    }
    
    const minutes = Math.floor(timePassed / 60);
    const seconds = timePassed % 60;
    timeElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Update player info display
function updatePlayerInfo() {
    if (!player) return;
    
    const laneComponent = player.getComponent('lane');
    const lane = laneComponent ? laneComponent.laneIndex : 0;
    
    // Get the current speed from the speed controller
    const speedController = ServiceLocator.getService('speedController');
    const currentSpeed = speedController ? speedController.getPlayerSpeedModifier() : playerSpeedModifier;
    
    playerInfoElement.textContent = `Lane: ${lane} | Speed: ${currentSpeed.toFixed(1)}x`;
    
    // Update grenade stats
    updateGrenadeStats();
}

// Add a function to handle game finished event
function handleGameFinished(eventData) {
    const { result, reason } = eventData;
    
    console.log(`Game finished with result: ${result}, reason: ${reason}`);
    
    // Calculate finish time
    const finishTime = timePassed;
    
    // Get user data
    const userData = localStorage.getItem('zombieLaneDefense_userData');
    const username = userData ? JSON.parse(userData).username : 'Unknown';
    
    // Create high score entry
    const highScore = {
        mapName: currentMap.name,
        username: username,
        finishTime: finishTime,
        enemiesKilled: enemyKillCount,
        enemiesEscaped: enemyEscapeCount,
        timestamp: new Date().toISOString()
    };
    
    // Save high score
    const highScores = JSON.parse(localStorage.getItem('zombieLaneDefense_highScores') || '[]');
    highScores.push(highScore);
    localStorage.setItem('zombieLaneDefense_highScores', JSON.stringify(highScores));
    
    if (result === 'victory') {
        // Show victory message
        setTimeout(() => {
            alert('Level completed! You reached the finish line.');
            window.location.href = 'home-screen.html';
        }, 500);
    } else if (result === 'defeat') {
        // Show defeat message
        setTimeout(() => {
            alert(`Game over! ${reason}`);
            window.location.href = 'home-screen.html';
        }, 500);
    }
}

// Handle enemy killed event
function handleEnemyKilled() {
    enemyKillCount++;
    updateGrenadeStats();
}

// Handle enemy escaped event
function handleEnemyEscaped() {
    enemyEscapeCount++;
    updateGrenadeStats();
}

// Clean up event listeners when leaving the page
window.addEventListener('beforeunload', () => {
    const eventBus = ServiceLocator.getService('eventBus');
    if (eventBus) {
        eventBus.unsubscribe('gameFinished', handleGameFinished);
        eventBus.unsubscribe('enemyKilled', handleEnemyKilled);
        eventBus.unsubscribe('enemyEscaped', handleEnemyEscaped);
    }
});

// Set up periodic entity spawning
function setupEntitySpawning() {
    // Check for new entities to spawn every 500ms
    const spawnInterval = setInterval(() => {
        console.log('[Spawning] Checking for new entities to spawn...');
        if (game && !game.isPaused) {
            loadMapEntities();
        }
    }, 500);
    
    // Store the interval ID for cleanup
    return spawnInterval;
}

// Add button event listeners for game controls only
function setupButtonControls() {
    // Game controls
    const pauseButton = document.getElementById('pauseButton');
    const resumeButton = document.getElementById('resumeButton');
    const restartButton = document.getElementById('restartButton');
    const exitButton = document.getElementById('exitButton');
    
    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            if (game) {
                game.pause();
            }
        });
    }
    
    if (resumeButton) {
        resumeButton.addEventListener('click', () => {
            if (game) {
                game.resume();
            }
        });
    }
    
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to restart the game?')) {
                window.location.reload();
            }
        });
    }
    
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to exit to the menu? Your progress will be lost.')) {
                window.location.href = 'home-screen.html';
            }
        });
    }

}

// Add keyboard event listeners
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        handleKeyDown(e);
    });
}

// Separate function for handling keydown events
function handleKeyDown(e) {
    // Log key presses for debugging

    // Don't handle shortcuts if typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Prevent default for our shortcuts
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'Z', 'x', 'X', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // Space: Toggle pause/resume
    if (e.key === ' ') {
        if (game) {
            if (game.isPaused) {
                game.resume();
                console.log('[GAMEPLAY] Game resumed');
            } else {
                game.pause();
                console.log('[GAMEPLAY] Game paused');
            }
        }
    }
    
    // Only process other controls if game is not paused
    if (game && game.isPaused) {
        return;
    }
    
    // Arrow Up: Move lane up
    if (e.key === 'ArrowUp') {
        if (!player) return;
        
        const laneComponent = player.getComponent('lane');
        if (!laneComponent) return;
        
        const newLaneIndex = Math.max(0, laneComponent.laneIndex - 1);
        if (newLaneIndex !== laneComponent.laneIndex) {
            const playerSoldierService = ServiceLocator.getService('playerSoldierService');
            if (playerSoldierService) {
                playerSoldierService.moveToLane(player, newLaneIndex);
                updatePlayerInfo();
            }
        }
    }
    
    // Arrow Down: Move lane down
    if (e.key === 'ArrowDown') {
        if (!player) return;
        
        const laneComponent = player.getComponent('lane');
        if (!laneComponent) return;
        
        const laneSystem = ServiceLocator.getService('laneSystem');
        const maxLane = laneSystem ? laneSystem.laneCount - 1 : 8;
        
        const newLaneIndex = Math.min(maxLane, laneComponent.laneIndex + 1);
        if (newLaneIndex !== laneComponent.laneIndex) {
            const playerSoldierService = ServiceLocator.getService('playerSoldierService');
            if (playerSoldierService) {
                playerSoldierService.moveToLane(player, newLaneIndex);
                updatePlayerInfo();
            }
        }
    }
    
    // Arrow Right: Speed up
    if (e.key === 'ArrowRight') {
        const speedController = ServiceLocator.getService('speedController');
        if (speedController) {
            speedController.increasePlayerSpeed();
            updatePlayerInfo();
        }
    }
    
    // Arrow Left: Speed down
    if (e.key === 'ArrowLeft') {
        const speedController = ServiceLocator.getService('speedController');
        if (speedController) {
            speedController.decreasePlayerSpeed();
            updatePlayerInfo();
        }
    }
    
    // Z: Throw standard grenade
    if (e.key === 'z' || e.key === 'Z') {
        if (!player) return;
        
        const entityManager = ServiceLocator.getService('entityManager');
        const playerSoldierService = ServiceLocator.getService('playerSoldierService');
        
        if (entityManager && playerSoldierService) {
            const grenade = playerSoldierService.throwGrenade(entityManager, player, 'standard');
            if (grenade) {
                updateGrenadeStats();
            }
        }
    }
    
    // X: Throw sticky grenade
    if (e.key === 'x' || e.key === 'X') {
        if (!player) return;
        
        const entityManager = ServiceLocator.getService('entityManager');
        const playerSoldierService = ServiceLocator.getService('playerSoldierService');
        
        if (entityManager && playerSoldierService) {
            const grenade = playerSoldierService.throwGrenade(entityManager, player, 'sticky');
            if (grenade) {
                updateGrenadeStats();
            }
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {

    // Check if required DOM elements exist
    if (!canvas) {
        console.error('[GAMEPLAY] Canvas element not found');
        return;
    }
    
    initGame();
    setupButtonControls(); // Only sets up game control buttons now
    setupKeyboardControls();
    
    console.log('[GAMEPLAY] Game setup complete');
});