/**
 * Collision System
 *
 * Handles collision detection and resolution between entities.
 * Respects collision filters and special properties like projectiles passing through hazards.
 */

import { EntitySystem } from './entity-system.js';
import { ServiceLocator } from '../core/service-locator.js';
import { CollisionType, CollisionComponent } from '../entities/components/collision.js';
import { CollisionGroupManager } from '../core/collision-group-manager.js';

export class CollisionSystem extends EntitySystem {
    /**
     * Create a new CollisionSystem instance
     */
    constructor() {
        // This system requires transform and collision components
        console.log('[COLLISION_SYSTEM] Creating collision system instance');
        super('collisionSystem', ['transform', 'collision']);

        // Set a medium priority
        this.setPriority(5);

        // Store colliding pairs to avoid duplicate collision handling
        this.collidingPairs = new Set();

        // Create a collision group manager
        this.collisionGroupManager = new CollisionGroupManager();

        // Register the collision group manager with the service locator
        ServiceLocator.registerService('collisionGroupManager', this.collisionGroupManager);

        // Debug flag
        this.debug = false;

        // Counter for collision group recalculation
        this.recalculationCounter = 0;

        // How often to recalculate collision groups (in frames)
        this.recalculationInterval = 5; // Every 5 frames
    }

    /**
     * Initialize the system
     */
    initialize() {
        // Get the event bus
        this.eventBus = ServiceLocator.getService('eventBus');
        
        // Get the lane system
        this.laneSystem = ServiceLocator.getService('laneSystem');
        this.laneHeight = this.laneSystem ? this.laneSystem.getLaneHeight() : 50;
        
        // Initialize lane-based collision arrays
        this.initializeLaneCollisionArrays();
        
        // Subscribe to entity added/removed events
        this.eventBus.subscribe('entityAdded', this.onEntityAdded.bind(this));
        this.eventBus.subscribe('entityRemoved', this.onEntityRemoved.bind(this));
        
        // Subscribe to entity position changed events
        this.eventBus.subscribe('entityPositionChanged', this.onEntityPositionChanged.bind(this));
    }

