import { createSoldierEntity } from '../entities/soldier.js';
import { PlayerComponent } from '../entities/components/player-component.js';
import { GrenadeType } from '../entities/player.js';
import { TransformComponent } from '../entities/components/transform.js';
import { LaneComponent } from '../entities/components/lane.js';
import { RenderComponent } from '../entities/components/render.js';
import { MovementComponent, MovementType } from '../entities/components/movement.js';
import { CollisionComponent, CollisionType } from '../entities/components/collision.js';
import { HealthComponent } from '../entities/components/health.js';
import { GunComponent, GunType } from '../entities/components/gun.js';
import { ProjectileComponent } from '../entities/components/projectile.js';
import { ServiceLocator } from './service-locator.js';

export const PlayerSoldierService = {
    /**
     * Add a soldier to the player entity
     * @param {EntityManager} entityManager
     * @param {Entity} playerEntity
     * @param {Object} [config={}] - Optional configuration for the soldier
     * @returns {Entity} The newly created soldier entity
     */
    addSoldier(entityManager, playerEntity, config = {}) {
        const playerComp = playerEntity.getComponent('player');
        const laneComp = playerEntity.getComponent('lane');
        const currentLane = laneComp ? laneComp.laneIndex : 4;
        // Create a new soldier entity
        const soldier = createSoldierEntity(entityManager, {
            ...config,
            laneIndex: currentLane
        });
        // Add to soldiers array
        playerComp.soldiers.push(soldier.id);
        // Add to position with fewest soldiers
        const middleCount = playerComp.soldiersByPosition.middle.length;
        const topCount = playerComp.soldiersByPosition.top.length;
        const bottomCount = playerComp.soldiersByPosition.bottom.length;
        let targetPosition;
        if (middleCount <= topCount && middleCount <= bottomCount) {
            targetPosition = 'middle';
        } else if (topCount <= bottomCount) {
            targetPosition = 'top';
        } else {
            targetPosition = 'bottom';
        }
        playerComp.soldiersByPosition[targetPosition].push(soldier.id);
        soldier.assignedPosition = targetPosition;
        // Distribute soldiers across lanes
        this.distributeSoldiersAcrossLanes(playerEntity, entityManager);
        // Update soldier positions
        this.updateSoldierPositions(playerEntity, entityManager);
        return soldier;
    },

    /**
     * Remove a soldier from the player entity
     * @param {EntityManager} entityManager
     * @param {Entity} playerEntity
     * @param {Entity} soldierEntity
     * @returns {boolean} True if removed
     */
    removeSoldier(entityManager, playerEntity, soldierEntity) {
        const playerComp = playerEntity.getComponent('player');
        // Remove from soldiers array
        playerComp.soldiers = playerComp.soldiers.filter(id => id !== soldierEntity.id);
        // Remove from position-based organization
        for (const position of ['middle', 'top', 'bottom']) {
            playerComp.soldiersByPosition[position] = playerComp.soldiersByPosition[position].filter(id => id !== soldierEntity.id);
        }
        // Remove from lane-based organization
        for (const lane in playerComp.soldiersByLane) {
            playerComp.soldiersByLane[lane] = playerComp.soldiersByLane[lane].filter(id => id !== soldierEntity.id);
        }
        
        // Remove the entity
        entityManager.removeEntity(soldierEntity);
        
        // Redistribute soldiers
        this.distributeSoldiersAcrossLanes(playerEntity, entityManager);
        this.updateSoldierPositions(playerEntity, entityManager);
        return true;
    },

    /**
     * Distribute soldiers across lanes based on positions and current lane
     */
    distributeSoldiersAcrossLanes(playerEntity, entityManager) {
        const playerComp = playerEntity.getComponent('player');
        const laneComp = playerEntity.getComponent('lane');
        const currentLane = laneComp ? laneComp.laneIndex : 4;

        // Clear previous lane assignments
        playerComp.soldiersByLane = {};
        
        // Handle bonus lane (lane 0)
        if (currentLane === 0) {
            playerComp.soldiersByLane[0] = [...playerComp.soldiers];
            
            // Update each soldier's lane component
            for (const id of playerComp.soldiers) {
                const soldier = entityManager.getEntity(id);
                if (soldier?.getComponent('lane')) {
                    soldier.getComponent('lane').laneIndex = 0;
                }
            }
            return;
        }
        
        // Determine which positions to use based on current lane
        let laneMapping = { middle: currentLane };
        
        // Add appropriate adjacent lanes based on current position
        if (currentLane > 1) laneMapping.top = currentLane - 1;
        if (currentLane < 8) laneMapping.bottom = currentLane + 1;
        
        // Initialize lane arrays
        Object.values(laneMapping).forEach(laneIndex => {
            playerComp.soldiersByLane[laneIndex] = [];
        });
        
        // Distribute soldiers to lanes based on their positions
        for (const [position, laneIndex] of Object.entries(laneMapping)) {
            const soldierIds = playerComp.soldiersByPosition[position] || [];
            
            for (const id of soldierIds) {
                // Add to lane array
                playerComp.soldiersByLane[laneIndex].push(id);
                
                // Update soldier's lane component
                const soldier = entityManager.getEntity(id);
                if (soldier?.getComponent('lane')) {
                    soldier.getComponent('lane').laneIndex = laneIndex;
                }
            }
        }
    },

    /**
     * Update soldier positions based on team formation
     */
    updateSoldierPositions(playerEntity, entityManager) {
        const playerComp = playerEntity.getComponent('player');
        const playerTransform = playerEntity.getComponent('transform');
        const playerLane = playerEntity.getComponent('lane');
        if (!playerTransform || !playerLane) return;
        const currentLane = playerLane.laneIndex;
        const isInBonusLane = currentLane === 0;
        let laneHeight = 60;
        try {
            const laneSystem = ServiceLocator.getService('laneSystem');
            if (laneSystem && typeof laneSystem.getLaneHeight === 'function') {
                laneHeight = laneSystem.getLaneHeight();
            }
        } catch (error) {}
        
        // Get event bus
        const eventBus = ServiceLocator.getService('eventBus');
        
        const baseOffsetX = 40;
        const spacingX = 25;
        const spacingY = 20;
        if (isInBonusLane) {
            for (let i = 0; i < playerComp.soldiers.length; i++) {
                const soldier = entityManager.getEntity(playerComp.soldiers[i]);
                if (!soldier) continue;
                const transform = soldier.getComponent('transform');
                if (!transform) continue;
                
                // Store original position to check if it changed
                const originalX = transform.x;
                const originalY = transform.y;
                
                transform.x = playerTransform.x + baseOffsetX;
                const bonusLaneY = 0 * laneHeight + laneHeight / 2;
                transform.y = bonusLaneY + (i - (playerComp.soldiers.length - 1) / 2) * (spacingY / 2);
                
                // Publish position changed event if position actually changed
                if (eventBus && (originalX !== transform.x || originalY !== transform.y)) {
                    eventBus.publish('entityPositionChanged', { entity: soldier });
                }
            }
            return;
        }
        for (const position of ['middle', 'top', 'bottom']) {
            const ids = playerComp.soldiersByPosition[position];
            if (!ids || ids.length === 0) continue;
            const maxRows = 2;
            const columns = Math.ceil(ids.length / maxRows);
            const rows = Math.min(maxRows, ids.length);
            for (let i = 0; i < ids.length; i++) {
                const soldier = entityManager.getEntity(ids[i]);
                if (!soldier) continue;
                const transform = soldier.getComponent('transform');
                const soldierLane = soldier.getComponent('lane');
                if (!transform || !soldierLane) continue;
                
                // Store original position to check if it changed
                const originalX = transform.x;
                const originalY = transform.y;
                
                const col = Math.floor(i / rows);
                const row = i % rows;
                transform.x = playerTransform.x + baseOffsetX + col * spacingX;
                const laneY = soldierLane.laneIndex * laneHeight + laneHeight / 2;
                transform.y = laneY + (row - (rows - 1) / 2) * (spacingY / 2);
                
                // Publish position changed event if position actually changed
                if (eventBus && (originalX !== transform.x || originalY !== transform.y)) {
                    eventBus.publish('entityPositionChanged', { entity: soldier });
                }
            }
        }
    },

    /**
     * Move the player to a specific lane
     * @param {Entity} playerEntity
     * @param {number} laneIndex
     * @returns {boolean}
     */
    moveToLane(playerEntity, laneIndex) {
        const lane = playerEntity.getComponent('lane');
        if (!lane) return false;
        if (laneIndex < 0 || laneIndex > 8) return false;
        
        const previousLane = lane.laneIndex;
        const wasInBonusLane = previousLane === 0;
        const isMovingToBonusLane = laneIndex === 0;
        
        // Only proceed if actually changing lanes
        if (previousLane !== laneIndex) {
            // Update lane component
            lane.laneIndex = laneIndex;

            // Use lane system to update position
            const laneSystem = ServiceLocator.getService('laneSystem');
            if (laneSystem) {
                laneSystem.processEntity(playerEntity, 0);
            }
            
            // Get event bus
            const eventBus = ServiceLocator.getService('eventBus');

            eventBus.publish('entityPositionChanged', { entity: playerEntity });
            // Update soldier distribution and positions
            const entityManager = ServiceLocator.getService('entityManager');
            this.distributeSoldiersAcrossLanes(playerEntity, entityManager);
            this.updateSoldierPositions(playerEntity, entityManager);
        }
        
        return true;
    },

    /**
     * Add grenades to the player's inventory
     */
    addGrenades(playerEntity, grenadeType, count = 1) {
        const playerComp = playerEntity.getComponent('player');
        if (!playerComp.grenades.hasOwnProperty(grenadeType)) return 0;
        playerComp.grenades[grenadeType] += count;
        return playerComp.grenades[grenadeType];
    },

    /**
     * Get the current grenade count for a specific type
     */
    getGrenadeCount(playerEntity, grenadeType) {
        const playerComp = playerEntity.getComponent('player');
        return playerComp.grenades[grenadeType] || 0;
    },

    /**
     * Check if player can throw a grenade
     */
    canThrowGrenade(playerEntity, grenadeType) {
        const playerComp = playerEntity.getComponent('player');
        return playerComp.grenades[grenadeType] > 0;
    },

    /**
     * Throw a grenade
     * @returns {Entity|null} The grenade entity or null if couldn't throw
     */
    throwGrenade(entityManager, playerEntity, grenadeType) {
        if (!this.canThrowGrenade(playerEntity, grenadeType)) return null;
        const transform = playerEntity.getComponent('transform');
        const lane = playerEntity.getComponent('lane');

        if (!transform || !lane|| lane.laneIndex === 0) return null;

        const playerComp = playerEntity.getComponent('player');
        playerComp.grenades[grenadeType]--;

        const props = playerComp.grenadeProperties[grenadeType];

        const grenade = entityManager.createEntity();

        const grenadeTransform = new TransformComponent();
        grenadeTransform.init({ x: transform.x + 30, y: transform.y });
        grenade.addComponent(grenadeTransform);

        const render = new RenderComponent();
        render.setAsCircle(props.width / 2, props.color);
        grenade.addComponent(render);

        const movement = new MovementComponent();
        movement.init({ type: MovementType.PROJECTILE, speed: props.speed, directionX: 1 });
        grenade.addComponent(movement);

        const collision = new CollisionComponent();
        collision.init({ collisionType: CollisionType.PROJECTILE, width: props.width, height: props.height });
        grenade.addComponent(collision);

        const projectile = new ProjectileComponent();

        projectile.init({
            damage: props.damage,
            affectedEntities: 999,
            areaWidth: props.radius * 2,
            areaHeight: props.radius * 2,
            sourceEntity: playerEntity,
            isGrenade: true,
            grenadeType: grenadeType,
            slowFactor: props.slowFactor,
            slowDuration: props.duration
        });
        grenade.addComponent(projectile);
        grenade.addTag('grenade');
        grenade.addTag(grenadeType === GrenadeType.STICKY ? 'stickyGrenade' : 'standardGrenade');

        // Notify that the entity is fully initialized with all components
        entityManager.notifyEntityAdded(grenade);

        return grenade;
    },

    /**
     * Get all soldier entities for a player
     */
    getSoldiers(entityManager, playerEntity) {
        const playerComp = playerEntity.getComponent('player');
        return playerComp.soldiers.map(id => entityManager.getEntity(id)).filter(Boolean);
    },

    /**
     * Check if a soldier is dead
     */
    isSoldierDead(soldierEntity) {
        const health = soldierEntity.getComponent('health');
        return health ? health.isDead : false;
    }
}; 