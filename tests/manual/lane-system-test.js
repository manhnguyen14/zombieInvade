/**
 * Lane System Manual Test
 * 
 * This file provides a manual test for the LaneSystem.
 * It creates a game with lanes and allows the user to interact with entities in the lanes.
 */

import { Game } from '../../src/core/game.js';
import { ServiceLocator } from '../../src/core/service-locator.js';
import { EntityManager } from '../../src/core/entity-manager.js';
import { Renderer } from '../../src/core/renderer.js';
import { InputHandler } from '../../src/core/input-handler.js';
import { Timer } from '../../src/core/timer.js';
import { LaneSystem } from '../../src/systems/lane-system.js';
import { TransformComponent } from '../../src/entities/components/transform.js';
import { RenderComponent } from '../../src/entities/components/render.js';
import { LaneComponent } from '../../src/entities/components/lane.js';

// Debug flag to control logging verbosity
let DEBUG = false;

// Custom debug logger that respects the DEBUG flag
function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

// Make debugLog available globally for other modules
window.debugLog = debugLog;

/**
 * Initialize the test
 */
export function initLaneSystemTest() {
    console.log('Initializing Lane System Test...');
    
    // Get the canvas element
    const canvas = document.getElementById('game-canvas');
    
    // Create and register core services
    const renderer = new Renderer({
        canvas: canvas,
        width: canvas.width,
        height: canvas.height
    });
    ServiceLocator.registerService('renderer', renderer);
    
    const inputHandler = new InputHandler();
    ServiceLocator.registerService('inputHandler', inputHandler);
    
    const timer = new Timer();
    ServiceLocator.registerService('timer', timer);
    
    const entityManager = new EntityManager();
    ServiceLocator.registerService('entityManager', entityManager);
    
    // Create the game
    const game = new Game({
        canvas: canvas,
        width: canvas.width,
        height: canvas.height,
        debugMode: true
    });
    
    // Create and add the lane system
    const laneSystem = new LaneSystem({
        laneCount: 9,
        laneHeight: 60,
        laneWidth: canvas.width,
        bonusLaneColor: '#1f1f1f',
        combatLaneColor: '#0d0d0d'
    });
    game.addSystem(laneSystem);
    
    // Create a render system
    class RenderSystem {
        constructor() {
            this.name = 'renderSystem';
            this.enabled = true;
        }
        
        update(deltaTime) {
            const renderer = ServiceLocator.getService('renderer');
            const entityManager = ServiceLocator.getService('entityManager');
            
            // Clear the canvas
            renderer.clear('#1a1a1a');
            
            // Get all entities with transform and render components
            const entities = entityManager.getEntitiesWithAllComponents(['transform', 'render']);
            
            // Sort entities by render layer
            entities.sort((a, b) => {
                const renderA = a.getComponent('render');
                const renderB = b.getComponent('render');
                return renderA.layer - renderB.layer;
            });
            
            // Render each entity
            for (const entity of entities) {
                const transform = entity.getComponent('transform');
                const render = entity.getComponent('render');
                
                if (render.type === 'rectangle') {
                    renderer.fillRect(
                        transform.x - render.width / 2,
                        transform.y - render.height / 2,
                        render.width,
                        render.height,
                        render.color
                    );
                    
                    // Draw entity ID for debugging
                    if (game.debugMode) {
                        renderer.fillText(
                            entity.id.toString(),
                            transform.x,
                            transform.y,
                            '#ffffff',
                            '12px Arial',
                            'center'
                        );
                    }
                }
            }
            
            // Draw lane numbers
            for (let i = 0; i < laneSystem.laneCount; i++) {
                renderer.fillText(
                    `Lane ${i}`,
                    50,
                    i * laneSystem.laneHeight + laneSystem.laneHeight / 2,
                    '#ffffff',
                    '14px Arial',
                    'left'
                );
            }
            
            // Draw instructions
            renderer.fillText(
                'Use arrow keys to move player (red) between lanes',
                canvas.width / 2,
                20,
                '#ffffff',
                '16px Arial',
                'center'
            );
            
            renderer.fillText(
                'Press SPACE to create a new entity in a random lane',
                canvas.width / 2,
                50,
                '#ffffff',
                '16px Arial',
                'center'
            );
        }
    }
    game.addSystem(new RenderSystem());
    
    // Create a player control system
    class PlayerControlSystem {
        constructor() {
            this.name = 'playerControlSystem';
            this.enabled = true;
            this.playerEntity = null;
            this.moveCooldown = 0;
        }
        
        initialize() {
            // Create player entity
            const entityManager = ServiceLocator.getService('entityManager');
            
            this.playerEntity = entityManager.createEntity();
            
            // Add transform component
            const transform = new TransformComponent();
            transform.init({
                x: 100,
                y: 0 // Will be set by lane system
            });
            this.playerEntity.addComponent(transform);
            
            // Add render component
            const render = new RenderComponent();
            render.setAsRectangle(40, 40, '#e74c3c');
            this.playerEntity.addComponent(render);
            
            // Add lane component
            const lane = new LaneComponent();
            lane.init({
                laneIndex: 4 // Start in the middle lane
            });
            this.playerEntity.addComponent(lane);
            
            // Add player tag
            this.playerEntity.addTag('player');
            
            console.log('Player entity created:', this.playerEntity);
        }
        
        update(deltaTime) {
            if (!this.playerEntity) return;
            
            const inputHandler = ServiceLocator.getService('inputHandler');
            
            // Update move cooldown
            if (this.moveCooldown > 0) {
                this.moveCooldown -= deltaTime;
            }
            
            // Only allow movement if cooldown is expired
            if (this.moveCooldown <= 0) {
                const lane = this.playerEntity.getComponent('lane');
                let newLaneIndex = lane.laneIndex;
                
                // Move up
                if (inputHandler.isKeyPressed('ArrowUp')) {
                    newLaneIndex = Math.max(0, lane.laneIndex - 1);
                    this.moveCooldown = 0.2; // 200ms cooldown
                }
                
                // Move down
                if (inputHandler.isKeyPressed('ArrowDown')) {
                    newLaneIndex = Math.min(8, lane.laneIndex + 1);
                    this.moveCooldown = 0.2; // 200ms cooldown
                }
                
                // Update lane if changed
                if (newLaneIndex !== lane.laneIndex) {
                    const laneSystem = game.systems.find(s => s.name === 'laneSystem');
                    if (laneSystem) {
                        laneSystem.moveEntityToLane(this.playerEntity, newLaneIndex);
                        console.log(`Player moved to lane ${newLaneIndex}`);
                    }
                }
            }
            
            // Create new entity on space
            if (inputHandler.wasKeyJustPressed(' ')) {
                this.createRandomEntity();
            }
        }
        
        createRandomEntity() {
            const entityManager = ServiceLocator.getService('entityManager');
            
            // Create a new entity
            const entity = entityManager.createEntity();
            
            // Random lane
            const laneIndex = Math.floor(Math.random() * 9);
            
            // Random position on the right side
            const x = 700 + Math.random() * 100;
            
            // Add transform component
            const transform = new TransformComponent();
            transform.init({
                x: x,
                y: 0 // Will be set by lane system
            });
            entity.addComponent(transform);
            
            // Add render component
            const render = new RenderComponent();
            render.setAsRectangle(30, 30, '#3498db');
            entity.addComponent(render);
            
            // Add lane component
            const lane = new LaneComponent();
            lane.init({
                laneIndex: laneIndex
            });
            entity.addComponent(lane);
            
            console.log(`Created entity in lane ${laneIndex} at x=${x}`);
        }
    }
    
    // Add player control system
    const playerControlSystem = new PlayerControlSystem();
    game.addSystem(playerControlSystem);
    
    // Create a movement system
    class MovementSystem {
        constructor() {
            this.name = 'movementSystem';
            this.enabled = true;
        }
        
        update(deltaTime) {
            const entityManager = ServiceLocator.getService('entityManager');
            
            // Get all entities with transform component except player
            const entities = entityManager.getEntitiesWithComponent('transform')
                .filter(entity => !entity.hasTag('player') && !entity.hasTag('lane'));
            
            // Move entities from right to left
            for (const entity of entities) {
                const transform = entity.getComponent('transform');
                
                // Move entity
                transform.x -= 100 * deltaTime; // 100 pixels per second
                
                // Remove entity if it goes off screen
                if (transform.x < -50) {
                    entityManager.removeEntity(entity);
                    console.log(`Entity ${entity.id} removed (off screen)`);
                }
            }
        }
    }
    
    // Add movement system
    game.addSystem(new MovementSystem());
    
    // Start the game
    game.start();
    
    console.log('Lane System Test initialized');
    
    // Return the game instance for external control
    return game;
}