    /**
     * Update the system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Clear colliding pairs from previous frame
        console.log('[COLLISION_SYSTEM] Clearing colliding pairs');
        this.collidingPairs.clear();

        // Check if we need to recalculate collision groups
        this.recalculationCounter++;
        if (this.recalculationCounter >= this.recalculationInterval) {
            this.recalculationCounter = 0;
            this._checkAndUpdateCollisionGroups();
        }

        // Get entity manager
        const entityManager = ServiceLocator.getService('entityManager');
        if (!entityManager) return;

        // 1. Check collisions between right side entities in the same lane
        this._checkRightSideCollisions(entityManager);

        // 2. Check collisions between projectiles and right side entities in the same lane
        this._checkProjectileCollisions(entityManager);

        // 3. Check collisions between effect areas and right side entities
        this._checkEffectAreaCollisions(entityManager);

        // 4. Check collisions between soldiers/players and right side entities
        this._checkSoldierCollisions(entityManager);

        // 5. Check collisions between player and lane bonuses
        this._checkBonusCollisions(entityManager);
    }
    /**
     * Check collision between two entities
     * @param {Entity} entityA - First entity
     * @param {Entity} entityB - Second entity
     * @returns {boolean} True if entities are colliding, false otherwise
     */
    checkCollision(entityA, entityB) {
        const transformA = entityA.getComponent('transform');
        const transformB = entityB.getComponent('transform');
        const collisionA = entityA.getComponent('collision');
        const collisionB = entityB.getComponent('collision');

        if (!transformA||!transformB||!collisionA||!collisionB) {
            return false;
        }

        // Get hitbox bounds
        const boundsA = collisionA.getHitboxBounds(transformA);
        const boundsB = collisionB.getHitboxBounds(transformB);

        // Check for intersection
        const isColliding = CollisionComponent.intersects(boundsA, boundsB);
        // Update colliding entities
        if (isColliding) {
            // Add to colliding pairs
            const pairId = this.getPairId(entityA.id, entityB.id);
            this.collidingPairs.add(pairId);

            // Update collision components
            collisionA.addCollidingEntity(entityB);
            collisionB.addCollidingEntity(entityA);
            

        } else {
            // Remove from colliding entities if they were colliding before
            if (collisionA.isCollidingWith(entityB)) {
                collisionA.removeCollidingEntity(entityB);
                collisionB.removeCollidingEntity(entityA);
            }
        }
        
        return isColliding;
    }
    /**
     * Handle specific collision types
     * @param {Entity} entityA - First entity
     * @param {Entity} entityB - Second entity
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    handleSpecificCollision(entityA, entityB) {
        const collisionA = entityA.getComponent('collision');
        const collisionB = entityB.getComponent('collision');

        if (!collisionA || !collisionB) {
            return;
        }

        // Handle Lane Bonus collisions first
        if (collisionA.collisionType === CollisionType.BONUS) {
                this.handleLaneBonusCollision(entityA, entityB);
                return;            
        } else if (collisionB.collisionType === CollisionType.BONUS) {
                this.handleLaneBonusCollision(entityB, entityA);
                return;            
        }

        // Check for effect area collision
        if (collisionA.collisionType === CollisionType.EFFECT_AREA &&
            (collisionB.collisionType === CollisionType.ENEMY ||
            collisionB.collisionType === CollisionType.OBSTACLE)) {
            this.handleEffectAreaCollision(entityA, entityB);
            return;
        } else if (collisionB.collisionType === CollisionType.EFFECT_AREA &&
            (collisionA.collisionType === CollisionType.ENEMY ||
            collisionA.collisionType === CollisionType.OBSTACLE)) {
            this.handleEffectAreaCollision(entityB, entityA);
            return;
        }
        // Handle projectile collisions
        if (collisionA.collisionType === CollisionType.PROJECTILE) {
            this.handleProjectileCollision(entityA, entityB);
            return;
        } else if (collisionB.collisionType === CollisionType.PROJECTILE) {
            this.handleProjectileCollision(entityB, entityA);
            return;
        }

        // Handle enemy-obstacle collisions
        if (collisionA.collisionType === CollisionType.ENEMY && collisionB.collisionType === CollisionType.OBSTACLE) {
            this.handleEnemyObstacleCollision(entityA, entityB);
            return;
        } else if (collisionB.collisionType === CollisionType.ENEMY && collisionA.collisionType === CollisionType.OBSTACLE) {
            this.handleEnemyObstacleCollision(entityB, entityA);
            return;
        }

        // Handle obstacle-obstacle collisions
        if (collisionA.collisionType === CollisionType.OBSTACLE && collisionB.collisionType === CollisionType.OBSTACLE) {
            this.handleEnemyObstacleCollision(entityA, entityB);
            return;
        }
        // Handle obstacle-hazard collisions
        if (collisionA.collisionType === CollisionType.HAZARD && collisionB.collisionType === CollisionType.OBSTACLE) {
            this.handleEnemyHazardCollision(entityA, entityB);
            return;
        } else if (collisionB.collisionType === CollisionType.HAZARD && collisionA.collisionType === CollisionType.OBSTACLE) {
            this.handleEnemyHazardCollision(entityB, entityA);
            return;
        }

        // Handle enemy-hazard collisions
        if (collisionA.collisionType === CollisionType.ENEMY && collisionB.collisionType === CollisionType.HAZARD) {
            this.handleEnemyHazardCollision(entityA, entityB);
            return;
        } else if (collisionB.collisionType  === CollisionType.ENEMY && collisionA.collisionType === CollisionType.HAZARD) {
            this.handleEnemyHazardCollision(entityB, entityA);
            return;
        }

        // Handle enemy-soldier collisions
        if ((collisionA.collisionType === CollisionType.ENEMY || 
             collisionA.collisionType === CollisionType.OBSTACLE || 
             collisionA.collisionType === CollisionType.HAZARD) && 
            (collisionB.collisionType === CollisionType.SOLDIER || 
             collisionB.collisionType === CollisionType.PLAYER)) {
            this.handleEnemySoldierCollision(entityA, entityB);
            return;
        } else if ((collisionB.collisionType === CollisionType.ENEMY || 
                    collisionB.collisionType === CollisionType.OBSTACLE || 
                    collisionB.collisionType === CollisionType.HAZARD) && 
                   (collisionA.collisionType === CollisionType.SOLDIER || 
                    collisionA.collisionType === CollisionType.PLAYER)) {
            this.handleEnemySoldierCollision(entityB, entityA);
            return;
        }
    }

    /**
     * Handle projectile collision
     * @param {Entity} projectile - Projectile entity
     * @param {Entity} target - Target entity
     */
    handleProjectileCollision(projectile, target) {
        const transform = projectile.getComponent('transform');
        if (this.eventBus) {
            this.eventBus.publish('projectileTargetCollision', {
                projectile,
                target
            });
        }
    }

