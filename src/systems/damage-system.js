/**
 * Damage System
 *
 * Handles damage application and damage area management.
 * Updates damage components and manages attack cooldowns.
 */

import { EntitySystem } from './entity-system.js';
import { ServiceLocator } from '../core/service-locator.js';
import { DamageService } from '../core/damage-service.js';
import { DamageType, AttackBehavior } from '../entities/components/damage.js';

export class DamageSystem extends EntitySystem {
    /**
     * Create a new DamageSystem instance
     */
    constructor() {
        // This system requires health and collision components
        super('damageSystem', ['health', 'collision']);

        // Set a medium priority
        this.setPriority(5);

        // Create a damage service
        this.damageService = new DamageService();

        // Register the damage service with the service locator
        ServiceLocator.registerService('damageService', this.damageService);

        // Debug flag
        this.debug = false;
    }

    /**
     * Initialize the system
     */
    initialize() {
        // Initialize the damage service
        this.damageService.initialize();

        // Get the event bus
        this.eventBus = ServiceLocator.getService('eventBus');
        if (!this.eventBus) {
            console.error('[DAMAGE_SYSTEM] Event bus not found');
            return;
        }

        // Subscribe to events
        this.eventBus.subscribe('enemySoldierCollision', this.handleEnemySoldierCollision.bind(this));
        this.eventBus.subscribe('projectileTargetCollision', this.handleProjectileTargetCollision.bind(this));
    }

    /**
     * Update the system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Update the damage service
        this.damageService.update(deltaTime);

        // Get all entities with damage component
        const entities = this.getEntities();

        // Process all entities
        for (const entity of entities) {
            this.processEntity(entity, deltaTime);
        }
    }

    /**
     * Process an entity with health and collision components
     * @param {Entity} entity - The entity to process
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    processEntity(entity, deltaTime) {
        // Get health component and return early if none exists
        const health = entity.getComponent('health');
        if (!health) return;

        // Handle dead entities
        if (health.isDead) {
            // For zombies, play death animation before removing
            if (entity.hasTag('enemy') && !entity.hasTag('dying')) {
                // Mark as dying to prevent repeated processing
                entity.addTag('dying');

                this.eventBus.publish('enemyKilled', { entity });

                // Remove movement and collision components
                const movement = entity.getComponent('movement');
                movement.speed = 0
                const collision = entity.getComponent('collision');
                collision.enabled = false;

                // Set death animation state
                const render = entity.getComponent('render');
                if (render) {
                    render.setState('dying');
                }
                return;
            }
            
            // For non-zombies or zombies that finished dying animation
            if (!entity.hasTag('enemy') || health.deathTimer <= 0) {
                // Remove entity
                const entityManager = ServiceLocator.getService('entityManager');
                if (entityManager) {
                    entityManager.removeEntity(entity);
                }
                return;
            }
            // Update death timer for dying zombies
            health.updateDeathTimer(deltaTime);
            return;
        }

        // Process damage component
        const damage = entity.getComponent('damage');
        if (!damage || !damage.isAttacking) return;

        // Update attack cooldown
        damage.updateCooldown(deltaTime);
        if (!damage.canAttack()) return;

        // Validate targets
        const entityManager = ServiceLocator.getService('entityManager');
        if (!entityManager) return;

        const validTargets = new Set();

        // Filter for valid targets
        for (const targetId of damage.attackTargets) {
            const target = entityManager.getEntity(targetId);
            if (target) {
                const targetHealth = target.getComponent('health');
                if (targetHealth && !targetHealth.isDead) {
                    validTargets.add(targetId);
                }
            }
        }

        // Update attack targets
        damage.attackTargets = validTargets;

        // Handle no valid targets
        if (validTargets.size === 0) {
            damage.stopAttack();

            if (this.eventBus && damage.attackBehavior === AttackBehavior.STOP) {
                this.eventBus.publish('entityResumedFromAttack', { entity });
            }
            return;
        }

        // Handle enemy attack
        if ((entity.hasTag('enemy') || entity.hasTag('obstacle')) && validTargets.size > 0) {
            damage.resetCooldown();
            this.damageService.handleEnemyToSoldierCollision(entity, Array.from(validTargets)[0]);
        }
    }

    /**
     * Handle enemy-soldier collision
     * @param {Object} event - Collision event data
     */
    handleEnemySoldierCollision(event) {
        const { enemy, soldier } = event;

        // Delegate to damage service
        this.damageService.handleEnemyToSoldierCollision(enemy, soldier);
    }

    /**
     * Handle projectile-target collision
     * @param {Object} event - Collision event data
     */
    handleProjectileTargetCollision(event) {
        const { projectile, target } = event;

        // Delegate to damage service
        this.damageService.handleProjectileTargetCollision(projectile, target);
    }

    /**
     * Clean up resources when the system is destroyed
     */
    destroy() {
        // Destroy the damage service
        if (this.damageService) {
            this.damageService.destroy();
        }

        // Unsubscribe from events
        if (this.eventBus) {
            this.eventBus.unsubscribe('enemySoldierCollision', this.handleEnemySoldierCollision);
            this.eventBus.unsubscribe('handleProjectileTargetCollision',this.handleProjectileTargetCollision);
        }

        this.damageService = null;
        this.eventBus = null;
    }
}
