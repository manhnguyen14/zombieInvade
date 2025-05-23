/**
 * Damage Service
 *
 * Manages damage areas and applies damage to entities.
 * Handles priority system for attacks.
 */

import { ServiceLocator } from './service-locator.js';
import { DamageType, AttackBehavior } from '../entities/components/damage.js';
import { CollisionType, CollisionComponent } from '../entities/components/collision.js';
import { createStickyArea } from "../entities/sticky-area.js";
import { DamageAreaComponent } from '../entities/components/damage-area-component.js';
import { createDamageArea } from '../entities/damage-area.js';

export class DamageService {
    /**
     * Create a new DamageService instance
     */
    constructor() {
        // Active damage areas
        this.damageAreas = [];

        // Entity manager reference
        this.entityManager = null;
    }

    /**
     * Initialize the service
     */
    initialize() {
        // Get entity manager
        this.entityManager = ServiceLocator.getService('entityManager');
        if (!this.entityManager) {
            console.error('[DAMAGE_SERVICE] Entity manager not found');
            return;
        }

        // Get the event bus
        this.eventBus = ServiceLocator.getService('eventBus');
        if (!this.eventBus) {
            console.error('[DAMAGE_SYSTEM] Event bus not found');
            return;
        }
    }

    /**
     * Update damage areas
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Update all damage areas
        for (const damageArea of this.damageAreas) {
            // Update lifetime
            let damageAreaComponent = damageArea.getComponent('damageArea');
            damageAreaComponent.lifetime -= deltaTime;

            // Check if damage area should be destroyed
            if (damageAreaComponent.lifetime <= 0) {
                this.destroyDamageArea(damageArea);
                continue;
            }
        }
    }

    /**
     * Apply damage to an entity from a damage area
     * @param {Entity} damageAreaEntity - The damage area entity
     * @param {Entity} target - The entity to damage
     * @returns {boolean} True if damage was applied, false otherwise
     */
    applyDamage(damageAreaEntity, target) {

        const damageArea = damageAreaEntity.getComponent('damageArea');
        if (!damageArea) {
            return false;
        }

        // Check if we've already damaged this entity
        if (damageArea.hasDamagedEntity(target)) {
            return false;
        }

        // Check if we've reached the maximum number of affected entities
        if (!damageArea.canDamageMoreEntities()) {
            return false;
        }

        // Get health component
        const health = target.getComponent('health');
        if (!health) {
            return false;
        }

        // Apply damage
        const damageDealt = health.takeDamage(damageArea.damageAmount);

        // Add to damaged entities
        damageArea.addDamagedEntity(target);

        return true;
    }

    /**
     * Destroy a damage area entity
     * @param {Entity} entity - The damage area entity to destroy
     */
    destroyDamageArea(entity) {
        // Remove from active damage areas
        const index = this.damageAreas.indexOf(entity);
        if (index !== -1) {
            this.damageAreas.splice(index, 1);
        }

        // Remove the entity
        this.entityManager.removeEntity(entity);
    }

    /**
     * Handle enemy-to-soldier collision
     * @param {Entity} enemy - Enemy entity
     * @param {Entity} soldier - Soldier entity
     */
    handleEnemyToSoldierCollision(enemy, soldier) {
        // Get damage component
        const damage = enemy.getComponent('damage');
        if (!damage) {
            return;
        }

        // Check if enemy can attack (cooldown is complete)
        if (!damage.canAttack()) {
            return;
        }

        // Start attack
        damage.startAttack();
        damage.addAttackTarget(soldier);
        damage.resetCooldown();

        // Publish event for movement system to handle if attack behavior is to stop
        if (damage.attackBehavior === AttackBehavior.STOP && this.eventBus) {
            this.eventBus.publish('entityStoppedForAttack', { entity: enemy });
        }

        // Create damage area
        const damageAreaEntity = this.handleDamageArea(enemy, soldier);
        if (damageAreaEntity) {
            this.damageAreas.push(damageAreaEntity);
        }
    }