    /**
     * Handle effect area collision
     * @param effect area
     * @param target
     */
    handleEffectAreaCollision(effectArea, target) {
        // Get health component of target
        if (this.eventBus) {
            this.eventBus.publish('entityCollidedWithEffectArea', {
                effectArea,
                target
            });
        }
    }

    /**
     * Handle enemy-obstacle collision
     * @param {Entity} enemy - Enemy entity
     * @param {Entity} obstacle - Obstacle entity
     */
    handleEnemyObstacleCollision(enemy, obstacle) {
        // Get movement components
        const enemyMovement = enemy.getComponent('movement');
        const obstacleMovement = obstacle.getComponent('movement');
        const enemyCollision = enemy.getComponent('collision');
        const obstacleCollision = obstacle.getComponent('collision');

        if (enemyMovement && obstacleMovement) {
            // Use the collision group manager instance
            if (!this.collisionGroupManager) {
                console.log('[COLLISION] CollisionGroupManager not initialized');
                return;
            }

            // Create a collision group or add to existing group
            if (enemyMovement.collisionGroupId === null && obstacleMovement.collisionGroupId === null) {
                // Create a new group
                this.collisionGroupManager.createGroup([enemy, obstacle]);

            } else if (enemyMovement.collisionGroupId !== null && obstacleMovement.collisionGroupId === null) {
                // Add obstacle to enemy's group
                this.collisionGroupManager.addEntityToGroup(enemyMovement.collisionGroupId, obstacle);

            } else if (enemyMovement.collisionGroupId === null && obstacleMovement.collisionGroupId !== null) {
                // Add enemy to obstacle's group
                this.collisionGroupManager.addEntityToGroup(obstacleMovement.collisionGroupId, enemy);

            } else if (enemyMovement.collisionGroupId !== obstacleMovement.collisionGroupId) {
                // Merge the two groups
                this.collisionGroupManager.mergeGroups(enemyMovement.collisionGroupId, obstacleMovement.collisionGroupId);
            }
        }
    }

