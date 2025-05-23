/**
 * Debug UI Module
 *
 * Creates and manages the debug UI for the step-by-step ECS test.
 */

import { globals } from './globals-test.js';
import { createButton, createToggle } from './ui-helpers.js';
import { createNewEntity, createPlayerEntity, createRandomEntity, createNormalZombie, createArmoredZombie, createGiantZombie, createZombieEmbed, createSmallObstacle, createMediumObstacle, createLargeObstacle, createImpassableHazard, createSoldier, handleLaneCasualties, createLaneBonusSoldier, createLaneBonusStandardGrenade, createLaneBonusStickyGrenade, createLaneBonusAK47 } from './entity-factory.js';
import { updateEntityList, updateComponentPanel, updateSystemPanel } from './ui-updaters.js';
import { TransformComponent } from '../../src/entities/components/transform.js';
import { RenderComponent } from '../../src/entities/components/render.js';
import { LaneComponent } from '../../src/entities/components/lane.js';
import { HealthComponent } from '../../src/entities/components/health.js';
import { CollisionComponent, CollisionType } from '../../src/entities/components/collision.js';
import { MovementComponent, MovementType } from '../../src/entities/components/movement.js';
import { getRandomColor } from './utils.js';
import { ServiceLocator } from '../../src/core/service-locator.js';
import { BonusService } from '../../src/core/bonus-service.js';
import { GunType } from '../../src/entities/components/gun.js';
import { PlayerSoldierService } from '../../src/core/player-soldier-service.js';

// UI panel references
export let debugPanel;
export let entityListPanel;
export let componentPanel;
export let systemPanel;
export let controlPanel;



/**
 * Create the debug UI panels
 */