    /**
     * Create a damage area for enemy-to-soldier damage
     * @param {Entity} enemy - Enemy entity
     * @param {Entity} soldier - Soldier entity (can be null if creating a damage area for existing targets)
     * @returns {Entity} The created damage area entity
     */
    handleDamageArea(enemy, soldier) {
        // Get damage component
        const damage = enemy.getComponent('damage');
        if (!damage) {
            return null;
        }

        // Get enemy transform component
        const enemyTransform = enemy.getComponent('transform');
        if (!enemyTransform) {
            return null;
        }

        // Create damage area to the left of the enemy
        const damageAreaEntity = createDamageArea(this.entityManager, {
            x: enemyTransform.x - damage.reachWidth, // Position to the left of enemy
            y: enemyTransform.y,
            width: damage.reachWidth,
            height: damage.reachHeight,
            damageType: DamageType.ENEMY_TO_SOLDIER,
            damageAmount: damage.damageAmount,
            affectedEntities: damage.affectedEntities,
            sourceEntity: enemy,
            lifetime: 0.2 // 0.2 seconds for visual effect
        });

        // Apply damage based on priority
        this.applyDamageWithPriority(damageAreaEntity);
        
        return damageAreaEntity;
    }

    /**
     * Apply damage to soldiers based on priority
     * @param {Entity} damageAreaEntity - The damage area entity
     */
    applyDamageWithPriority(damageAreaEntity) {

        // Get all soldiers in the damage area
        const soldiers = this.getSoldiersInDamageArea(damageAreaEntity);
        
        if (soldiers.length === 0) {
            return;
        }

        // Sort soldiers by priority (regular soldiers first, player last)
        soldiers.sort((a, b) => {
            const aIsPlayer = a.hasTag('player');
            const bIsPlayer = b.hasTag('player');

            if (aIsPlayer && !bIsPlayer) return 1; // Player goes last
            if (!aIsPlayer && bIsPlayer) return -1; // Regular soldier goes first
            return 0;
        });


        // Apply damage to soldiers in priority order
        for (const soldier of soldiers) {
            const damageArea = damageAreaEntity.getComponent('damageArea');

            if (damageArea.canDamageMoreEntities()) {
                const success = this.applyDamage(damageAreaEntity, soldier);
            } else {
                break;
            }
        }
    }

    /**
     * Get all soldiers in a damage area
     * @param {Entity} damageAreaEntity - The damage area entity
     * @returns {Entity[]} Array of soldier entities in the damage area
     */
    getSoldiersInDamageArea(damageAreaEntity) {

        // Get damage area bounds
        const transform = damageAreaEntity.getComponent('transform');
        const render = damageAreaEntity.getComponent('render');

        if (!transform || !render) {
            console.error(`[DAMAGE_SERVICE] Damage area entity ${damageAreaEntity.id} does not have transform or render component`);
            return [];
        }

        const bounds = {
            left: transform.x - render.width / 2,
            top: transform.y - render.height / 2,
            right: transform.x + render.width / 2,
            bottom: transform.y + render.height / 2,
            width: render.width,
            height: render.height
        };


        // Get all soldiers
        const allEntities = this.entityManager.getEntitiesWithAllComponents(['transform', 'collision', 'health']);

        const soldiers = allEntities.filter(entity => {
            const entityCollision = entity.getComponent('collision');
            return entityCollision && (
                entityCollision.collisionType === CollisionType.SOLDIER ||
                entityCollision.collisionType === CollisionType.PLAYER
            );
        });


        // Filter soldiers that are in the damage area
        const soldiersInArea = soldiers.filter(soldier => {
            const soldierTransform = soldier.getComponent('transform');
            const soldierCollision = soldier.getComponent('collision');

            if (!soldierTransform || !soldierCollision) {
                return false;
            }

            const soldierBounds = soldierCollision.getHitboxBounds(soldierTransform);

            const intersects = CollisionComponent.intersects(bounds, soldierBounds);

            return intersects;
        });

        return soldiersInArea;
    }