    /**
     * Handle enemy-hazard collision
     * @param {Entity} enemy - Enemy entity
     * @param {Entity} hazard - Hazard entity
     */
    handleEnemyHazardCollision(enemy, hazard) {
        // Get movement components
        const enemyMovement = enemy.getComponent('movement');
        const hazardMovement = hazard.getComponent('movement');

        if (enemyMovement && hazardMovement) {
            // Use the collision group manager instance
            if (!this.collisionGroupManager) {
                console.log('[COLLISION] CollisionGroupManager not initialized');
                return;
            }

            // Create a collision group or add to existing group
            if (enemyMovement.collisionGroupId === null && hazardMovement.collisionGroupId === null) {
                // Create a new group
                this.collisionGroupManager.createGroup([enemy, hazard]);
            } else if (enemyMovement.collisionGroupId !== null && hazardMovement.collisionGroupId === null) {
                // Add hazard to enemy's group
                this.collisionGroupManager.addEntityToGroup(enemyMovement.collisionGroupId, hazard);
            } else if (enemyMovement.collisionGroupId === null && hazardMovement.collisionGroupId !== null) {
                // Add enemy to hazard's group
                this.collisionGroupManager.addEntityToGroup(hazardMovement.collisionGroupId, enemy);
            } else if (enemyMovement.collisionGroupId !== hazardMovement.collisionGroupId) {
                // Merge the two groups
                this.collisionGroupManager.mergeGroups(enemyMovement.collisionGroupId, hazardMovement.collisionGroupId);
            }
        }
    }

    /**
     * Handle enemy-soldier collision
     * @param {Entity} enemy - Enemy entity (zombie, obstacle, or hazard)
     * @param {Entity} soldier - Soldier entity (soldier or player)
     */
    handleEnemySoldierCollision(enemy, soldier) {
        // Dispatch enemy-soldier collision event
        if (this.eventBus) {
            this.eventBus.publish('enemySoldierCollision', {
                enemy,
                soldier
            });
        }
    }

    /**
     * Handle Lane Bonus collision
     * @param {Entity} bonus - The bonus entity
     * @param {Entity} player - The player or soldier entity
     */
    handleLaneBonusCollision(bonus, player) {
        if (this.eventBus) {
            this.eventBus.publish('bonusCollected', {
                player,
                bonus
            });
        }
    }

    /**
     * Get a unique ID for a pair of entities
     * @param {number} idA - First entity ID
     * @param {number} idB - Second entity ID
     * @returns {string} Unique pair ID
     */
    getPairId(idA, idB) {
        // Ensure consistent ordering regardless of which entity is A or B
        return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
    }

    /**
     * Check and update collision groups
     * @private
     */
    _checkAndUpdateCollisionGroups() {
        // Check all existing groups to see if they need to be split
        const groups = this.collisionGroupManager.getAllGroups();
        for (const [groupId, entityIds] of groups.entries()) {
            if (this.collisionGroupManager.doesGroupNeedSplit(groupId)) {
                this.collisionGroupManager.splitGroup(groupId);
            }
        }
    }

    /**
     * Initialize lane-based collision arrays
     */
    initializeLaneCollisionArrays() {
        // Arrays for entities by lane
        this.rightSideEntitiesByLane = []; // Enemies and obstacles by lane
        this.projectilesByLane = [];       // Projectiles by lane
        
        // Get lane system to determine lane count
        const laneSystem = ServiceLocator.getService('laneSystem');
        const laneCount = laneSystem ? laneSystem.getLaneCount() : 5; // Default to 5 if not found
        
        // Initialize arrays for each lane
        for (let i = 0; i < laneCount; i++) {
            this.rightSideEntitiesByLane[i] = new Set();
            this.projectilesByLane[i] = new Set();
        }
        
        // Single arrays for special entities
        this.effectAreaEntities = new Set();
        this.laneBonusEntities = new Set();
        this.playerEntities = new Set();
        this.soldierEntities = new Set();
    }

    /**
     * Handle entity added event
     * @param {Object} event - Event data
     */
    onEntityAdded(event) {
        const { entity } = event;
        if (entity && entity.hasComponent('collision')) {
            this.registerEntity(entity);
        }
    }

    /**
     * Handle entity removed event
     * @param {Object} event - Event data
     */
    onEntityRemoved(event) {
        const { entity } = event;
        if (entity) {
            this.unregisterEntity(entity);
        }
    }

    /**
     * Handle entity position changed event
     * @param {Object} event - Event data
     */
    onEntityPositionChanged(event) {
        const { entity } = event;
        if (entity && entity.hasComponent('collision')) {
            // Update occupied lanes and re-register
            this.updateEntityLanes(entity);
        }
    }

