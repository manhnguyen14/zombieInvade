/**
 * Entity Factory Module
 *
 * Provides functions for creating different types of entities.
 */

import { globals } from './globals-test.js';
import { TransformComponent } from '../../src/entities/components/transform.js';
import { RenderComponent } from '../../src/entities/components/render.js';
import { LaneComponent } from '../../src/entities/components/lane.js';
import { HealthComponent } from '../../src/entities/components/health.js';
import { CollisionComponent, CollisionType } from '../../src/entities/components/collision.js';
import { MovementComponent, MovementType } from '../../src/entities/components/movement.js';
import { updateEntityList, updateComponentPanel } from './ui-updaters.js';
import { getRandomColor } from './utils.js';
import { createLaneBonusEntity } from '../../src/entities/lane-bonus.js';
import { createEmbeddedBonus } from '../../src/entities/embedded-bonus.js';

// Import entity factory if available, otherwise we'll implement our own creation methods
import { EntityFactory as GameEntityFactory } from '../../src/entities/entity-factory.js';
import { PlayerSoldierService } from '../../src/core/player-soldier-service.js';

// Counter for entity creation
let entityCounter = 0;

/**
 * Create a new empty entity
 */
export function createNewEntity() {
    const entity = globals.entityManager.createEntity();
    entityCounter++;

    // Select the new entity
    globals.selectedEntity = entity;

    // Update UI
    updateEntityList();
    updateComponentPanel();

    // Notify that the entity is fully initialized with all components
    entityManager.notifyEntityAdded(entity);
    return entity;
}

/**
 * Create a player entity
 * @param {number} [soldierCount=0] - Number of starting soldiers
 */
export function createPlayerEntity(soldierCount = 0) {
    console.log('Creating player entity...');
    try {
        // Check if a player already exists
        if (globals.player) {
            console.log('Player already exists, not creating a new one');
            return globals.player;
        }
        
        // Use the game entity factory
        const player = GameEntityFactory.createPlayer(globals.entityManager, soldierCount);
        
        // Store the player in globals
        globals.player = player;
        
        // Use the LaneSystem to position the entity in the lane
        const laneSystem = globals.systems.laneSystem;
        if (laneSystem) {
            const lane = player.getComponent('lane');
            laneSystem.processEntity(player, 0);
        }
        
        // Select the player entity
        globals.selectedEntity = player;
        
        // Update UI
        updateEntityList();
        updateComponentPanel();
        
        return player;
    } catch (error) {
        console.error('Error creating player entity:', error);
        return null;
    }
}

/**
 * Create a soldier entity
 */
export function createSoldier() {
    try {
        // Find the player entity
        if (!globals.player) {
            console.error('No player found. Create a player first.');
            return null;
        }
        
        // Add a soldier to the player
        const soldier = PlayerSoldierService.addSoldier(globals.entityManager, globals.player);
        
        // Select the soldier entity
        globals.selectedEntity = soldier;
        
        // Update UI
        updateEntityList();
        updateComponentPanel();
        
        return soldier;
    } catch (error) {
        console.error('Error creating soldier:', error);
        return null;
    }
}

/**
 * Handle lane casualties for the player
 */
export function handleLaneCasualties() {
    try {
        // Find the player instance
        const playerInfoSystem = globals.systems.playerInfoSystem;
        if (!playerInfoSystem || !playerInfoSystem.player) {
            return;
        }

        // Get the player's current lane
        const player = playerInfoSystem.player;
        const lane = player.getComponent('lane');
        if (!lane) {
            return;
        }

        // Update UI
        updateEntityList();
        updateComponentPanel();

    } catch (error) {
        console.error('Error handling lane casualties:', error);
    }
}

/**
 * Create a random entity
 */