    /**
     * Handle projectile-to-enemy collision
     * @param {Entity} projectile - Projectile entity
     * @param {Entity} target - Target entity
     */
    handleProjectileTargetCollision(projectile, target) {
        // Check if this is a grenade
        const projectileComponent = projectile.getComponent('projectile');
        if (projectileComponent && projectileComponent.isGrenade) {
            // Handle grenade collision
            if (projectile.hasTag('stickyGrenade')) {
                this.handleStickyGrenadeCollision(projectile, target);
            } else {
                this.handleStandardGrenadeCollision(projectile, target);
            }
        } else {
            // Handle regular projectile collision
            const damageAreaEntity = this.createProjectileDamageArea(projectile, target);
            this.damageAreas.push(damageAreaEntity);
        }
        
        // Remove the projectile
        this.entityManager.removeEntity(projectile);
    }

    /**
     * Handle standard grenade collision
     * @param {Entity} grenade - Grenade entity
     * @param {Entity} target - Target entity
     */
    handleStandardGrenadeCollision(grenade, target) {
        const projectileComponent = grenade.getComponent('projectile');
        const transform = grenade.getComponent('transform');
        
        if (!projectileComponent || !transform) {
            return;
        }

        const damageAreaEntity = createDamageArea(this.entityManager, {
            x: transform.x,
            y: transform.y,
            width: projectileComponent.areaWidth,
            height: projectileComponent.areaHeight,
            damageType: DamageType.PROJECTILE_TO_ENEMY,
            damageAmount: projectileComponent.damage,
            affectedEntities: projectileComponent.affectedEntities,
            lifetime: 0.5, // Longer visual effect for grenade explosion
            isGrenade: true
        });
        
        // Apply damage to all enemies in the area
        this.applyDamageToEnemiesInArea(damageAreaEntity, target);

        // Add to active damage areas
        this.damageAreas.push(damageAreaEntity);
        
        // Publish event for rendering
        if (this.eventBus) {
            this.eventBus.publish('grenadeExploded', { 
                position: { x: transform.x, y: transform.y },
                radius: projectileComponent.areaWidth / 2
            });
        }
    }

    /**
     * Handle sticky grenade collision
     * @param {Entity} grenade - Grenade entity
     * @param {Entity} target - Target entity
     */
    handleStickyGrenadeCollision(grenade, target) {
        const projectileComponent = grenade.getComponent('projectile');
        const transform = grenade.getComponent('transform');
        
        if (!projectileComponent || !transform) {
            return;
        }
        
        // Create a sticky area that slows enemies
        const stickyAreaEntity = createStickyArea(this.entityManager, {
            x: transform.x,
            y: transform.y,
            width: projectileComponent.areaWidth,
            height: projectileComponent.areaHeight,
            slowFactor: projectileComponent.slowFactor,
            duration: projectileComponent.slowDuration,
            color: 'rgba(0, 255, 0, 0.3)' // Green sticky area
        });
        
        // Get effect service
        const effectService = ServiceLocator.getService('effectService');
        if (effectService) {
            effectService.addEffectArea(stickyAreaEntity);
        }
        
        // Apply initial damage (smaller than standard grenade)
        const damageAreaEntity = createDamageArea(this.entityManager, {
            x: transform.x,
            y: transform.y,
            width: projectileComponent.areaWidth,
            height: projectileComponent.areaHeight,
            damageType: DamageType.PROJECTILE_TO_ENEMY,
            damageAmount: projectileComponent.damage,
            affectedEntities: projectileComponent.affectedEntities,
            lifetime: 0.3, // Shorter visual effect
            isGrenade: true
        });
        
        // Apply damage to all enemies in the area
        this.applyDamageToEnemiesInArea(damageAreaEntity, target);

        // Add to active damage areas
        this.damageAreas.push(damageAreaEntity);
        
        // Publish events for rendering
        if (this.eventBus) {
            this.eventBus.publish('stickyAreaCreated', { stickyArea: stickyAreaEntity });
        }
    }