    /**
     * Update entity's occupied lanes and re-register it
     * @param {Entity} entity - The entity to update
     */
    updateEntityLanes(entity) {
        // First unregister from current lanes
        this.unregisterEntity(entity);
        
        // Calculate new occupied lanes
        const collision = entity.getComponent('collision');
        const transform = entity.getComponent('transform');
        
        if (collision && transform) {
            collision.calculateOccupiedLanes(transform, this.laneHeight);
        }
        
        // Re-register with updated lanes
        this.registerEntity(entity);
    }

    /**
     * Register entity with the appropriate lane arrays
     * @param {Entity} entity - The entity to register
     */
    registerEntity(entity) {
        if (!entity.hasComponent('collision')) return;
        
        const collision = entity.getComponent('collision');
        const transform = entity.getComponent('transform');

        if (!collision) return;
        if (!transform) return;

        // Calculate occupied lanes if not already done
        if (collision.occupiedLanes.length === 0) {
            // Make sure we have a valid lane height
            if (!this.laneHeight || this.laneHeight <= 0) {
                // Try to get lane height from lane system
                const laneSystem = ServiceLocator.getService('laneSystem');
                this.laneHeight = laneSystem ? laneSystem.getLaneHeight() : 50; // Default to 50 if not found
            }
            
            // Now calculate occupied lanes with the lane height
            collision.calculateOccupiedLanes(transform, this.laneHeight);
        }
        
        const occupiedLanes = collision.getOccupiedLanes();
        
        // Register based on collision type
        switch (collision.collisionType) {
            case CollisionType.ENEMY:
            case CollisionType.OBSTACLE:
            case CollisionType.HAZARD:
                occupiedLanes.forEach(index => {
                    if (index >= 0 && index < this.rightSideEntitiesByLane.length) {
                        this.rightSideEntitiesByLane[index].add(entity.id);
                    }
                });
                break;
            case CollisionType.PROJECTILE:
                occupiedLanes.forEach(index => {
                    if (index >= 0 && index < this.projectilesByLane.length) {
                        this.projectilesByLane[index].add(entity.id);
                    }
                });
                break;
            case CollisionType.EFFECT_AREA:
                this.effectAreaEntities.add(entity.id);
                // Also register in each lane it occupies
                occupiedLanes.forEach(index => {
                    if (index >= 0 && index < this.rightSideEntitiesByLane.length) {
                        this.rightSideEntitiesByLane[index].add(entity.id);
                    }
                });
                break;
            case CollisionType.BONUS:
                this.laneBonusEntities.add(entity.id);
                break;
            case CollisionType.PLAYER:
                this.playerEntities.add(entity.id);
                break;
            case CollisionType.SOLDIER:
                this.soldierEntities.add(entity.id);
                break;
        }
    }

    /**
     * Unregister entity from lane arrays
     * @param {Entity} entity - The entity to unregister
     */
    unregisterEntity(entity) {
        if (!entity) return;
        
        const entityId = entity.id;
        const collision = entity.getComponent('collision');
        
        if (!collision) return;
        
        // Get occupied lanes
        const occupiedLanes = collision.getOccupiedLanes();
        
        // Optimize removal based on collision type
        switch (collision.collisionType) {
            case CollisionType.ENEMY:
            case CollisionType.OBSTACLE:
            case CollisionType.HAZARD:
                occupiedLanes.forEach(index => {
                    if (index >= 0 && index < this.rightSideEntitiesByLane.length) {
                        this.rightSideEntitiesByLane[index].delete(entityId);
                    }
                });
                break;
            case CollisionType.PROJECTILE:
                occupiedLanes.forEach(index => {
                    if (index >= 0 && index < this.projectilesByLane.length) {
                        this.projectilesByLane[index].delete(entityId);
                    }
                });
                break;
            case CollisionType.EFFECT_AREA:
                this.effectAreaEntities.delete(entityId);
                // Also remove from each lane it occupies
                occupiedLanes.forEach(index => {
                    if (index >= 0 && index < this.rightSideEntitiesByLane.length) {
                        this.rightSideEntitiesByLane[index].delete(entityId);
                    }
                });
                break;
            case CollisionType.BONUS:
                this.laneBonusEntities.delete(entityId);
                break;
            case CollisionType.PLAYER:
                this.playerEntities.delete(entityId);
                break;
            case CollisionType.SOLDIER:
                this.soldierEntities.delete(entityId);
                break;
        }
    }

