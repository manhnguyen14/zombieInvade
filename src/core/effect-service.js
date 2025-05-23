/**
 * Effect Service
 *
 * Manages effect areas and applies effects to entities.
 */

import { ServiceLocator } from './service-locator.js';
import { EffectType } from '../entities/components/effect.js';
import { CollisionType } from '../entities/components/collision.js';

export class EffectService {
    /**
     * Create a new EffectService instance
     */
    constructor() {
        // Active effect areas
        this.effectAreas = [];

        // Entity manager reference
        this.entityManager = null;
        
        // Event bus reference
        this.eventBus = null;
    }

    /**
     * Initialize the service
     */
    initialize() {
        // Get entity manager
        this.entityManager = ServiceLocator.getService('entityManager');
        if (!this.entityManager) {
            console.error('[EFFECT_SERVICE] Entity manager not found');
            return;
        }

        // Get the event bus
        this.eventBus = ServiceLocator.getService('eventBus');
        if (!this.eventBus) {
            console.error('[EFFECT_SERVICE] Event bus not found');
            return;
        }

        console.log('[EFFECT_SERVICE] Initialized');
    }

    /**
     * Update all effect areas
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Update effect areas and remove expired ones
        this.effectAreas = this.effectAreas.filter(entity => {
            const effect = entity.getComponent('effect');
            if (!effect) return false;

            effect.remainingTime -= deltaTime;
            
            // If effect has expired, remove it
            if (effect.remainingTime <= 0) {
                this.removeEffectFromAllEntities(entity);
                this.entityManager.removeEntity(entity);
                return false;
            }
            
            return true;
        });
    }

    /**
     * Apply slow effect to an entity
     * @param {Object} effectArea - Effect area entity
     * @param {Object} entity - The entity to slow
     */
    applySlowEffect(effectArea, entity) {

        // Get effect component
        const effect = effectArea.getComponent('effect');
        if (!effect || effect.effectType !== EffectType.SLOW) {
            console.error('[EFFECT_SERVICE] Invalid effect area');
            return;
        }

        // Check if entity can be affected
        const movement = entity.getComponent('movement');
        if (!movement) {
            console.error('[EFFECT_SERVICE] Entity has no movement component');
            return;
        }

        // Apply slow effect using baseSpeed
        movement.speed = movement.baseSpeed * effect.strength;

        // If entity is part of a collision group, recalculate group speed
        if (movement.collisionGroupId) {
            this.recalculateGroupSpeed(movement.collisionGroupId);
        }

        // Add to affected entities
        effect.affectedEntities.add(entity.id);
    }

    /**
     * Remove slow effect from an entity
     * @param {Entity} effectArea - Effect area entity
     * @param {Entity} entity - The entity to remove effect from
     */
    removeSlowEffect(effectArea, entity) {

        // Get effect component
        const effect = effectArea.getComponent('effect');
        if (!effect) {
            console.error('[EFFECT_SERVICE] Invalid effect area');
            return;
        }

        // Get movement component
        const movement = entity.getComponent('movement');
        if (!movement) {
            console.error('[EFFECT_SERVICE] Entity has no movement component');
            return;
        }

        // Restore original speed using baseSpeed
        movement.speed = movement.baseSpeed;

        // If entity is part of a collision group, recalculate group speed
        if (movement.collisionGroupId) {
            this.recalculateGroupSpeed(movement.collisionGroupId);
        }

        // Remove from affected entities
        effect.affectedEntities.delete(entity.id);
    }
    
    /**
     * Remove effect from all affected entities
     * @param {Entity} effectArea - Effect area entity
     */
    removeEffectFromAllEntities(effectArea) {
        const effect = effectArea.getComponent('effect');
        if (!effect) return;


        // Remove effect from all affected entities
        for (const entityId of effect.affectedEntities) {
            const entity = this.entityManager.getEntity(entityId);
            if (entity) {
                this.removeSlowEffect(effectArea, entity);
            }
        }

        // Clear affected entities
        effect.affectedEntities.clear();
    }

    /**
     * Recalculate the speed of a collision group
     * @param {string} groupId - The collision group ID
     */
    recalculateGroupSpeed(groupId) {

        // Get collision group manager
        const collisionGroupManager = ServiceLocator.getService('collisionGroupManager');
        if (!collisionGroupManager) {
            console.error('[EFFECT_SERVICE] Collision group manager not found');
            return;
        }
        
        // Get the group entities
        const entityIds = collisionGroupManager.getGroup(groupId);

        if (!entityIds || entityIds.length === 0) {
            console.error(`[EFFECT_SERVICE] Collision group ${groupId} not found or empty`);
            return;
        }
        
        // Get entities from entity IDs
        const entities = entityIds.map(id => this.entityManager.getEntity(id)).filter(e => e);
        
        // Recalculate group speed
        collisionGroupManager.updateGroupSpeed(groupId, entities);
    }

    /**
     * Add an effect area to the managed list
     * @param {Entity} effectArea - The effect area entity
     */
    addEffectArea(effectArea) {
        this.effectAreas.push(effectArea);
    }
}