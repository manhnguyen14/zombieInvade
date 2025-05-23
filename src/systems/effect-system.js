/**
 * Effect System
 * 
 * Manages status effects on entities.
 * Handles application and removal of effects.
 */

import { System } from '../systems/system.js';
import { ServiceLocator } from '../core/service-locator.js';
import { CollisionType } from '../entities/components/collision.js';

export class EffectSystem extends System {
    /**
     * Create a new EffectSystem
     */
    constructor() {
        super('effectSystem');
        
        // Debug flag
        this.debug = false;
        
        // Reference to the effect service
        this.effectService = null;
    }
    
    /**
     * Initialize the system
     */
    initialize() {
        // Get event bus
        this.eventBus = ServiceLocator.getService('eventBus');
        if (!this.eventBus) {
            console.error('[EFFECT_SYSTEM] Event bus not found');
            return;
        }
        
        // Get effect service
        this.effectService = ServiceLocator.getService('effectService');
        if (!this.effectService) {
            console.error('[EFFECT_SYSTEM] Effect service not found');
            return;
        }
        
        // Subscribe to events
        this.eventBus.subscribe('entityCollidedWithEffectArea', this.handleCollidedWithEffectArea.bind(this));
        
        console.log('[EFFECT_SYSTEM] Initialized');
    }
    
    /**
     * Update the system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Update the effect service
        if (this.effectService) {
            this.effectService.update(deltaTime);
        }
    }

    handleCollidedWithEffectArea(event){
        const { effectArea, target } = event;
        const effectAreaCollision = effectArea.getComponent('collision');
        const targetCollision = target.getComponent('collision');
        if (!effectAreaCollision||!targetCollision) {
            return;
        }

        if (effectArea.tags.has('stickyArea')) {
            this.handleEntityStickyAreaCollision(effectArea, target);
            return;
        }
    }
    /**
     * Handle entity colliding with sticky area
     * @param {Object} stickyArea - sticky area entity
     * @param {Object} target - Target entity
     */
     handleEntityStickyAreaCollision(stickyArea, target) {
        // Check if entity can be affected (enemy or obstacle)
        const stickyAreaCollision = stickyArea.getComponent('collision');
        const targetCollision = target.getComponent('collision');
        if (!stickyArea.tags.has('stickyArea') || !stickyAreaCollision || (
            targetCollision.collisionType !== CollisionType.ENEMY &&
            targetCollision.collisionType !== CollisionType.OBSTACLE
        )) {
            return;
        }

        // Apply slow effect through the effect service
        if (this.effectService) {
            this.effectService.applySlowEffect(stickyArea, target);
        } else {
            console.error('[EFFECT_SYSTEM] Effect service not found');
        }
    }

    /**
     * Clean up resources when the system is destroyed
     */
    destroy(){
        if (this.eventBus) {
            this.eventBus.unsubscribe('entityCollidedWithStickyArea', this.handleEntityStickyAreaCollision);
        }
        this.eventBus = null;
        this.effectService = null;
    }
}