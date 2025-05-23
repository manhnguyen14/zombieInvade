/**
 * Shooting System
 * 
 * Processes gun components and creates bullets.
 * Handles shooting cooldowns and prevents shooting in bonus lane.
 */

import { EntitySystem } from './entity-system.js';
import { ServiceLocator } from '../core/service-locator.js';
import { createBullet } from '../entities/bullet.js';

export class ShootingSystem extends EntitySystem {
    /**
     * Create a new ShootingSystem instance
     */
    constructor() {
        // This system requires gun component
        super('shootingSystem', ['gun']);
        
        // Set a medium priority
        this.setPriority(5);
        
        // Debug flag
        this.debug = false;
    }
    
    /**
     * Initialize the system
     */
    initialize() {
        // Get the entity manager
        this.entityManager = ServiceLocator.getService('entityManager');
        if (!this.entityManager) {
            console.error('[SHOOTING_SYSTEM] Entity manager not found');
            return;
        }
        
        // Get the event bus
        this.eventBus = ServiceLocator.getService('eventBus');
        if (!this.eventBus) {
            console.error('[SHOOTING_SYSTEM] Event bus not found');
            return;
        }
        
        console.log('[SHOOTING_SYSTEM] Initialized');
    }
    
    /**
     * Update the system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Get all entities with gun component
        const entities = this.getEntities();
        
        // Process all entities
        for (const entity of entities) {
            this.processEntity(entity, deltaTime);
        }
    }
    
    /**
     * Process an entity with gun component
     * @param {Entity} entity - The entity to process
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    processEntity(entity, deltaTime) {
        const gun = entity.getComponent('gun');
        
        // Skip if no gun component
        if (!gun) {
            return;
        }
        
        // Update gun cooldown
        gun.updateCooldown(deltaTime);
        
        // Check if in bonus lane (lane 8)
        const lane = entity.getComponent('lane');
        if (lane && lane.laneIndex === 0) {
            // Don't shoot in bonus lane
            return;
        }
        
        // Check if gun can shoot
        if (gun.canShoot()) {
            // Create bullet
            this.createBullet(entity, gun);
            
            // Reset cooldown
            gun.resetCooldown();
        }
    }
    
    /**
     * Create a bullet for an entity
     * @param {Entity} entity - The entity creating the bullet
     * @param {GunComponent} gun - The gun component
     */
    createBullet(entity, gun) {
        // Get transform component
        const transform = entity.getComponent('transform');
        if (!transform) {
            return;
        }
        
        // Calculate bullet position (in front of the entity)
        const position = {
            x: transform.x + 20, // Offset to the right
            y: transform.y
        };
        
        // Create bullet
        const bullet = createBullet(this.entityManager, gun, entity, position);
        
        if (this.debug) {
            console.log(`[SHOOTING_SYSTEM] Entity ${entity.id} fired a bullet of type ${gun.bulletType}`);
        }
        
        // Publish event
        if (this.eventBus) {
            this.eventBus.publish('bulletFired', {
                entity,
                bullet,
                gunType: gun.gunType
            });
        }
    }
    
    /**
     * Clean up resources when the system is destroyed
     */
    destroy() {
        this.entityManager = null;
        this.eventBus = null;
    }
}