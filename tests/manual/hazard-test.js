/**
 * Hazard Test
 * 
 * A simple test to verify that projectiles can pass through hazards.
 */

import { Game } from '../../src/core/game.js';
import { ServiceLocator } from '../../src/core/service-locator.js';
import { EntityManager } from '../../src/core/entity-manager.js';
import { Renderer } from '../../src/core/renderer.js';
import { InputHandler } from '../../src/core/input-handler.js';
import { Timer } from '../../src/core/timer.js';
import { LaneSystem } from '../../src/systems/lane-system.js';
import { CollisionSystem } from '../../src/systems/collision-system.js';
import { EntityFactory } from '../../src/entities/entity-factory.js';
import { CollisionType } from '../../src/entities/components/collision.js';
import { TransformComponent } from '../../src/entities/components/transform.js';
import { RenderComponent } from '../../src/entities/components/render.js';
import { MovementComponent, MovementType } from '../../src/entities/components/movement.js';
import { CollisionComponent } from '../../src/entities/components/collision.js';

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
    const inputHandler = new InputHandler();
    const timer = new Timer();
    const entityManager = new EntityManager();
    
    // Register services with the service locator
    ServiceLocator.registerService('renderer', renderer);
    ServiceLocator.registerService('inputHandler', inputHandler);
    ServiceLocator.registerService('timer', timer);
    ServiceLocator.registerService('entityManager', entityManager);
    
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
    
    // Create the collision system
    const collisionSystem = new CollisionSystem();
    
    // Add the systems to the game
    game.addSystem(laneSystem);
    game.addSystem(collisionSystem);
    
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
                    else if (entity.hasTag('projectile')) entityType = 'Projectile';
                    else if (entity.hasTag('hazard')) entityType = 'Hazard';
                    else if (entity.hasTag('enemy')) entityType = 'Enemy';
                    
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
            
            // Draw collision information
            const collisionEntities = entityManager.getEntitiesWithComponent('collision');
            for (const entity of collisionEntities) {
                const transform = entity.getComponent('transform');
                const collision = entity.getComponent('collision');
                
                if (transform && collision && collision.enabled) {
                    // Draw hitbox
                    const bounds = collision.getHitboxBounds(transform);
                    renderer.strokeRect(
                        bounds.left,
                        bounds.top,
                        bounds.width,
                        bounds.height,
                        '#ff0000'
                    );
                    
                    // Draw colliding entities
                    const collidingEntities = collision.getCollidingEntities();
                    if (collidingEntities.size > 0) {
                        renderer.fillText(
                            `Colliding with: ${Array.from(collidingEntities).join(', ')}`,
                            transform.x,
                            transform.y + collision.height / 2 + 15,
                            '#ff0000',
                            '10px Arial',
                            'center'
                        );
                    }
                }
            }
            
            // Draw instructions
            renderer.fillText(
                'Hazard Test - Press keys to create entities:',
                canvas.width / 2,
                20,
                '#ffffff',
                '16px Arial',
                'center'
            );
            
            renderer.fillText(
                'H: Create Hazard | E: Create Enemy | P: Create Projectile',
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
                    // Skip if blocked
                    if (movement.isBlocked) {
                        continue;
                    }
                    
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
                'h': this.createHazard.bind(this),
                'e': this.createEnemy.bind(this),
                'p': this.createProjectile.bind(this)
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
        
        createHazard() {
            // Create hazard in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            
            try {
                const hazard = EntityFactory.createImpassableHazard(entityManager, 'Hole', {
                    laneIndex,
                    x: 400 // Middle of the screen
                });
                
                debugLog(`Hazard created in lane ${laneIndex}`);
            } catch (error) {
                console.error('Error creating hazard:', error);
            }
        }
        
        createEnemy() {
            // Create enemy in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            
            try {
                const enemy = EntityFactory.createNormalZombie(entityManager, 'Standard', {
                    laneIndex,
                    x: 700 // Right side of the screen
                });
                
                debugLog(`Enemy created in lane ${laneIndex}`);
            } catch (error) {
                console.error('Error creating enemy:', error);
            }
        }
        
        createProjectile() {
            // Create projectile in a random lane
            const laneIndex = Math.floor(Math.random() * 8) + 1; // Lanes 1-8
            
            try {
                // Create projectile entity
                const projectile = entityManager.createEntity();
                
                // Add projectile tag
                projectile.addTag('projectile');
                
                // Add transform component
                const transform = new TransformComponent();
                transform.init({
                    x: 100, // Left side of the screen
                    y: 0 // Will be set by lane system
                });
                projectile.addComponent(transform);
                
                // Add lane component
                const lane = new LaneComponent();
                lane.init({
                    laneIndex
                });
                projectile.addComponent(lane);
                
                // Add render component
                const render = new RenderComponent();
                render.setAsCircle(5, '#ffff00');
                projectile.addComponent(render);
                
                // Add movement component
                const movement = new MovementComponent();
                movement.init({
                    type: MovementType.PROJECTILE,
                    speed: 300, // Fast speed
                    directionX: 1, // Move from left to right
                    directionY: 0
                });
                projectile.addComponent(movement);
                
                // Add collision component
                const collision = new CollisionComponent();
                collision.init({
                    type: CollisionType.PROJECTILE,
                    width: 10,
                    height: 10
                });
                projectile.addComponent(collision);
                
                // Add projectile component (custom component for this test)
                const projectileComponent = {
                    type: 'projectile',
                    damage: 1
                };
                projectile.addComponent(projectileComponent);
                
                debugLog(`Projectile created in lane ${laneIndex}`);
            } catch (error) {
                console.error('Error creating projectile:', error);
            }
        }
    }
    
    // Add the input system to the game
    game.addSystem(new InputSystem());
    
    // Start the game
    game.start();
    
    // Log that the game has started
    debugLog('Hazard test initialized');
});