export function createDebugUI() {
    const uiContainer = document.getElementById('ui-container');

    // Create main debug panel outside the game container
    debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.className = 'debug-panel';

    // Add title
    const title = document.createElement('h1');
    title.textContent = 'ECS Step-by-Step Testing';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    title.style.fontSize = '18px';
    title.style.textAlign = 'center';
    title.style.color = '#3498db';
    title.style.borderBottom = '1px solid #555';
    title.style.paddingBottom = '10px';
    debugPanel.appendChild(title);

    document.body.appendChild(debugPanel);

    // Create control panel
    controlPanel = document.createElement('div');
    controlPanel.id = 'control-panel';
    controlPanel.className = 'panel control-panel';

    // Add title
    const controlTitle = document.createElement('h2');
    controlTitle.textContent = 'Game Controls';
    controlPanel.appendChild(controlTitle);

    // Add game control buttons
    const gameControls = document.createElement('div');
    gameControls.className = 'button-group';

    // Step button
    const stepButton = createButton('Step', () => {
        globals.game.step();
        updateEntityList();
    });
    gameControls.appendChild(stepButton);

    // Resume button
    const resumeButton = createButton('Resume', () => {
        globals.game.resume();
        updateEntityList();
    });
    gameControls.appendChild(resumeButton);

    // Pause button
    const pauseButton = createButton('Pause', () => {
        globals.game.pause();
        updateEntityList();
    });
    gameControls.appendChild(pauseButton);

    controlPanel.appendChild(gameControls);

    // Add entity creation controls
    const entityControls = document.createElement('div');
    entityControls.className = 'control-section';

    const entityTitle = document.createElement('h3');
    entityTitle.textContent = 'Entity Controls';
    entityControls.appendChild(entityTitle);

    const entityButtons = document.createElement('div');
    entityButtons.className = 'button-group';

    // Create entity button
    const createEntityButton = createButton('Create Entity', createNewEntity);
    entityButtons.appendChild(createEntityButton);

    // Create player button
    const createPlayerButton = createButton('Create Player', createPlayerEntity);
    entityButtons.appendChild(createPlayerButton);

    // Create soldier button
    const createSoldierButton = createButton('Add Soldier', () => {
        if (globals.player) {
            const soldier = PlayerSoldierService.addSoldier(globals.entityManager, globals.player);
            updateEntityList();
            updateComponentPanel();
        } else {
            console.error('No player found. Create a player first.');
        }
    });
    entityButtons.appendChild(createSoldierButton);

    // Kill lane button
    const killLaneButton = createButton('Kill Lane', () => {
        if (globals.player) {
            // Get the player's current lane
            const lane = globals.player.getComponent('lane');
            if (lane) {
                console.log(`Handling casualties in lane ${lane.laneIndex}`);
                // Your lane casualty handling logic here
            }
            updateEntityList();
            updateComponentPanel();
        } else {
            console.error('No player found. Create a player first.');
        }
    });
    killLaneButton.title = 'Kill all soldiers in the current lane';
    entityButtons.appendChild(killLaneButton);

    // Create random entity button
    const createRandomButton = createButton('Create Random', createRandomEntity);
    entityButtons.appendChild(createRandomButton);

    // Add a separator
    const separator = document.createElement('div');
    separator.className = 'button-separator';
    entityButtons.appendChild(separator);

    // Create enemy buttons section
    const enemyTitle = document.createElement('h4');
    enemyTitle.textContent = 'Enemies';
    enemyTitle.style.margin = '5px 0';
    entityButtons.appendChild(enemyTitle);

    // Create normal zombie button
    const createNormalZombieButton = createButton('Normal Zombie', createNormalZombie);
    entityButtons.appendChild(createNormalZombieButton);

    // Create armored zombie button
    const createArmoredZombieButton = createButton('Armored Zombie', createArmoredZombie);
    entityButtons.appendChild(createArmoredZombieButton);

    // Create giant zombie button
    const createGiantZombieButton = createButton('Giant Zombie', createGiantZombie);
    entityButtons.appendChild(createGiantZombieButton);

    // Create giant zombie button
    const createZombieEmbedButton = createButton('Zombie Embed', createZombieEmbed);
    entityButtons.appendChild(createZombieEmbedButton);

    // Add a separator
    const separator2 = document.createElement('div');
    separator2.className = 'button-separator';
    entityButtons.appendChild(separator2);

    // Create obstacle buttons section
    const obstacleTitle = document.createElement('h4');
    obstacleTitle.textContent = 'Obstacles';
    obstacleTitle.style.margin = '5px 0';
    entityButtons.appendChild(obstacleTitle);

    // Create small obstacle button
    const createSmallObstacleButton = createButton('Small Obstacle', createSmallObstacle);
    entityButtons.appendChild(createSmallObstacleButton);

    // Create medium obstacle button
    const createMediumObstacleButton = createButton('Medium Obstacle', createMediumObstacle);
    entityButtons.appendChild(createMediumObstacleButton);

    // Create large obstacle button
    const createLargeObstacleButton = createButton('Large Obstacle', createLargeObstacle);
    entityButtons.appendChild(createLargeObstacleButton);

    // Create impassable hazard button
    const createHazardButton = createButton('Hazard', createImpassableHazard);
    entityButtons.appendChild(createHazardButton);

    // Create lane bonus button for soldier
    const createLaneBonusSoldierButton = createButton('Lane Bonus Soldier', createLaneBonusSoldier);
    entityButtons.appendChild(createLaneBonusSoldierButton);

    // Create lane bonus button for standard grenade
    const createLaneBonusStandardGrenadeButton = createButton('Lane Bonus Standard Grenade', createLaneBonusStandardGrenade);
    entityButtons.appendChild(createLaneBonusStandardGrenadeButton);

    // Create lane bonus button for sticky grenade
    const createLaneBonusStickyGrenadeButton = createButton('Lane Bonus Sticky Grenade', createLaneBonusStickyGrenade);
    entityButtons.appendChild(createLaneBonusStickyGrenadeButton);

    // Create lane bonus button for AK-47
    const createLaneBonusAK47Button = createButton('Lane Bonus AK-47', createLaneBonusAK47);
    entityButtons.appendChild(createLaneBonusAK47Button);

    // Add a separator
    const separator3 = document.createElement('div');
    separator3.className = 'button-separator';
    entityButtons.appendChild(separator3);

    // Add test scenario section
    const testTitle = document.createElement('h4');
    testTitle.textContent = 'Test Scenarios';
    testTitle.style.margin = '5px 0';
    entityButtons.appendChild(testTitle);

    // Add gun buttons section
    const gunTitle = document.createElement('h4');
    gunTitle.textContent = 'Guns';
    gunTitle.style.margin = '5px 0';
    entityButtons.appendChild(gunTitle);

    // Create buttons for each gun type
    const gunTypes = [
        { type: GunType.GLOCK_17, label: 'Glock 17' },
        { type: GunType.DESERT_EAGLE, label: 'Desert Eagle' },
        { type: GunType.BENELLI_M4, label: 'Benelli M4' },
        { type: GunType.AK47, label: 'AK47' },
        { type: GunType.BARRETT_XM109, label: 'Barrett XM109' }
    ];

    // Add gun buttons
    for (const gun of gunTypes) {
        const gunButton = createButton(gun.label, () => {
            // Get the bonus service
            let bonusService = ServiceLocator.getService('bonusService');
            if (!bonusService) {
                console.error('Bonus service not found. Initializing...');
                // Initialize bonus service if not found
                const newBonusService = new BonusService();
                ServiceLocator.registerService('bonusService', newBonusService);
                bonusService = newBonusService;
                bonusService.initialize();
            }
            
            // Get player entity
            const entityManager = ServiceLocator.getService('entityManager');
            const playerEntities = entityManager.getEntitiesWithTag('player');
            
            if (playerEntities.length === 0) {
                console.error('No player entity found');
                return;
            }
            
            const playerEntity = playerEntities[0];
            
            // Apply gun bonus
            bonusService.applyGunBonus(playerEntity, gun.type);
            console.log(`Applied ${gun.label} to player`);
        });
        entityButtons.appendChild(gunButton);
    }

    // Add a separator
    const separator4 = document.createElement('div');
    separator4.className = 'button-separator';
    entityButtons.appendChild(separator4);

    // Add grenade buttons section
    const grenadeTitle = document.createElement('h4');
    grenadeTitle.textContent = 'Grenades';
    grenadeTitle.style.margin = '5px 0';
    entityButtons.appendChild(grenadeTitle);

    // Create buttons for each grenade type
    const grenadeTypes = [
        { type: 'standard', label: 'Standard Grenade' },
        { type: 'sticky', label: 'Sticky Grenade' }
    ];

    // Add grenade buttons
    for (const grenade of grenadeTypes) {
        const grenadeButton = createButton(grenade.label, () => {
            // Get player entity
            const entityManager = ServiceLocator.getService('entityManager');
            const playerEntities = entityManager.getEntitiesWithTag('player');
            
            if (playerEntities.length === 0) {
                console.error('No player entity found');
                return;
            }
            
            // Get player instance
            if (globals.player) {
                // Add grenades to player
                PlayerSoldierService.addGrenades(globals.player, grenade.type, 3);
                console.log(`Added 3 ${grenade.label}s to player`);
            } else {
                console.error('No player instance found');
            }
        });
        entityButtons.appendChild(grenadeButton);
    }

    // Add a separator
    const separator5 = document.createElement('div');
    separator5.className = 'button-separator';
    entityButtons.appendChild(separator5);

    // Remove entity button
    const removeEntityButton = createButton('Remove Selected', () => {
        if (globals.selectedEntity) {
            globals.entityManager.removeEntity(globals.selectedEntity);
            globals.selectedEntity = null;
            updateEntityList();
            updateComponentPanel();
        }
    });
    entityButtons.appendChild(removeEntityButton);

    entityControls.appendChild(entityButtons);
    controlPanel.appendChild(entityControls);

    // Add frame counter
    const frameCounter = document.createElement('div');
    frameCounter.id = 'frame-counter';
    frameCounter.className = 'frame-counter';
    frameCounter.textContent = 'Frame: 0';

    // Update frame counter when game steps
    window.addEventListener('game:step', (e) => {
        frameCounter.textContent = `Frame: ${e.detail.frameCount}`;
    });

    controlPanel.appendChild(frameCounter);

    // Add keyboard shortcuts info as a compact row
    const shortcutsInfo = document.createElement('div');
    shortcutsInfo.className = 'shortcuts-info';
    shortcutsInfo.innerHTML = `
        <div class="shortcut-compact">
            <span class="shortcut-key">S</span>Step
            <span class="shortcut-key">R</span>Resume/Pause
            <span class="shortcut-key">N</span>New
            <span class="shortcut-key">P</span>Player
            <span class="shortcut-key">A</span>Add Soldier
            <span class="shortcut-key">K</span>Kill Lane
            <span class="shortcut-key">Del</span>Remove
        </div>
        <div class="shortcut-compact">
            <span class="shortcut-key">O</span>Move Up
            <span class="shortcut-key">L</span>Move Down
            <span class="shortcut-key">K</span>Slow Down
            <span class="shortcut-key">;</span>Speed Up
        </div>
        <div class="shortcut-compact">
            <span class="shortcut-key">1</span>Normal Zombie
            <span class="shortcut-key">2</span>Armored Zombie
            <span class="shortcut-key">3</span>Giant Zombie
            <span class="shortcut-key">4</span>Small Obstacle
            <span class="shortcut-key">5</span>Medium Obstacle
            <span class="shortcut-key">6</span>Large Obstacle
            <span class="shortcut-key">7</span>Hazard
        </div>
        <div class="shortcut-compact">
            <span class="shortcut-key">Y</span>Throw Standard Grenade
            <span class="shortcut-key">T</span>Throw Sticky Grenade
        </div>
    `;
    controlPanel.appendChild(shortcutsInfo);

    debugPanel.appendChild(controlPanel);

    // Create entity list panel with collapsible header
    entityListPanel = document.createElement('div');
    entityListPanel.id = 'entity-list-panel';
    entityListPanel.className = 'panel entity-list-panel';

    const entityListHeader = document.createElement('div');
    entityListHeader.className = 'panel-header';
    entityListHeader.style.cursor = 'pointer';
    entityListHeader.style.display = 'flex';
    entityListHeader.style.justifyContent = 'space-between';
    entityListHeader.style.alignItems = 'center';

    const entityListTitle = document.createElement('h2');
    entityListTitle.textContent = 'Entities';
    entityListHeader.appendChild(entityListTitle);

    // Add collapse/expand indicator
    const entityListIndicator = document.createElement('span');
    entityListIndicator.className = 'collapse-indicator';
    entityListIndicator.textContent = '▼';
    entityListHeader.appendChild(entityListIndicator);

    // Add collapse/expand functionality
    const entityListContent = document.createElement('div');
    entityListContent.id = 'entity-list-content';
    entityListContent.style.display = 'block';

    entityListHeader.addEventListener('click', () => {
        if (entityListContent.style.display === 'none') {
            entityListContent.style.display = 'block';
            entityListTitle.textContent = 'Entities';
            entityListIndicator.textContent = '▼';
        } else {
            entityListContent.style.display = 'none';
            entityListTitle.textContent = 'Entities';
            entityListIndicator.textContent = '►';
        }
    });

    entityListPanel.appendChild(entityListHeader);
    entityListPanel.appendChild(entityListContent);

    const entityList = document.createElement('div');
    entityList.id = 'entity-list';
    entityList.className = 'entity-list';
    entityListContent.appendChild(entityList);

    debugPanel.appendChild(entityListPanel);

    // Create component panel with collapsible header
    componentPanel = document.createElement('div');
    componentPanel.id = 'component-panel';
    componentPanel.className = 'panel component-panel';

    const componentHeader = document.createElement('div');
    componentHeader.className = 'panel-header';
    componentHeader.style.cursor = 'pointer';
    componentHeader.style.display = 'flex';
    componentHeader.style.justifyContent = 'space-between';
    componentHeader.style.alignItems = 'center';

    const componentTitle = document.createElement('h2');
    componentTitle.textContent = 'Components';
    componentHeader.appendChild(componentTitle);

    // Add collapse/expand indicator
    const componentIndicator = document.createElement('span');
    componentIndicator.className = 'collapse-indicator';
    componentIndicator.textContent = '▼';
    componentHeader.appendChild(componentIndicator);

    // Add collapse/expand functionality
    const componentContent = document.createElement('div');
    componentContent.id = 'component-content';
    componentContent.style.display = 'block';

    componentHeader.addEventListener('click', () => {
        if (componentContent.style.display === 'none') {
            componentContent.style.display = 'block';
            componentTitle.textContent = 'Components';
            componentIndicator.textContent = '▼';
        } else {
            componentContent.style.display = 'none';
            componentTitle.textContent = 'Components';
            componentIndicator.textContent = '►';
        }
    });

    componentPanel.appendChild(componentHeader);
    componentPanel.appendChild(componentContent);

    const componentList = document.createElement('div');
    componentList.id = 'component-list';
    componentList.className = 'component-list';
    componentContent.appendChild(componentList);

    // Add component buttons
    const componentButtons = document.createElement('div');
    componentButtons.className = 'button-group';

    // Add Transform button
    const addTransformButton = createButton('Add Transform', () => {
        if (globals.selectedEntity && !globals.selectedEntity.hasComponent('transform')) {
            const transform = new TransformComponent();
            transform.init({
                x: 400,
                y: 300
            });
            globals.selectedEntity.addComponent(transform);
            updateComponentPanel();
        }
    });
    componentButtons.appendChild(addTransformButton);

    // Add Render button
    const addRenderButton = createButton('Add Render', () => {
        if (globals.selectedEntity && !globals.selectedEntity.hasComponent('render')) {
            const render = new RenderComponent();
            render.setAsRectangle(40, 40, getRandomColor());
            globals.selectedEntity.addComponent(render);
            updateComponentPanel();
        }
    });
    componentButtons.appendChild(addRenderButton);

    // Add Lane button
    const addLaneButton = createButton('Add Lane', () => {
        if (globals.selectedEntity && !globals.selectedEntity.hasComponent('lane')) {
            const lane = new LaneComponent();
            lane.init({
                laneIndex: 4,
                laneWidth: 800,
                laneHeight: 60
            });
            globals.selectedEntity.addComponent(lane);
            updateComponentPanel();
        }
    });
    componentButtons.appendChild(addLaneButton);

    // Add a separator
    const componentSeparator = document.createElement('div');
    componentSeparator.className = 'button-separator';
    componentButtons.appendChild(componentSeparator);

    // Add Health button
    const addHealthButton = createButton('Add Health', () => {
        if (globals.selectedEntity && !globals.selectedEntity.hasComponent('health')) {
            const health = new HealthComponent();
            health.init({
                maxHealth: 10,
                currentHealth: 10
            });
            globals.selectedEntity.addComponent(health);
            updateComponentPanel();
        }
    });
    componentButtons.appendChild(addHealthButton);

    // Add Collision button
    const addCollisionButton = createButton('Add Collision', () => {
        if (globals.selectedEntity && !globals.selectedEntity.hasComponent('collision')) {
            const collision = new CollisionComponent();
            collision.init({
                type: CollisionType.NONE,
                width: 40,
                height: 40
            });
            globals.selectedEntity.addComponent(collision);
            updateComponentPanel();
        }
    });
    componentButtons.appendChild(addCollisionButton);

    // Add Movement button
    const addMovementButton = createButton('Add Movement', () => {
        if (globals.selectedEntity && !globals.selectedEntity.hasComponent('movement')) {
            const movement = new MovementComponent();
            movement.init({
                type: MovementType.NONE,
                speed: 50,
                directionX: -1,
                directionY: 0
            });
            globals.selectedEntity.addComponent(movement);
            updateComponentPanel();
        }
    });
    componentButtons.appendChild(addMovementButton);

    componentContent.appendChild(componentButtons);

    debugPanel.appendChild(componentPanel);

    // Create system panel with collapsible header
    systemPanel = document.createElement('div');
    systemPanel.id = 'system-panel';
    systemPanel.className = 'panel system-panel';

    const systemHeader = document.createElement('div');
    systemHeader.className = 'panel-header';
    systemHeader.style.cursor = 'pointer';
    systemHeader.style.display = 'flex';
    systemHeader.style.justifyContent = 'space-between';
    systemHeader.style.alignItems = 'center';

    const systemTitle = document.createElement('h2');
    systemTitle.textContent = 'Systems';
    systemHeader.appendChild(systemTitle);

    // Add collapse/expand indicator
    const systemIndicator = document.createElement('span');
    systemIndicator.className = 'collapse-indicator';
    systemIndicator.textContent = '▼';
    systemHeader.appendChild(systemIndicator);

    // Add collapse/expand functionality
    const systemContent = document.createElement('div');
    systemContent.id = 'system-content';
    systemContent.style.display = 'block';

    systemHeader.addEventListener('click', () => {
        if (systemContent.style.display === 'none') {
            systemContent.style.display = 'block';
            systemTitle.textContent = 'Systems';
            systemIndicator.textContent = '▼';
        } else {
            systemContent.style.display = 'none';
            systemTitle.textContent = 'Systems';
            systemIndicator.textContent = '►';
        }
    });

    systemPanel.appendChild(systemHeader);
    systemPanel.appendChild(systemContent);

    const systemList = document.createElement('div');
    systemList.id = 'system-list';
    systemList.className = 'system-list';
    systemContent.appendChild(systemList);

    debugPanel.appendChild(systemPanel);

    // Add CSS styles
    addDebugStyles();
}

