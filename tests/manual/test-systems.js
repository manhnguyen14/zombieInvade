/**
 * Test Systems Module
 *
 * Provides the test systems for the step-by-step ECS test.
 */

import { globals } from './globals-test.js';
import { EntitySystem } from '../../src/systems/entity-system.js';
import { TransformComponent } from '../../src/entities/components/transform.js';
import { RenderComponent } from '../../src/entities/components/render.js';
import { LaneComponent } from '../../src/entities/components/lane.js';
import { LaneSystem } from '../../src/systems/lane-system.js';
import { MovementSystem } from '../../src/systems/movement-system.js';
import { ShootingSystem } from '../../src/systems/shooting-system.js';
import { GameSpeedController } from '../../src/core/game-speed-controller.js';
import { updateSystemPanel } from './ui-updaters.js';
import { ServiceLocator } from '../../src/core/service-locator.js';
import { CollisionSystem } from '../../src/systems/collision-system.js';
import { DamageSystem } from '../../src/systems/damage-system.js';
import { RenderSystem } from '../../src/systems/render-system.js';
import { EffectSystem } from "../../src/systems/effect-system.js";
import { BonusSystem } from "../../src/systems/bonus-system.js";
import { PlayerSoldierService } from '../../src/core/player-soldier-service.js';
/**
 * Create the test systems
 */