    /**
     * Check collisions between right side entities in the same lane
     * @param {EntityManager} entityManager - The entity manager
     * @private
     */
    _checkRightSideCollisions(entityManager) {
        // For each lane, check collisions between right side entities
        for (let laneIndex = 0; laneIndex < this.rightSideEntitiesByLane.length; laneIndex++) {
            const entitiesInLane = this.rightSideEntitiesByLane[laneIndex];
            const entityIds = Array.from(entitiesInLane);
            
            // Check each pair of entities
            for (let i = 0; i < entityIds.length; i++) {
                const entityA = entityManager.getEntity(entityIds[i]);
                if (!entityA) continue;
                
                for (let j = i + 1; j < entityIds.length; j++) {
                    const entityB = entityManager.getEntity(entityIds[j]);
                    if (!entityB) continue;
                    
                    // Skip if collision is disabled for either entity
                    const collisionA = entityA.getComponent('collision');
                    const collisionB = entityB.getComponent('collision');
                    if (!collisionA || !collisionB || !collisionA.enabled || !collisionB.enabled) continue;
                    if (collisionA.canStack && collisionB.canStack) continue;
                    
                    // Check for collision
                    if (this.checkCollision(entityA, entityB)) {
                        // Handle collision
                        this.handleSpecificCollision(entityA, entityB);
                    }
                }
            }
        }
    }

    /**
     * Check collisions between projectiles and right side entities in the same lane
     * @param {EntityManager} entityManager - The entity manager
     * @private
     */
    _checkProjectileCollisions(entityManager) {
        // For each lane, check collisions between projectiles and right side entities
        for (let laneIndex = 0; laneIndex < this.projectilesByLane.length; laneIndex++) {
            const projectilesInLane = this.projectilesByLane[laneIndex];

            const rightSideEntitiesInLane = this.rightSideEntitiesByLane[laneIndex];

            // For each projectile in the lane
            for (const projectileId of projectilesInLane) {
                const projectile = entityManager.getEntity(projectileId);
                if (!projectile) continue;
                
                const projectileCollision = projectile.getComponent('collision');
                if (!projectileCollision || !projectileCollision.enabled) continue;
                
                // Check against each right side entity in the lane
                for (const entityId of rightSideEntitiesInLane) {
                    const entity = entityManager.getEntity(entityId);
                    if (!entity) continue;
                    
                    const entityCollision = entity.getComponent('collision');
                    if (!entityCollision || !entityCollision.enabled) continue;
                    
                    // Skip if entity is not an enemy or obstacle
                    if (entityCollision.collisionType !== CollisionType.ENEMY && 
                        entityCollision.collisionType !== CollisionType.OBSTACLE) continue;
                    
                    // Skip if projectiles pass through this entity
                    if (entityCollision.projectilesPassThrough) continue;
                    
                    // Check for collision
                    if (this.checkCollision(projectile, entity)) {
                        // Handle projectile collision
                        this.handleProjectileCollision(projectile, entity);
                    }
                }
            }
        }
    }

