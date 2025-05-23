/**
 * Entity Factory
 *
 * Provides static methods for creating different types of game entities.
 */

import { NormalZombieVariants } from './zombie-types/normal-zombie.js';
import { ArmoredZombieVariants } from './zombie-types/armored-zombie.js';
import { GiantZombieVariants } from './zombie-types/giant-zombie.js';
import { SmallObstacleVariants, createSmallObstacleEntity } from './obstacle-types/small-obstacle.js';
import { MediumObstacleVariants, createMediumObstacleEntity } from './obstacle-types/medium-obstacle.js';
import { LargeObstacleVariants, createLargeObstacleEntity } from './obstacle-types/large-obstacle.js';
import { ImpassableHazardVariants, createImpassableHazardEntity } from './obstacle-types/impassable-hazard.js';
import { createEmbeddedBonus } from './embedded-bonus.js';
import { createNormalZombieEntity } from './zombie-types/normal-zombie.js';
import { createArmoredZombieEntity } from './zombie-types/armored-zombie.js';
import { createGiantZombieEntity } from './zombie-types/giant-zombie.js';
import { createPlayerEntity } from './player.js';
import { createSoldierEntity } from './soldier.js';
import { PlayerSoldierService } from '../core/player-soldier-service.js';
import { createLaneBonusEntity } from './lane-bonus.js';

export class EntityFactory {
    /**
     * Create a player entity
     * @param {EntityManager} entityManager - The entity manager
     * @param {number} [soldierCount=3] - Number of starting soldiers
     * @returns {Entity} The player entity
     */
    static createPlayer(entityManager, soldierCount = 3) {
        const playerEntity = createPlayerEntity(entityManager);
        // Add initial soldiers
        for (let i = 0; i < soldierCount; i++) {
            PlayerSoldierService.addSoldier(entityManager, playerEntity);
        }
        return playerEntity;
    }

    /**
     * Create a soldier entity
     * @param {EntityManager} entityManager - The entity manager
     * @param {Entity} playerEntity - The player entity to add the soldier to
     * @param {Object} [config={}] - Soldier configuration
     * @returns {Entity} The soldier entity
     */
    static createSoldier(entityManager, playerEntity, config = {}) {
        return PlayerSoldierService.addSoldier(entityManager, playerEntity, config);
    }

    /**
     * Create a zombie entity
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} type - Zombie type ('normal', 'armored', 'giant')
     * @param {string} variant - Zombie variant
     * @param {Object} config - Additional configuration
     * @returns {Enemy} The zombie instance
     */
    static createZombie(entityManager, type, variant, config = {}) {
        switch (type) {
            case 'normal':
                return EntityFactory.createNormalZombie(entityManager, variant, config);
            case 'armored':
                return EntityFactory.createArmoredZombie(entityManager, variant, config);
            case 'giant':
                return EntityFactory.createGiantZombie(entityManager, variant, config);
            default:
                console.warn(`Unknown zombie type: ${type}, defaulting to normal`);
                return EntityFactory.createNormalZombie(entityManager, variant, config);
        }
    }
    


    /**
     * Create a normal zombie
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} variant - Zombie variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The normal zombie instance
     */
    static createNormalZombie(entityManager, variant, config = {}) {
        // Get variant configuration
        const variantConfig = NormalZombieVariants[variant] || NormalZombieVariants.Standard;

        // Merge variant config with provided config
        const zombieConfig = { ...variantConfig, ...config };

        return createNormalZombieEntity(entityManager, zombieConfig);
    }

    /**
     * Create an armored zombie
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} variant - Zombie variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The armored zombie instance
     */
    static createArmoredZombie(entityManager, variant, config = {}) {
        // Get variant configuration
        const variantConfig = ArmoredZombieVariants[variant] || ArmoredZombieVariants.Standard;

        // Merge variant config with provided config
        const zombieConfig = { ...variantConfig, ...config };

        return createArmoredZombieEntity(entityManager, zombieConfig);
    }