export function createRandomEntity() {
    const entity = globals.entityManager.createEntity();

    // Random position
    const x = Math.random() * 700 + 50;

    // Random lane
    const laneIndex = Math.floor(Math.random() * 9);

    // Random color
    const color = getRandomColor();

    // Random shape
    const shapes = ['rect', 'circle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    // Random size
    const size = Math.random() * 30 + 20;

    // Add transform component
    const transform = new TransformComponent();
    transform.init({
        x: x,
        y: 0, // This will be updated by the lane system
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

    // Add collision component
    const collision = new CollisionComponent();
    collision.init({
        type: CollisionType.NONE,
        width: size,
        height: size
    });
    entity.addComponent(collision);

    // Use the LaneSystem to position the entity in the lane
    const laneSystem = globals.systems.laneSystem;
    if (laneSystem) {
        laneSystem.processEntity(entity, 0);
    }

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

    // Select the new entity
    globals.selectedEntity = entity;

    // Update UI
    updateEntityList();
    updateComponentPanel();

    const entityManager = globals.entityManager;
    // Notify that the entity is fully initialized with all components
    entityManager.notifyEntityAdded(entity);

    return entity;
}

/**
 * Create a normal zombie entity
 */
export function createNormalZombie() {
    try {
        // Use the game entity factory if available
        const zombie = GameEntityFactory.createNormalZombie(globals.entityManager, 'Standard', {
            laneIndex: Math.floor(Math.random() * 8) + 1, // Random lane (1-8)
            x: 700, // Right side of the screen
            speed: 50 // Set a speed for the zombie
        });

        // Select the new entity
        globals.selectedEntity = zombie;

        // Update UI
        updateEntityList();
        updateComponentPanel();

        const movement = zombie.getComponent('movement');
        console.log(`[MOVEMENT_SYSTEM] Created normal zombie (ID: ${zombie.id}, Speed: ${movement ? movement.speed : 'N/A'}, Type: ${movement ? movement.type : 'N/A'})`);

        return zombie;
    } catch (error) {
        console.error('Error creating normal zombie:', error);
        return null;
    }
}

/**
 * Create an armored zombie entity
 */
export function createArmoredZombie() {
    try {
        // Use the game entity factory if available
        const zombie = GameEntityFactory.createArmoredZombie(globals.entityManager, 'Standard', {
            laneIndex: Math.floor(Math.random() * 8) + 1, // Random lane (1-8)
            x: 700, // Right side of the screen
            speed: 40 // Set a speed for the armored zombie
        });

        // Select the new entity
        globals.selectedEntity = zombie;

        // Update UI
        updateEntityList();
        updateComponentPanel();

        return zombie;
    } catch (error) {
        console.error('Error creating armored zombie:', error);
        return null;
    }
}

/**
 * Create a giant zombie entity
 */
export function createGiantZombie() {
    try {
        // Use the game entity factory if available
        const zombie = GameEntityFactory.createGiantZombie(globals.entityManager, 'Standard', {
            laneIndex: Math.floor(Math.random() * 8) + 1, // Random lane (1-8)
            x: 700, // Right side of the screen
            speed: 30 // Set a speed for the giant zombie
        });

        // Select the new entity
        globals.selectedEntity = zombie;

        // Update UI
        updateEntityList();
        updateComponentPanel();

        return zombie;
    } catch (error) {
        console.error('Error creating giant zombie:', error);
        return null;
    }
}

/**
 * Create a zombie embed entity
 */
export function createZombieEmbed() {
    try {
        // Use the game entity factory if available
        const zombie = GameEntityFactory.createGiantZombie(globals.entityManager, 'Standard', {
            laneIndex: Math.floor(Math.random() * 8) + 1, // Random lane (1-8)
            x: 700, // Right side of the screen
            speed: 30 // Set a speed for the zombie
        });
        const bonus = createEmbeddedBonus(globals.entityManager, {
            bonusType: 'gun',
            bonusVariant: 'ak47',
            lifetime: 5, // Set a lifetime for the bonus
            hostEntityId: zombie.id
        });

        // Select the new entity
        globals.selectedEntity = zombie;

        // Update UI
        updateEntityList();
        updateComponentPanel();

        return zombie;
    } catch (error) {
        console.error('Error creating zombie embed:', error);
        return null;
    }
}

/**
 * Create a bonus entity for soldier
 */
export function createLaneBonusSoldier() {
    try {
        // Use the game entity factory if available
        const bonus = createLaneBonusEntity(globals.entityManager, {
            speed: 0,
            bonusType: 'soldier',
            bonusVariant: 'standard'
        });

        // Select the new entity
        globals.selectedEntity = bonus.entity;

        // Update UI
        updateEntityList();
        updateComponentPanel();

        return bonus.entity;
    } catch (error) {
        console.error('Error creating bonus:', error);
        return null;
    }
}

/**
 * Create a bonus entity for grenade
 */
export function createLaneBonusStandardGrenade() {
    try {
        // Use the game entity factory if available
        const bonus = createLaneBonusEntity(globals.entityManager, {
            speed: 0,
            bonusType: 'grenade',
            bonusVariant: 'standard'
        });

        // Select the new entity
        globals.selectedEntity = bonus.entity;

        // Update UI
        updateEntityList();
        updateComponentPanel(); 

        return bonus.entity;            
    } catch (error) {
        console.error('Error creating bonus:', error);
        return null;
    }
}

/**
 * Create a bonus entity for sticky grenade
 */
export function createLaneBonusStickyGrenade() {
    try {
        // Use the game entity factory if available
        const bonus = createLaneBonusEntity(globals.entityManager, {
            speed: 0,
            bonusType: 'grenade',
            bonusVariant: 'sticky'
        });

        // Select the new entity
        globals.selectedEntity = bonus.entity;

        // Update UI
        updateEntityList();
        updateComponentPanel();

        return bonus.entity;        
    } catch (error) {
        console.error('Error creating bonus:', error);
        return null;
    }
}

/**
 * Create a bonus entity for AK-47  
 */
export function createLaneBonusAK47() {
    try {
        // Use the game entity factory if available
        const bonus = createLaneBonusEntity(globals.entityManager, {
            speed: 0,
            bonusType: 'gun',
            bonusVariant: 'ak47'
        });

        // Select the new entity
        globals.selectedEntity = bonus.entity;

        // Update UI
        updateEntityList();
        updateComponentPanel(); 

        return bonus.entity;        
    } catch (error) {
        console.error('Error creating bonus:', error);
        return null;
    }
}

/**
 * Create a small obstacle entity
 */
export function createSmallObstacle() {
    try {
        // Use the game entity factory if available
        const obstacle = GameEntityFactory.createSmallObstacle(globals.entityManager, 'Standard', {
            laneIndex: Math.floor(Math.random() * 8) + 1, // Random lane (1-8)
            x: 700, // Right side of the screen
            speed: 20 // Set a speed for the small obstacle
        });

        // Select the new entity
        globals.selectedEntity = obstacle;

        // Update UI
        updateEntityList();
        updateComponentPanel();

        return obstacle;
    } catch (error) {
        console.error('Error creating small obstacle:', error);
        return null;
    }
}

/**
 * Create a medium obstacle entity
 */
export function createMediumObstacle() {
    try {
        // Use the game entity factory if available
        const obstacle = GameEntityFactory.createMediumObstacle(globals.entityManager, 'Standard', {
            laneIndex: Math.floor(Math.random() * 8) + 1, // Random lane (1-8)
            x: 700, // Right side of the screen
            speed: 15 // Set a speed for the medium obstacle
        });

        // Select the new entity
        globals.selectedEntity = obstacle;

        // Update UI
        updateEntityList();
        updateComponentPanel();


        return obstacle;
    } catch (error) {
        console.error('Error creating medium obstacle:', error);
        return null;
    }
}

/**
 * Create a large obstacle entity
 */
export function createLargeObstacle() {
    try {
        // Use the game entity factory if available
        const obstacle = GameEntityFactory.createLargeObstacle(globals.entityManager, 'Standard', {
            laneIndex: Math.floor(Math.random() * 8) + 1, // Random lane (1-8)
            x: 700, // Right side of the screen
            speed: 10 // Set a speed for the large obstacle
        });

        // Select the new entity
        globals.selectedEntity = obstacle;

        // Update UI
        updateEntityList();
        updateComponentPanel();

        return obstacle;
    } catch (error) {
        console.error('Error creating large obstacle:', error);
        return null;
    }
}

/**
 * Create an impassable hazard entity
 */
export function createImpassableHazard() {
    try {
        // Use the game entity factory if available
        const hazard = GameEntityFactory.createImpassableHazard(globals.entityManager, 'Hole', {
            laneIndex: Math.floor(Math.random() * 8) + 1, // Random lane (1-8)
            x: 700, // Right side of the screen
            speed: 0 // Hazards have 0 innate speed, they move with game speed
        });

        // Select the new entity
        globals.selectedEntity = hazard.entity;

        // Update UI
        updateEntityList();
        updateComponentPanel();

        const movement = hazard.entity.getComponent('movement');
        console.log(`[MOVEMENT_SYSTEM] Created impassable hazard (ID: ${hazard.entity.id}, Speed: ${movement ? movement.speed : 'N/A'}, Type: ${movement ? movement.type : 'N/A'})`);
        return hazard.entity;
    } catch (error) {
        console.error('Error creating impassable hazard:', error);
        return null;
    }
}