    /**
     * Create a damage area for projectile-to-target damage
     * @param {Entity} projectile - Projectile entity
     * @param {Entity} target - target entity
     * @returns {Entity} The created damage area entity
     */
    createProjectileDamageArea(projectile, target) {
        // Get projectile damage
        const projectileComponent = projectile.getComponent('projectile');
        if (!projectileComponent) {
            return null;
        }

        const projectileTransform = projectile.getComponent('transform');
        if (!projectileTransform) {
            return null;
        }

        // Get render component for color and bullet size
        const render = projectile.getComponent('render');
        const color = render ? render.color : 'rgba(255, 165, 0, 0.5)';

        // Create damage area at the enemy's position
        const damageAreaEntity = createDamageArea(this.entityManager,{
            x: projectileTransform.x,
            y: projectileTransform.y,
            width: projectileComponent.areaWidth,
            height: projectileComponent.areaHeight,
            damageType: DamageType.PROJECTILE_TO_ENEMY,
            damageAmount: projectileComponent.damage,
            affectedEntities: projectileComponent.affectedEntities,
            lifetime: 0.2, // 0.2 seconds for visual effect
            gunType: projectileComponent.gunType,
            isGrenade: false,
            color: color.replace(')', ', 0.3)').replace('rgb', 'rgba') // Semi-transparent version of projectile color
        });

        // Apply damage to enemies in the damage area
        this.applyDamageToEnemiesInArea(damageAreaEntity, target);

        return damageAreaEntity;
    }

    /**
     * Apply damage to enemies in a damage area
     * @param {Entity} damageAreaEntity - The damage area entity
     * @param {Entity} initialEnemy - The enemy that was initially hit
     */
    applyDamageToEnemiesInArea(damageAreaEntity, initialEnemy) {

        // Get damage area bounds
        const transform = damageAreaEntity.getComponent('transform');
        const render = damageAreaEntity.getComponent('render');

        if (!render || !transform) {
            return;
        }

        const bounds = {
            left: transform.x - render.width / 2,
            top: transform.y - render.height / 2,
            right: transform.x + render.width / 2,
            bottom: transform.y + render.height / 2,
            width: render.width,
            height: render.height
        };

        // Get all entities with health component that could be damaged
        const allEntities = this.entityManager.getEntitiesWithAllComponents(['transform', 'collision', 'health']);

        // Filter to get only enemies
        const enemies = allEntities.filter(entity => {
            // ignore first enemy
            if (entity.id === initialEnemy.id) {
                return false;
            }
            const entityCollision = entity.getComponent('collision');
            return entityCollision && (
                entityCollision.collisionType === CollisionType.ENEMY ||
                entityCollision.collisionType === CollisionType.OBSTACLE
            );
        });

        // Filter enemies that are in the damage area
        const enemiesInArea = enemies.filter(enemy => {
            const enemyTransform = enemy.getComponent('transform');
            const enemyCollision = enemy.getComponent('collision');

            if (!enemyTransform || !enemyCollision) {
                return false;
            }

            const enemyBounds = enemyCollision.getHitboxBounds(enemyTransform);
            const intersects = CollisionComponent.intersects(bounds, enemyBounds);

            return intersects;
        });

        // Apply damage to the initial enemy first
        this.applyDamage(damageAreaEntity, initialEnemy);

        // Apply damage to other enemies in the area
        for (const enemy of enemiesInArea) {
            const damageArea = damageAreaEntity.getComponent('damageArea');
            if (damageArea.canDamageMoreEntities()) {
                const success = this.applyDamage(damageAreaEntity, enemy);
            } else {
                break;
            }
        }
    }

    /**
     * Clean up resources when the service is destroyed
     */
    destroy() {
        // Destroy all damage areas
        for (const entity of this.damageAreas) {
            this.destroyDamageArea(entity);
        }

        this.damageAreas = [];
        this.entityManager = null;
    }
}