export function createTestSystems() {
    console.log('[TEST_SYSTEMS] Initializing test systems...');
    
    // Ensure input handler is properly registered
    const inputHandler = ServiceLocator.getService('input');
    console.log('[TEST_SYSTEMS] Input handler from ServiceLocator:', !!inputHandler);
    
    // Don't try to set globals.inputHandler directly as it's a getter-only property
    // The inputHandler is already accessible via globals.inputHandler
    
    // Create and register a game speed controller
    const speedController = new GameSpeedController();
    speedController.setBaseSpeed(5);
    speedController.setPlayerSpeedModifier(4);
    ServiceLocator.registerService('speedController', speedController);

    // Create a test movement system
    class TestMovementSystem extends EntitySystem {
        constructor() {
            super('testMovementSystem', ['transform']);
            this.setPriority(0);
            this.speed = 100;
        }

        processEntity(entity, deltaTime) {
            const transform = entity.getComponent('transform');

            // Move entities with the 'moving' tag
            if (entity.hasTag('moving')) {
                // Move in a circular pattern
                const time = globals.game.frameCount / 60;
                const radius = 100;
                const speed = this.speed * (entity.hasTag('fast') ? 2 : 1);

                transform.x = 400 + Math.cos(time * speed / 100) * radius;
                transform.y = 300 + Math.sin(time * speed / 100) * radius;

                // Rotate
                if (entity.hasTag('rotating')) {
                    transform.rotation += deltaTime * 2;
                }
            }

            // Handle input for player-controlled entity
            if (entity.hasTag('player')) {
                const lane = entity.getComponent('lane');
                const laneSystem = globals.systems.laneSystem;
                let newLaneIndex = lane.laneIndex;
                const horizontalSpeed = 200;
                const player = globals.player;

                // Move up/down between lanes with O and L keys
                if (inputHandler.wasKeyJustPressed('KeyO')) {
                    newLaneIndex = Math.max(0, lane.laneIndex - 1);
                    if (newLaneIndex !== lane.laneIndex) {
                        if (player) {
                            PlayerSoldierService.moveToLane(player, newLaneIndex);
                            console.log('[PLAYER] Moved to lane', newLaneIndex);
                        } else if (laneSystem) {
                            laneSystem.moveEntityToLane(entity, newLaneIndex);
                        }
                    }
                }
                
                if (inputHandler.wasKeyJustPressed('KeyL')) {
                    newLaneIndex = Math.min(8, lane.laneIndex + 1);
                    if (newLaneIndex !== lane.laneIndex) {
                        if (player) {
                            PlayerSoldierService.moveToLane(player, newLaneIndex);
                            console.log('[PLAYER] Moved to lane', newLaneIndex);
                        } else if (laneSystem) {
                            laneSystem.moveEntityToLane(entity, newLaneIndex);
                        }
                    }
                }

                // Move left/right within lane with K and ; keys
                if (inputHandler.isKeyPressed('KeyK')) {
                    transform.x -= horizontalSpeed * deltaTime;
                }
                if (inputHandler.isKeyPressed('Semicolon')) {
                    transform.x += horizontalSpeed * deltaTime;
                }

                // Keep player within horizontal bounds
                transform.x = Math.max(50, Math.min(750, transform.x));
            }
        }
    }

    // Extend the LaneSystem to add visualization features for the test UI
    class TestLaneSystem extends LaneSystem {
        constructor() {
            super({
                laneCount: 9,
                laneHeight: 60,
                laneWidth: 800,
                bonusLaneColor: '#2f2f2f',
                combatLaneColor: '#191919'
            });
            this.name = 'testLaneSystem';
        }

        // Override initialize to log to debug panel
        initialize() {
            console.log('Initializing TestLaneSystem...');
            
            const entityManager = ServiceLocator.getService('entityManager');
            
            // Create lane background entities
            for (let i = 0; i < this.laneCount; i++) {
                const entity = entityManager.createEntity();

                // Add transform component
                const transform = new TransformComponent();
                transform.init({
                    x: this.laneWidth / 2,
                    y: i * this.laneHeight + this.laneHeight / 2
                });
                entity.addComponent(transform);

                // Add render component
                const render = new RenderComponent();
                render.setAsRectangle(
                    this.laneWidth, 
                    this.laneHeight, 
                    i === 0 ? this.bonusLaneColor : this.combatLaneColor
                );
                render.setLayer(-100);
                entity.addComponent(render);

                // Add lane component
                const lane = new LaneComponent();
                lane.init({
                    laneIndex: i,
                    laneWidth: this.laneWidth,
                    laneHeight: this.laneHeight
                });
                entity.addComponent(lane);

                // Add tags
                entity.addTag('lane');
                entity.addTag('background');

                // Store lane entity for reference
                this.laneEntities[i] = entity;
            }
        }

        // Add visualization features
        update(deltaTime) {
            // Call parent update to process entities
            super.update(deltaTime);

            // Draw lane separators
            const ctx = globals.renderer.getContext();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;

            for (let i = 1; i < this.laneCount; i++) {
                const y = i * this.laneHeight;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.laneWidth, y);
                ctx.stroke();
            }

            // Draw lane numbers
            for (let i = 0; i < this.laneCount; i++) {
                const y = i * this.laneHeight + this.laneHeight / 2;
                globals.renderer.drawText(
                    i === 0 ? 'Bonus Lane' : `Lane ${i}`,
                    10,
                    y - 8,
                    '#ffffff',
                    '16px Arial'
                );
            }
        }
    }

    // Create a test UI system to display player information
    class PlayerInfoSystem extends EntitySystem {
        constructor() {
            super('playerInfoSystem', []);
            this.setPriority(-20); // Run after rendering
        }

        update(deltaTime) {
            const player = globals.player;
            
            // Display player information if available
            if (player) {
                const playerEntity = player;
                const lane = playerEntity.getComponent('lane');
                const transform = playerEntity.getComponent('transform');

                // Get the renderer
                const renderer = globals.renderer;
                const ctx = renderer.getContext();

                // Get speed controller
                let speedModifier = 4;
                let baseSpeed = 5;
                const speedController = ServiceLocator.getService('speedController');
                if (speedController) {
                    speedModifier = speedController.getPlayerSpeedModifier();
                    baseSpeed = speedController.getBaseSpeed();
                }
            }
        }
    }

    // Create a player input system to handle player movement
    class PlayerInputSystem extends EntitySystem {
        constructor() {
            super('playerInputSystem', ['transform', 'lane']);
            this.setPriority(8);
            this.speedController = null;
        }

        update(deltaTime) {
            // Get the speed controller if not already cached
            if (!this.speedController) {
                this.speedController = ServiceLocator.getService('speedController');
            }

            // Process player entities
            const entities = this.getEntities();
            for (const entity of entities) {
                if (entity.hasTag('player')) {
                    this.processEntity(entity, deltaTime);
                }
            }
        }

        processEntity(entity, deltaTime) {
            const lane = entity.getComponent('lane');
            const transform = entity.getComponent('transform');
            
            // Get player instance
            const player = globals.player;
            // Handle grenade throwing with R and T keys (add this part)
            if (inputHandler.wasKeyJustPressed('KeyY')) {
                if (player) {
                    const entityManager = ServiceLocator.getService('entityManager');
                    const grenade = PlayerSoldierService.throwGrenade(entityManager, player, 'standard');
                    if (grenade) {
                        console.log('[PLAYER] Threw standard grenade');
                    } else {
                        console.log('[PLAYER] Could not throw standard grenade (cooldown or no grenades)');
                    }
                }
            }

            if (inputHandler.wasKeyJustPressed('KeyT')) {
                if (player) {
                    const entityManager = ServiceLocator.getService('entityManager');
                    const grenade = PlayerSoldierService.throwGrenade(entityManager, player, 'sticky');
                    if (grenade) {
                        console.log('[PLAYER] Threw sticky grenade');
                    } else {
                        console.log('[PLAYER] Could not throw sticky grenade (cooldown or no grenades)');
                    }
                }
            }

            // Handle lane movement (up/down) with O and L keys
            if (inputHandler.wasKeyJustPressed('KeyO')) {
                const newLaneIndex = Math.max(0, lane.laneIndex - 1);
                if (newLaneIndex !== lane.laneIndex) {
                    if (player) {
                        PlayerSoldierService.moveToLane(player, newLaneIndex);
                    } else {
                        const laneSystem = globals.systems.laneSystem;
                        if (laneSystem) {
                            laneSystem.moveEntityToLane(entity, newLaneIndex);
                        }
                    }
                }
            }

            if (inputHandler.wasKeyJustPressed('KeyL')) {
                const newLaneIndex = Math.min(8, lane.laneIndex + 1);
                if (newLaneIndex !== lane.laneIndex) {
                    if (player) {
                        PlayerSoldierService.moveToLane(player, newLaneIndex);
                    } else {
                        const laneSystem = globals.systems.laneSystem;
                        if (laneSystem) {
                            laneSystem.moveEntityToLane(entity, newLaneIndex);
                        }
                    }
                }
            }

            // Fix player position at left side of screen
            transform.x = 100;

            // Handle speed modifier changes with K and ; keys
            if (this.speedController) {
                if (inputHandler.wasKeyJustPressed('KeyK')) {
                    this.speedController.decreasePlayerSpeed();
                }

                if (inputHandler.wasKeyJustPressed('Semicolon')) {
                    this.speedController.increasePlayerSpeed();
                }
            }
        }
    }

    globals.systems.playerInputSystem = new PlayerInputSystem();
    globals.systems.playerInfoSystem = new PlayerInfoSystem();

    // Add systems to the game in the correct order
    globals.game.addSystem(globals.systems.playerInputSystem);



    globals.game.addSystem(globals.systems.playerInfoSystem);

    // Update the system panel
    updateSystemPanel();

    // Add a debug method to test the EntityManager
    window.testEntityManager = () => {
        const entityManager = ServiceLocator.getService('entityManager');
        console.log('--- TESTING ENTITY MANAGER ---');
        
        const allEntities = entityManager.getAllEntities();
        console.log(`Total entities: ${allEntities.length}`);
        
        const entitiesWithTransform = entityManager.getEntitiesWithComponent('transform');
        console.log(`Entities with transform: ${entitiesWithTransform.length}`);
        
        const entitiesWithRender = entityManager.getEntitiesWithComponent('render');
        console.log(`Entities with render: ${entitiesWithRender.length}`);
    };

    console.log('[TEST_SYSTEMS] Test systems initialized successfully');
}
