/**
 * Test Entity-Component-System Framework
 *
 * This file provides a simple test to verify that the ECS framework
 * works correctly. It creates test entities with components and
 * demonstrates how systems process them.
 */

import { ServiceLocator } from '../../src/core/service-locator.js';
import { Game } from '../../src/core/game.js';
import { EntitySystem } from '../../src/systems/entity-system.js';
import { TransformComponent } from '../../src/entities/components/transform.js';
import { RenderComponent } from '../../src/entities/components/render.js';
import { LaneComponent } from '../../src/entities/components/lane.js';

// Debug flag to control logging verbosity
let DEBUG = true;

// Custom debug logger that respects the DEBUG flag
function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

// Make debugLog available globally for other modules
window.debugLog = debugLog;

// Function to run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c Testing ECS framework... ', 'background: #3498db; color: white; font-size: 14px; font-weight: bold; padding: 5px;');
    console.log('DOM fully loaded and parsed');

    // Add debug controls to the UI
    const debugControls = document.createElement('div');
    debugControls.style.position = 'absolute';
    debugControls.style.top = '10px';
    debugControls.style.right = '10px';
    debugControls.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugControls.style.padding = '10px';
    debugControls.style.borderRadius = '5px';
    debugControls.style.color = 'white';
    debugControls.style.fontFamily = 'monospace';
    debugControls.style.zIndex = '1000';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Debug Logging';
    toggleButton.style.padding = '5px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.addEventListener('click', () => {
        DEBUG = !DEBUG;
        toggleButton.textContent = DEBUG ? 'Disable Debug Logging' : 'Enable Debug Logging';
        console.log(`Debug logging ${DEBUG ? 'enabled' : 'disabled'}`);
    });

    debugControls.appendChild(toggleButton);
    document.body.appendChild(debugControls);

    // Get the canvas element
    const canvas = document.getElementById('game-canvas');

    // Create a test UI element to display entity information
    const uiContainer = document.getElementById('ui-container');
    const testUI = document.createElement('div');
    testUI.style.position = 'absolute';
    testUI.style.top = '10px';
    testUI.style.left = '10px';
    testUI.style.color = 'white';
    testUI.style.fontFamily = 'monospace';
    testUI.style.fontSize = '14px';
    testUI.style.pointerEvents = 'none';
    uiContainer.appendChild(testUI);

    try {
        console.log('Canvas element:', canvas);

        // Initialize the game with configuration
        const gameConfig = {
            canvas: canvas,
            width: 800,
            height: 600
        };
        console.log('Game config:', gameConfig);

        // Create and start the game
        console.log('Creating game instance...');
        const game = new Game(gameConfig);
        console.log('Game instance created:', game);

        // Register the game instance with the service locator
        console.log('Registering game with ServiceLocator...');
        ServiceLocator.registerService('game', game);

        // Get services from the service locator
        console.log('Getting services from ServiceLocator...');
        const renderer = ServiceLocator.getService('renderer');
        console.log('Renderer service:', renderer);

        const inputHandler = ServiceLocator.getService('input');
        console.log('InputHandler service:', inputHandler);

        const entityManager = ServiceLocator.getService('entityManager');
        console.log('EntityManager service:', entityManager);

        const eventBus = ServiceLocator.getService('eventBus');
        console.log('EventBus service:', eventBus);

        // Create a test rendering system
        class TestRenderSystem extends EntitySystem {
            constructor() {
                // This system requires both transform and render components
                super('testRenderSystem', ['transform', 'render']);

                // Set a high priority so it runs after other systems
                this.setPriority(-10);
            }

            processEntity(entity, deltaTime) {
                debugLog(`RenderSystem processing entity ${entity.id}`);
                const transform = entity.getComponent('transform');
                const render = entity.getComponent('render');

                debugLog(`Entity ${entity.id} components:`, { transform, render });

                // Skip if not visible
                if (!render.visible) {
                    console.log(`Entity ${entity.id} is not visible, skipping render`);
                    return;
                }

                // Save the current context state
                renderer.save();

                // Set alpha
                renderer.setAlpha(render.alpha);

                // Apply transformations
                renderer.getContext().translate(transform.x, transform.y);
                renderer.getContext().rotate(transform.rotation);
                renderer.getContext().scale(transform.scaleX, transform.scaleY);

                // Draw based on render type
                if (render.type === 'rect') {
                    renderer.drawRect(
                        -render.width / 2 + render.offsetX,
                        -render.height / 2 + render.offsetY,
                        render.width,
                        render.height,
                        render.color
                    );
                } else if (render.shapeType === 'circle') {
                    const ctx = renderer.getContext();
                    ctx.fillStyle = render.color;
                    ctx.beginPath();
                    ctx.arc(
                        render.offsetX,
                        render.offsetY,
                        render.width / 2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                } else if (render.shapeType === 'sprite' && render.image) {
                    renderer.drawSprite(
                        render.image,
                        render.sourceX,
                        render.sourceY,
                        render.sourceWidth,
                        render.sourceHeight,
                        -render.width / 2 + render.offsetX,
                        -render.height / 2 + render.offsetY,
                        render.width,
                        render.height
                    );
                }

                // Restore the context state
                renderer.restore();
            }
        }

        // Create a test movement system
        class TestMovementSystem extends EntitySystem {
            constructor() {
                // This system requires transform component
                super('testMovementSystem', ['transform']);

                // Set a medium priority
                this.setPriority(0);

                // Movement speed
                this.speed = 100;
            }

            processEntity(entity, deltaTime) {
                debugLog(`MovementSystem processing entity ${entity.id}`);
                const transform = entity.getComponent('transform');
                debugLog(`Entity ${entity.id} transform:`, transform);

                // Move entities with the 'moving' tag
                if (entity.hasTag('moving')) {
                    debugLog(`Entity ${entity.id} has 'moving' tag`);
                    // Move in a circular pattern
                    const time = ServiceLocator.getService('timer').getTotalTime();
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
                    const speed = 200;

                    if (inputHandler.isKeyPressed('ArrowUp')) {
                        transform.y -= speed * deltaTime;
                    }
                    if (inputHandler.isKeyPressed('ArrowDown')) {
                        transform.y += speed * deltaTime;
                    }
                    if (inputHandler.isKeyPressed('ArrowLeft')) {
                        transform.x -= speed * deltaTime;
                    }
                    if (inputHandler.isKeyPressed('ArrowRight')) {
                        transform.x += speed * deltaTime;
                    }

                    // Keep player within bounds
                    transform.x = Math.max(50, Math.min(750, transform.x));
                    transform.y = Math.max(50, Math.min(550, transform.y));
                }
            }
        }

        // Create a test lane system
        class TestLaneSystem extends EntitySystem {
            constructor() {
                // This system requires lane component
                super('testLaneSystem', ['lane']);

                // Set a high priority so it runs before other systems
                this.setPriority(10);

                // Lane configuration
                this.laneCount = 9; // 0 = bonus lane, 1-8 = combat lanes
                this.laneHeight = 60;
                this.laneWidth = 800;
            }

            initialize() {
                console.log('Initializing LaneSystem...');
                console.log(`Creating ${this.laneCount} lane background entities`);

                // Create lane background entities
                for (let i = 0; i < this.laneCount; i++) {
                    console.log(`Creating lane ${i} entity`);
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
                    render.setAsRectangle(this.laneWidth, this.laneHeight, i === 0 ? '#2c3e50' : '#34495e');
                    render.setLayer(-100); // Draw behind other entities
                    entity.addComponent(render);

                    // Add lane component
                    const lane = new LaneComponent();
                    lane.init({
                        laneIndex: i,
                        laneWidth: this.laneWidth,
                        laneHeight: this.laneHeight
                    });
                    entity.addComponent(lane);

                    // Add tag
                    entity.addTag('lane');
                }
            }

            processEntity(entity, deltaTime) {
                debugLog(`LaneSystem processing entity ${entity.id}`);
                const lane = entity.getComponent('lane');
                const transform = entity.getComponent('transform');

                debugLog(`Entity ${entity.id} components:`, { lane, transform });

                // Skip lane background entities
                if (entity.hasTag('lane')) {
                    debugLog(`Entity ${entity.id} is a lane background, skipping`);
                    return;
                }

                // If entity has a transform component, update its Y position based on lane
                if (transform) {
                    transform.y = lane.laneIndex * this.laneHeight + this.laneHeight / 2;
                }
            }

            update(deltaTime) {
                // Call parent update to process entities
                super.update(deltaTime);

                // Draw lane separators
                const ctx = renderer.getContext();
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
                    renderer.drawText(
                        i === 0 ? 'Bonus Lane' : `Lane ${i}`,
                        10,
                        y - 8,
                        '#ffffff',
                        '16px Arial'
                    );
                }
            }
        }

        // Create a test UI system
        class TestUISystem extends EntitySystem {
            constructor() {
                // This system doesn't require any specific components
                super('testUISystem', []);

                // Set lowest priority so it runs last
                this.setPriority(-100);
            }

            update(deltaTime) {
                debugLog('UISystem update called');

                // Get entity count
                const totalEntities = entityManager.getEntityCount();
                const activeEntities = entityManager.getActiveEntities().length;

                debugLog(`Entity counts: total=${totalEntities}, active=${activeEntities}`);

                // Display entity information
                let infoText = `Total Entities: ${totalEntities}\n`;
                infoText += `Active Entities: ${activeEntities}\n\n`;
                infoText += 'Controls:\n';
                infoText += 'Arrow Keys: Move player entity\n';
                infoText += 'Space: Toggle entity visibility\n';
                infoText += 'Enter: Create new entity\n';
                infoText += 'Delete: Remove all entities\n';

                // Update the test UI
                testUI.innerText = infoText;

                // Handle input for creating/removing entities
                if (inputHandler.wasKeyJustPressed('Enter')) {
                    this._createRandomEntity();
                }

                if (inputHandler.wasKeyJustPressed('Delete')) {
                    // Remove all entities except lanes and player
                    const entities = entityManager.getAllEntities();
                    for (const entity of entities) {
                        if (!entity.hasTag('lane') && !entity.hasTag('player')) {
                            entityManager.removeEntity(entity);
                        }
                    }
                }

                if (inputHandler.wasKeyJustPressed('Space')) {
                    // Toggle visibility of all entities except lanes and player
                    const entities = entityManager.getAllEntities();
                    for (const entity of entities) {
                        if (!entity.hasTag('lane') && !entity.hasTag('player')) {
                            const render = entity.getComponent('render');
                            if (render) {
                                render.visible = !render.visible;
                            }
                        }
                    }
                }
            }

            _createRandomEntity() {
                const entity = entityManager.createEntity();

                // Random position
                const x = Math.random() * 700 + 50;
                const y = Math.random() * 500 + 50;

                // Random lane
                const laneIndex = Math.floor(Math.random() * 9);

                // Random color
                const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#d35400'];
                const color = colors[Math.floor(Math.random() * colors.length)];

                // Random shape
                const shapes = ['rect', 'circle'];
                const shape = shapes[Math.floor(Math.random() * shapes.length)];

                // Random size
                const size = Math.random() * 30 + 20;

                // Add transform component
                const transform = new TransformComponent();
                transform.init({
                    x: x,
                    y: y,
                    rotation: Math.random() * Math.PI * 2
                });
                entity.addComponent(transform);

                // Add render component
                const render = new RenderComponent();
                if (shape === 'rect') {
                    render.setAsRectangle(size, size, color);
                } else {
                    render.setAsCircle(size / 2, color);
                }
                entity.addComponent(render);

                // Add lane component
                const lane = new LaneComponent();
                lane.init({
                    laneIndex: laneIndex
                });
                entity.addComponent(lane);

                // Add random tags
                if (Math.random() < 0.5) {
                    entity.addTag('moving');
                }

                if (Math.random() < 0.5) {
                    entity.addTag('rotating');
                }

                if (Math.random() < 0.3) {
                    entity.addTag('fast');
                }

                return entity;
            }
        }

        // Add the test systems to the game
        console.log('Adding systems to game...');
        const laneSystem = new TestLaneSystem();
        console.log('Created LaneSystem:', laneSystem);
        game.addSystem(laneSystem);

        const movementSystem = new TestMovementSystem();
        console.log('Created MovementSystem:', movementSystem);
        game.addSystem(movementSystem);

        const renderSystem = new TestRenderSystem();
        console.log('Created RenderSystem:', renderSystem);
        game.addSystem(renderSystem);

        const uiSystem = new TestUISystem();
        console.log('Created UISystem:', uiSystem);
        game.addSystem(uiSystem);

        console.log('All systems added to game');

        // Create a player entity
        console.log('Creating player entity...');
        const playerEntity = entityManager.createEntity();
        console.log('Player entity created:', playerEntity);

        // Add transform component
        const playerTransform = new TransformComponent();
        playerTransform.init({
            x: 400,
            y: 300
        });
        playerEntity.addComponent(playerTransform);

        // Add render component
        const playerRender = new RenderComponent();
        playerRender.setAsRectangle(40, 40, '#f1c40f');
        playerEntity.addComponent(playerRender);

        // Add lane component
        const playerLane = new LaneComponent();
        playerLane.init({
            laneIndex: 4 // Start in the middle lane
        });
        playerEntity.addComponent(playerLane);

        // Add player tag
        playerEntity.addTag('player');

        // Create some initial entities
        for (let i = 0; i < 10; i++) {
            const entity = entityManager.createEntity();

            // Random position
            const angle = i * (Math.PI * 2 / 10);
            const radius = 150;
            const x = 400 + Math.cos(angle) * radius;
            const y = 300 + Math.sin(angle) * radius;

            // Random lane
            const laneIndex = Math.floor(Math.random() * 9);

            // Add transform component
            const entityTransform = new TransformComponent();
            entityTransform.init({
                x: x,
                y: y,
                rotation: angle
            });
            entity.addComponent(entityTransform);

            // Add render component
            const entityRender = new RenderComponent();
            entityRender.setAsRectangle(30, 30, '#3498db');
            entity.addComponent(entityRender);

            // Add lane component
            const entityLane = new LaneComponent();
            entityLane.init({
                laneIndex: laneIndex
            });
            entity.addComponent(entityLane);

            // Add tags
            entity.addTag('moving');

            if (i % 2 === 0) {
                entity.addTag('rotating');
            }

            if (i % 3 === 0) {
                entity.addTag('fast');
            }
        }

        // Start the game loop
        console.log('Starting game loop...');
        game.start();

        console.log('%c ECS framework test initialized successfully ', 'background: #2ecc71; color: white; font-size: 14px; font-weight: bold; padding: 5px;');
        console.log('Current entities:', entityManager.getAllEntities());
        console.log('Active entities:', entityManager.getActiveEntities());
    } catch (error) {
        console.error('%c INITIALIZATION ERROR ', 'background: #e74c3c; color: white; font-size: 14px; font-weight: bold; padding: 5px;');
        console.error('Failed to initialize ECS framework test:', error);
        console.error('Error stack:', error.stack);
        testUI.innerText = `ERROR: ${error.message}\n\nSee console for details (F12)`;
    }
});