/**
 * Add CSS styles for the debug UI
 */
function addDebugStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            margin: 0;
            padding: 0;
            display: flex;
            height: 100vh;
            background-color: #1e1e1e;
            color: white;
            font-family: monospace;
        }

        #game-container {
            flex: 0 0 800px;
            height: 600px;
            position: relative;
            margin: 20px;
        }

        .debug-panel {
            flex: 1;
            padding: 10px;
            background-color: #2c2c2c;
            color: white;
            font-family: monospace;
            font-size: 12px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            max-height: 100vh;
            margin: 20px 20px 20px 0;
        }

        .panel {
            margin: 0 0 10px 0;
            padding: 10px;
            background-color: #333;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .control-panel {
            flex: 0 0 auto;
        }

        .entity-list-panel {
            flex: 0 0 auto;
        }

        #entity-list-content {
            overflow-y: auto;
            max-height: 200px;
        }

        .component-panel {
            flex: 1 1 auto;
        }

        #component-content {
            overflow-y: auto;
            max-height: 300px;
        }

        .system-panel {
            flex: 0 0 auto;
        }

        #system-content {
            overflow-y: auto;
            max-height: 200px;
        }

        h2 {
            margin: 0 0 5px 0;
            font-size: 14px;
            border-bottom: 1px solid #555;
            padding-bottom: 3px;
        }

        h3 {
            margin: 5px 0 3px 0;
            font-size: 12px;
        }

        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
            margin-bottom: 5px;
        }

        .button-separator {
            width: 100%;
            height: 1px;
            background-color: #555;
            margin: 5px 0;
        }

        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
        }

        button:hover {
            background-color: #2980b9;
        }

        button:active {
            background-color: #1f6aa5;
            transform: translateY(1px);
        }

        .entity-list {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .entity-item {
            padding: 8px;
            background-color: #444;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-bottom: 5px;
            transition: background-color 0.2s;
        }

        .entity-item:hover {
            background-color: #555;
        }

        .entity-item.selected {
            background-color: #3498db;
        }

        .component-list {
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: 5px;
            max-height: 400px;
            overflow-y: auto;
        }

        .component-item {
            padding: 8px;
            background-color: #444;
            border-radius: 4px;
            font-size: 12px;
            margin-bottom: 8px;
            border: 1px solid #555;
        }

        .component-header {
            font-weight: bold;
            margin-bottom: 5px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2px 0;
        }

        .component-properties {
            display: flex;
            flex-direction: column;
            gap: 3px;
            margin-top: 3px;
            padding: 5px;
            background-color: #333;
            border-radius: 3px;
        }

        .property-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2px 0;
        }

        .property-name {
            flex: 0 0 40%;
            color: #aaa;
        }

        .property-value {
            flex: 0 0 55%;
            display: flex;
            align-items: center;
        }

        .property-value input {
            width: 100%;
            background-color: #333;
            color: white;
            border: 1px solid #555;
            padding: 2px 5px;
        }

        .property-value .system-toggle {
            width: 40px;
            height: 20px;
            background-color: #555;
            border-radius: 10px;
            position: relative;
            cursor: pointer;
        }

        .property-value .system-toggle.enabled::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            background-color: #2ecc71;
            border-radius: 50%;
            top: 2px;
            right: 2px;
        }

        .property-value .system-toggle.disabled::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            background-color: #e74c3c;
            border-radius: 50%;
            top: 2px;
            left: 2px;
        }

        .system-list {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .system-item {
            padding: 8px;
            background-color: #444;
            border-radius: 4px;
            font-size: 12px;
            margin-bottom: 8px;
        }

        .system-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }

        .system-name {
            font-weight: bold;
        }

        .system-toggle {
            width: 40px;
            height: 20px;
            background-color: #555;
            border-radius: 10px;
            position: relative;
            cursor: pointer;
        }

        .system-toggle.enabled::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            background-color: #2ecc71;
            border-radius: 50%;
            top: 2px;
            right: 2px;
        }

        .system-toggle.disabled::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            background-color: #e74c3c;
            border-radius: 50%;
            top: 2px;
            left: 2px;
        }

        .system-run {
            background-color: #2ecc71;
            color: white;
            border: none;
            padding: 2px 5px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
        }

        .system-run:hover {
            background-color: #27ae60;
        }

        .log-list {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .log-item {
            padding: 5px;
            background-color: #444;
            border-radius: 3px;
            word-break: break-word;
        }

        .frame-counter {
            margin-top: 10px;
            font-size: 14px;
            text-align: center;
            font-weight: bold;
        }

        .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 5px;
        }

        .tag-item {
            background-color: #e67e22;
            color: white;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 10px;
        }

        .shortcuts-info {
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px solid #555;
            font-size: 10px;
        }

        .shortcut-compact {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            align-items: center;
        }

        .shortcut-key {
            background-color: #555;
            padding: 1px 3px;
            border-radius: 3px;
            font-family: monospace;
            margin-right: 2px;
            margin-left: 5px;
            font-size: 9px;
        }

        .collapse-indicator {
            font-size: 10px;
            color: #3498db;
            margin-right: 5px;
        }

        .panel-header {
            border-bottom: 1px solid #555;
            padding-bottom: 3px;
            margin-bottom: 5px;
        }
    `;
    document.head.appendChild(style);
}