    /**
     * Check collisions between effect areas and right side entities
     * @param {EntityManager} entityManager - The entity manager
     * @private
     */
    _checkEffectAreaCollisions(entityManager) {
        // For each effect area
        for (const effectAreaId of this.effectAreaEntities) {
            const effectArea = entityManager.getEntity(effectAreaId);
            if (!effectArea) continue;
            
            const effectAreaCollision = effectArea.getComponent('collision');
            if (!effectAreaCollision || !effectAreaCollision.enabled) continue;
            
            // Get the lanes this effect area occupies
            const occupiedLanes = effectAreaCollision.getOccupiedLanes();
            
            // Check against right side entities in those lanes
            for (const laneIndex of occupiedLanes) {
                if (laneIndex < 0 || laneIndex >= this.rightSideEntitiesByLane.length) continue;
                
                const entitiesInLane = this.rightSideEntitiesByLane[laneIndex];
                
                for (const entityId of entitiesInLane) {
                    // Skip if this is the effect area itself
                    if (entityId === effectAreaId) continue;
                    
                    const entity = entityManager.getEntity(entityId);
                    if (!entity) continue;
                    
                    const entityCollision = entity.getComponent('collision');
                    if (!entityCollision || !entityCollision.enabled) continue;
                    
                    // Skip if entity is not an enemy or obstacle
                    if (entityCollision.collisionType !== CollisionType.ENEMY && 
                        entityCollision.collisionType !== CollisionType.OBSTACLE) continue;
                    
                    // Check for collision
                    if (this.checkCollision(effectArea, entity)) {
                        // Handle effect area collision
                        this.handleEffectAreaCollision(effectArea, entity);
                    }
                }
            }
        }
    }

    /**
     * Check collisions between soldiers/players and right side entities
     * @param {EntityManager} entityManager - The entity manager
     * @private
     */
    _checkSoldierCollisions(entityManager) {
        // Combine player and soldier entities
        const soldierEntities = new Set([...this.playerEntities, ...this.soldierEntities]);
        // For each soldier/player
        for (const soldierId of soldierEntities) {
            const soldier = entityManager.getEntity(soldierId);
            if (!soldier) continue;
            
            const soldierCollision = soldier.getComponent('collision');
            if (!soldierCollision || !soldierCollision.enabled) continue;
            
            // Get the lanes this soldier occupies
            const occupiedLanes = soldierCollision.getOccupiedLanes();
            
            // Check against right side entities in those lanes
            for (const laneIndex of occupiedLanes) {
                if (laneIndex < 0 || laneIndex >= this.rightSideEntitiesByLane.length) continue;
                
                const entitiesInLane = this.rightSideEntitiesByLane[laneIndex];

                for (const entityId of entitiesInLane) {
                    const entity = entityManager.getEntity(entityId);
                    if (!entity) continue;
                    
                    const entityCollision = entity.getComponent('collision');
                    if (!entityCollision || !entityCollision.enabled) continue;
                    
                    // Check for collision
                    if (this.checkCollision(soldier, entity)) {
                        // Handle soldier collision
                        this.handleEnemySoldierCollision(entity, soldier);
                    }
                }
            }
        }
    }

    /**
     * Check collisions between player and lane bonuses
     * @param {EntityManager} entityManager - The entity manager
     * @private
     */
    _checkBonusCollisions(entityManager) {
        // For each player
        for (const playerId of this.playerEntities) {
            const player = entityManager.getEntity(playerId);
            if (!player) continue;
            
            const playerCollision = player.getComponent('collision');
            if (!playerCollision || !playerCollision.enabled) continue;
            
            // Check if player is in bonus lane
            const playerLane = player.getComponent('lane');
            if (!playerLane || !playerLane.isInBonusLane()) continue;
            
            // Check against all lane bonuses
            for (const bonusId of this.laneBonusEntities) {
                const bonus = entityManager.getEntity(bonusId);
                if (!bonus) continue;
                
                const bonusCollision = bonus.getComponent('collision');
                if (!bonusCollision || !bonusCollision.enabled) continue;
                
                // Check for collision
                if (this.checkCollision(player, bonus)) {
                    // Handle bonus collision
                    this.handleLaneBonusCollision(bonus, player);
                }
            }
        }
    }
}