    /**
     * Create a giant zombie
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} variant - Zombie variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The giant zombie instance
     */
    static createGiantZombie(entityManager, variant, config = {}) {
        // Get variant configuration
        const variantConfig = GiantZombieVariants[variant] || GiantZombieVariants.Standard;

        // Merge variant config with provided config
        const zombieConfig = { ...variantConfig, ...config };

        return createGiantZombieEntity(entityManager, zombieConfig);
    }

    /**
     * Create an obstacle entity
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} type - Obstacle type ('small', 'medium', 'large', 'hazard')
     * @param {string} variant - Obstacle variant
     * @param {Object} config - Additional configuration
     * @returns {Obstacle} The obstacle instance
     */
    static createObstacle(entityManager, type, variant, config = {}) {
        switch (type) {
            case 'small':
                return EntityFactory.createSmallObstacle(entityManager, variant, config);
            case 'medium':
                return EntityFactory.createMediumObstacle(entityManager, variant, config);
            case 'large':
                return EntityFactory.createLargeObstacle(entityManager, variant, config);
            case 'hazard':
                return EntityFactory.createImpassableHazard(entityManager, variant, config);
            default:
                console.warn(`Unknown obstacle type: ${type}, defaulting to small`);
                return EntityFactory.createSmallObstacle(entityManager, variant, config);
        }
    }

    /**
     * Create a small obstacle
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} variant - Obstacle variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The small obstacle entity
     */
    static createSmallObstacle(entityManager, variant, config = {}) {
        const variantConfig = SmallObstacleVariants[variant] || SmallObstacleVariants.Standard;
        const obstacleConfig = { ...variantConfig, ...config };
        return createSmallObstacleEntity(entityManager, obstacleConfig);
    }

    /**
     * Create a medium obstacle
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} variant - Obstacle variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The medium obstacle entity
     */
    static createMediumObstacle(entityManager, variant, config = {}) {
        const variantConfig = MediumObstacleVariants[variant] || MediumObstacleVariants.Standard;
        const obstacleConfig = { ...variantConfig, ...config };
        return createMediumObstacleEntity(entityManager, obstacleConfig);
    }

    /**
     * Create a large obstacle
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} variant - Obstacle variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The large obstacle entity
     */
    static createLargeObstacle(entityManager, variant, config = {}) {
        const variantConfig = LargeObstacleVariants[variant] || LargeObstacleVariants.Standard;
        const obstacleConfig = { ...variantConfig, ...config };
        return createLargeObstacleEntity(entityManager, obstacleConfig);
    }

    /**
     * Create an impassable hazard
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} variant - Hazard variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The impassable hazard entity
     */
    static createImpassableHazard(entityManager, variant, config = {}) {
        const variantConfig = ImpassableHazardVariants[variant] || ImpassableHazardVariants.Hole;
        const hazardConfig = { ...variantConfig, ...config };
        return createImpassableHazardEntity(entityManager, hazardConfig);
    }

    /**
     * Create generic lane bonus
     */
    static createLaneBonus(entityManager, config) {
        return createLaneBonusEntity(entityManager, config);
    }

    /**
     * Create an entity from map data
     * @param {EntityManager} entityManager - The entity manager
     * @param {Object} objectData - Object data from map
     * @returns {Object} The created entity instance
     */
    static createFromMapData(entityManager, objectData) {
        const { type, objectType, variant, lane, position, properties } = objectData;

        // Common configuration
        const config = {
            laneIndex: lane,
            x: position,
            ...properties
        };

        switch (type) {
            case 'enemy':
                return EntityFactory.createZombie(entityManager, objectType, variant, config);
            case 'obstacle':
                return EntityFactory.createObstacle(entityManager, objectType, variant, config);
            case 'bonus':
                // Bonus entities will be implemented later
                console.log(`Bonus entity: ${objectType} (${variant}) at lane ${lane}, position ${position}`);
                return null;
            default:
                console.warn(`Unknown entity type: ${type}`);
                return null;
        }
    }
}
