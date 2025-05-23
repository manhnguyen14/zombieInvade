/**
 * Entity Test
 * 
 * A simple test to verify the entity implementations.
 */

import { Game } from '../../src/core/game.js';
import { ServiceLocator } from '../../src/core/service-locator.js';
import { EntityManager } from '../../src/core/entity-manager.js';
import { Renderer } from '../../src/core/renderer.js';
import { InputHandler } from '../../src/core/input-handler.js';
import { Timer } from '../../src/core/timer.js';
import { LaneSystem } from '../../src/systems/lane-system.js';
import { EntityFactory } from '../../src/entities/entity-factory.js';
import { BonusService } from '../../src/core/bonus-service.js';

// Debug flag to control logging verbosity
let DEBUG = true;

// Custom debug logger that respects the DEBUG flag
function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Create core services
    const renderer = new Renderer(canvas);
    const inputHandler = new InputHandler(canvas);
    const timer = new Timer();
    const entityManager = new EntityManager();
    const bonusService = new BonusService();
    
    // Register services with the service locator
    ServiceLocator.registerService('renderer', renderer);
    ServiceLocator.registerService('inputHandler', inputHandler);
    ServiceLocator.registerService('timer', timer);
    ServiceLocator.registerService('entityManager', entityManager);

    //check code
    //ServiceLocator.registerService('bonusService', bonusService);
    
    // Create the game instance
    const game = new Game({
        debugMode: true
    });
    
    // Create the lane system
    const laneSystem = new LaneSystem({
        laneCount: 9,
        laneHeight: 60,
        laneWidth: canvas.width
    });
    
    // Add the lane system to the game
    game.addSystem(laneSystem);
    
    // Create a render system
    class RenderSystem {
        constructor() {
            this.name = 'renderSystem';
            this.enabled = true;
        }
        
        update(deltaTime) {
            const renderer = ServiceLocator.getService('renderer');
            
            // Clear the canvas
            renderer.clear('#1a1a1a');
            
            // Draw lane backgrounds
            const laneEntities = entityManager.getEntitiesWithTag('lane');
            for (const entity of laneEntities) {
                const transform = entity.getComponent('transform');
                const render = entity.getComponent('render');
                const lane = entity.getComponent('lane');
                
                if (transform && render && lane) {
                    renderer.fillRect(
                        0,
                        lane.laneIndex * laneSystem.laneHeight,
                        laneSystem.laneWidth,
                        laneSystem.laneHeight,
                        render.color
                    );
                    
                    // Draw lane index
                    renderer.fillText(
                        `Lane ${lane.laneIndex}`,
                        50,
                        lane.laneIndex * laneSystem.laneHeight + laneSystem.laneHeight / 2,
                        '#ffffff',
                        '14px Arial',
                        'left',
                        'middle'
                    );
                }
            }
            
            // Draw all entities with render components
            const renderEntities = entityManager.getEntitiesWithComponent('render');
            
            // Sort by layer (lower layers render first)
            renderEntities.sort((a, b) => {
                const renderA = a.getComponent('render');
                const renderB = b.getComponent('render');
                return (renderA.layer || 0) - (renderB.layer || 0);
            });
            
            for (const entity of renderEntities) {
                // Skip lane entities (already rendered)
                if (entity.hasTag('lane')) {
                    continue;
                }
                
                const transform = entity.getComponent('transform');
                const render = entity.getComponent('render');
                
                if (transform && render && render.visible) {
                    // Set alpha
                    renderer.setAlpha(render.alpha);
                    
                    // Draw based on shape type
                    if (render.shapeType === 'rect') {
                        renderer.fillRect(
                            transform.x - render.width / 2,
                            transform.y - render.height / 2,
                            render.width,
                            render.height,
                            render.color
                        );
                    } else if (render.shapeType === 'circle') {
                        renderer.fillCircle(
                            transform.x,
                            transform.y,
                            render.radius,
                            render.color
                        );
                    } else if (render.image) {
                        renderer.drawImage(
                            render.image,
                            transform.x - render.width / 2,
                            transform.y - render.height / 2,
                            render.width,
                            render.height
                        );
                    }
                    
                    // Reset alpha
                    renderer.resetAlpha();
                    
                    // Draw entity type and ID
                    let entityType = 'Entity';
                    if (entity.hasTag('player')) entityType = 'Player';
                    else if (entity.hasTag('soldier')) entityType = 'Soldier';
                    else if (entity.hasTag('normalZombie')) entityType = 'Normal Zombie';
                    else if (entity.hasTag('armoredZombie')) entityType = 'Armored Zombie';
                    else if (entity.hasTag('giantZombie')) entityType = 'Giant Zombie';
                    else if (entity.hasTag('smallObstacle')) entityType = 'Small Obstacle';
                    else if (entity.hasTag('mediumObstacle')) entityType = 'Medium Obstacle';
                    else if (entity.hasTag('largeObstacle')) entityType = 'Large Obstacle';
                    else if (entity.hasTag('hazard')) entityType = 'Hazard';
                    
                    renderer.fillText(
                        `${entityType} (${entity.id})`,
                        transform.x,
                        transform.y - render.height / 2 - 10,
                        '#ffffff',
                        '12px Arial',
                        'center'
                    );
                }
            }
            
            // Draw instructions
            renderer.fillText(
                'Entity Test - Press keys to create entities:',
                canvas.width / 2,
                20,
                '#ffffff',
                '16px Arial',
                'center'
            );
            
            renderer.fillText(
                '1-3: Normal/Armored/Giant Zombie | 4-7: Small/Medium/Large/Hazard Obstacle | 0: Player',
                canvas.width / 2,
                50,
                '#ffffff',
                '16px Arial',
                'center'
            );
        }
    }
    
    // Add the render system to the game
    game.addSystem(new RenderSystem());
    
    // Create a movement system
    class MovementSystem {
        constructor() {
            this.name = 'movementSystem';
            this.enabled = true;
        }
        
        update(deltaTime) {
            const entities = entityManager.getEntitiesWithComponent('movement');
            
            for (const entity of entities) {
                const transform = entity.getComponent('transform');
                const movement = entity.getComponent('movement');
                
                if (transform && movement && movement.enabled) {
                    // Calculate movement delta
                    const delta = movement.calculateMovementDelta(deltaTime);
                    
                    // Apply movement
                    transform.x += delta.x;
                    transform.y += delta.y;
                    
                    // Remove entity if it goes off screen
                    if (transform.x < -100 || transform.x > canvas.width + 100) {
                        entityManager.removeEntity(entity);
                    }
                }
            }
        }
    }
    
    // Add the movement system to the game
    game.addSystem(new MovementSystem());
    
    // Create an input system to handle entity creation
    class InputSystem {
        constructor() {
            this.name = 'inputSystem';
            this.enabled = true;
            this.keyHandlers = {
                '1': this.createNormalZombie.bind(this),
                '2': this.createArmoredZombie.bind(this),
                '3': this.createGiantZombie.bind(this),
                '4': this.createSmallObstacle.bind(this),
                '5': this.createMediumObstacle.bind(this),
                '6': this.createLargeObstacle.bind(this),
                '7': this.createHazard.bind(this)
            };
        }
        
        update(deltaTime) {
            const inputHandler = ServiceLocator.getService('inputHandler');
            
            // Check for key presses
            for (const key in this.keyHandlers) {
                if (inputHandler.wasKeyJustPressed(key)) {
                    this.keyHandlers[key]();
                }
            }
        }
        
        createPlayer() {
            // Create player in the middle lane
            EntityFactory.createPlayer(entityManager, 5);
            debugLog('Player created');
        }
        
        createNormalZombie() {
            // Create normal zombie in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            const variant = this.getRandomVariant(['Standard', 'Crawler', 'Runner']);
            
            EntityFactory.createNormalZombie(entityManager, variant, {
                laneIndex,
                x: canvas.width // Right side of the screen
            });
            
            debugLog(`Normal Zombie (${variant}) created in lane ${laneIndex}`);
        }
        
        createArmoredZombie() {
            // Create armored zombie in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            const variant = this.getRandomVariant(['Standard', 'HeavyArmor', 'PartialArmor']);
            
            EntityFactory.createArmoredZombie(entityManager, variant, {
                laneIndex,
                x: canvas.width // Right side of the screen
            });
            
            debugLog(`Armored Zombie (${variant}) created in lane ${laneIndex}`);
        }
        
        createGiantZombie() {
            // Create giant zombie in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            const variant = this.getRandomVariant(['Standard', 'Tank', 'Berserker', 'Slow']);
            
            EntityFactory.createGiantZombie(entityManager, variant, {
                laneIndex,
                x: canvas.width // Right side of the screen
            });
            
            debugLog(`Giant Zombie (${variant}) created in lane ${laneIndex}`);
        }
        
        createSmallObstacle() {
            // Create small obstacle in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            const variant = this.getRandomVariant(['Standard', 'Barricade', 'Crate', 'TrashCan']);
            
            EntityFactory.createSmallObstacle(entityManager, variant, {
                laneIndex,
                x: canvas.width // Right side of the screen
            });
            
            debugLog(`Small Obstacle (${variant}) created in lane ${laneIndex}`);
        }
        
        createMediumObstacle() {
            // Create medium obstacle in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            const variant = this.getRandomVariant(['Standard', 'Car', 'Dumpster', 'Fence']);
            
            EntityFactory.createMediumObstacle(entityManager, variant, {
                laneIndex,
                x: canvas.width // Right side of the screen
            });
            
            debugLog(`Medium Obstacle (${variant}) created in lane ${laneIndex}`);
        }
        
        createLargeObstacle() {
            // Create large obstacle in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            const variant = this.getRandomVariant(['Standard', 'Bus', 'Truck', 'Wall']);
            
            EntityFactory.createLargeObstacle(entityManager, variant, {
                laneIndex,
                x: canvas.width // Right side of the screen
            });
            
            debugLog(`Large Obstacle (${variant}) created in lane ${laneIndex}`);
        }
        
        createHazard() {
            // Create hazard in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            const variant = this.getRandomVariant(['Hole', 'Spikes', 'Fire', 'Toxic']);
            
            EntityFactory.createImpassableHazard(entityManager, variant, {
                laneIndex,
                x: canvas.width // Right side of the screen
            });
            
            debugLog(`Hazard (${variant}) created in lane ${laneIndex}`);
        }
        
        getRandomVariant(variants) {
            return variants[Math.floor(Math.random() * variants.length)];
        }
    }
    
    // Add the input system to the game
    game.addSystem(new InputSystem());
    
    // Start the game
    game.start();
    
    // Log that the game has started
    debugLog('Entity test initialized');
});
