/**
 * Adapter for EntityFactory to handle map data
 */
import { EntityFactory } from '../entities/entity-factory.js';
import { ServiceLocator } from '../core/service-locator.js';
import { createEmbeddedBonus } from '../entities/embedded-bonus.js';

export class EntityAdapter {
    /**
     * Create entities from map data
     * @param {Object} mapData - The map data
     * @param {number} playerWorldPosition - The current player position in world coordinates
     */
    static createEntitiesFromMap(mapData, playerWorldPosition) {
        if (!mapData || !mapData.objects) return;
        
        const entityManager = ServiceLocator.getService('entityManager');
        if (!entityManager) {
            console.error('Entity manager not found');
            return;
        }
        
        // Initialize createdObjectIds if it doesn't exist
        if (!mapData.createdObjectIds) {
            mapData.createdObjectIds = new Set();
        }
        
        // Sort map objects by position
        const sortedObjects = [...mapData.objects].sort((a, b) => a.position - b.position);
        
        // Create entities from map objects that are within range
        const spawnDistance = 1000; // Only spawn entities within 1000px of player
        
        for (const obj of sortedObjects) {
            // Skip objects that have already been created
            if (mapData.createdObjectIds.has(obj.id)) {
                continue;
            }
            
            // Only create entities that are within the spawn distance
            if (obj.position <= playerWorldPosition + spawnDistance) {
                console.log(`[EntityAdapter] Creating entity from map object: ${obj.type} (${obj.objectType}, ${obj.variant}) at lane ${obj.lane}, position ${obj.position}, embedded bonus: ${obj.embeddedBonus}`);
                this.createEntityFromMapObject(entityManager, obj);
                
                // Mark this object as created
                mapData.createdObjectIds.add(obj.id);
            }
        }
    }
    
    /**
     * Create an entity from a map object
     * @param {EntityManager} entityManager - The entity manager
     * @param {Object} obj - The map object
     * @returns {Entity} The created entity
     */
    static createEntityFromMapObject(entityManager, obj) {
        const { type, objectType, variant, lane, position, properties, embeddedBonus } = obj;
        console.log(`[EntityAdapter] Creating entity from map object: ${type} (${objectType}, ${variant}) at lane ${lane}, position ${position}, embedded bonus: ${embeddedBonus}`);

        // Common configuration
        const config = {
            laneIndex: lane,
            x: position,
            ...properties
        };
        
        let entity = null;
        
        switch (type) {
            case 'enemy':
                entity = this.createEnemyFromMapData(entityManager, objectType, variant, config);
                break;
            case 'obstacle':
                entity = this.createObstacleFromMapData(entityManager, objectType, variant, config);
                break;
            case 'bonus':
                entity = this.createBonusFromMapData(entityManager, objectType, variant, config);
                break;
            default:
                console.warn(`Unknown entity type: ${type}`);
                return null;
        }
        
        // Add embedded bonus if specified
        console.log(`[EntityAdapter] checking for embedded bonus`, embeddedBonus,'host ', entity);
        if (entity && embeddedBonus) {
            console.log(`[EntityAdapter] Adding embedded bonus: ${embeddedBonus.type} (${embeddedBonus.variant}) to entity ID ${entity.id}`);
            this.addEmbeddedBonusToEntity(entityManager, entity, embeddedBonus);
        }
        
        return entity;
    }
    
    /**
     * Create an enemy from map data
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} objectType - The enemy type
     * @param {string} variant - The enemy variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The created enemy entity
     */
    static createEnemyFromMapData(entityManager, objectType, variant, config) {
        switch (objectType) {
            case 'normal':
                return EntityFactory.createNormalZombie(entityManager, variant, config);
            case 'armored':
                return EntityFactory.createArmoredZombie(entityManager, variant, config);
            case 'giant':
                return EntityFactory.createGiantZombie(entityManager, variant, config);
            default:
                console.warn(`Unknown enemy type: ${objectType}, defaulting to normal`);
                return EntityFactory.createNormalZombie(entityManager, variant, config);
        }
    }
    
    /**
     * Create an obstacle from map data
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} objectType - The obstacle type
     * @param {string} variant - The obstacle variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The created obstacle entity
     */
    static createObstacleFromMapData(entityManager, objectType, variant, config) {
        switch (objectType) {
            case 'small':
                return EntityFactory.createSmallObstacle(entityManager, variant, config);
            case 'medium':
                return EntityFactory.createMediumObstacle(entityManager, variant, config);
            case 'large':
                return EntityFactory.createLargeObstacle(entityManager, variant, config);
            case 'hazard':
                return EntityFactory.createImpassableHazard(entityManager, variant, config);
            default:
                console.warn(`Unknown obstacle type: ${objectType}, defaulting to small`);
                return EntityFactory.createSmallObstacle(entityManager, variant, config);
        }
    }
    
    /**
     * Create a bonus from map data
     * @param {EntityManager} entityManager - The entity manager
     * @param {string} objectType - The bonus type
     * @param {string} variant - The bonus variant
     * @param {Object} config - Additional configuration
     * @returns {Entity} The created bonus entity
     */
    static createBonusFromMapData(entityManager, objectType, variant, config) {
        // Map bonus types to the appropriate factory methods
        console.log(`Creating bonus: ${objectType} (${variant}): ${JSON.stringify(config)}`);
        try {
            const bonus = EntityFactory.createLaneBonus(entityManager, {
                speed: config.speed || 0,
                bonusType: objectType,
                bonusVariant: variant,
                laneIndex: config.laneIndex,
                x: config.x
            })
            return bonus;
        } catch (error) {
            console.error('Error creating bonus:', error);
            return null;
        }
    }
    
    /**
     * Add embedded bonus to an entity
     * @param {EntityManager} entityManager - The entity manager
     * @param {Entity} hostEntity - The host entity
     * @param {Object} bonusData - The bonus data
     */
    static addEmbeddedBonusToEntity(entityManager, hostEntity, bonusData) {
        if (!hostEntity) return;
        console.log(`[EntityAdapter] Adding embedded bonus: ${bonusData.type} (${bonusData.variant}) to entity ID ${hostEntity.id}`);
        
        // Handle random bonus type/variant
        let bonusType = bonusData.type;
        let bonusVariant = bonusData.variant;
        
        if (bonusType === 'random') {
            // Define array of possible bonus combinations
            const bonusCombinations = [
                { type: 'soldier', variant: 'standard' },
                { type: 'gun', variant: 'glock_17' },
                { type: 'gun', variant: 'desert_eagle' },
                { type: 'gun', variant: 'benelli_m4' },
                { type: 'gun', variant: 'ak47' },
                { type: 'gun', variant: 'barrett_xm109' },
                { type: 'grenade', variant: 'standard' },
                { type: 'grenade', variant: 'sticky' }
            ];
            
            // Select a random combination
            const randomIndex = Math.floor(Math.random() * bonusCombinations.length);
            const selectedBonus = bonusCombinations[randomIndex];
            
            bonusType = selectedBonus.type;
            bonusVariant = selectedBonus.variant;
        }
        
        // Create embedded bonus
        createEmbeddedBonus(entityManager, {
            bonusType: bonusType,
            bonusVariant: bonusVariant,
            lifetime: 5, // Default lifetime
            hostEntityId: hostEntity.id
        });
        
        console.log(`Added embedded bonus: ${bonusType} (${bonusVariant}) to entity ID ${hostEntity.id}`);
    }
}
