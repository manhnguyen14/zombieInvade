/**
 * Bonus System
 * 
 * Manages bonus entities and their behavior.
 * Handles bonus collection and effects.
 */

import { EntitySystem } from './entity-system.js';
import { ServiceLocator } from '../core/service-locator.js';

export class BonusSystem extends EntitySystem {
    /**
     * Create a new BonusSystem instance
     */
    constructor() {
        // This system requires transform and bonus components for lane bonuses
        super('bonusSystem', ['transform', 'bonus']);

        // Set a medium priority
        this.setPriority(5);

        // Get services
        this.entityManager = null;
        this.eventBus = null;
        this.bonusService = null;
        this.debug = false;
    }

    /**
     * Initialize the system
     */
    initialize() {
        // Get required services
        this.entityManager = ServiceLocator.getService('entityManager');
        this.eventBus = ServiceLocator.getService('eventBus');
        this.bonusService = ServiceLocator.getService('bonusService');

        if (!this.entityManager || !this.eventBus || !this.bonusService) {
            console.error('[BONUS_SYSTEM] Required services not found');
            return;
        }

        // Subscribe to bonus collected event
        this.eventBus.subscribe('bonusCollected', this.handleBonusCollected.bind(this));

        console.log('[BONUS_SYSTEM] Initialized');
    }

    /**
     * Update the system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Process all bonus entities
        const bonusEntities = this.getEntities();
        for (const entity of bonusEntities) {
            // Update bonus timer
            if (!this.bonusService.updateBonusTimer(entity, deltaTime)) {
                // Bonus expired
                this.entityManager.removeEntity(entity);
                continue;
            }

            // Handle embedded bonuses
            if (entity.hasTag('embeddedBonus')) {
                this.processEmbeddedBonus(entity);
            }
        }
    }

    /**
     * Process an embedded bonus
     * @param {Entity} entity - The bonus entity to process
     */
    processEmbeddedBonus(entity) {
        const bonus = entity.getComponent('bonus');
        if (!bonus) return;

        // Check if host entity still exists
        const hostEntity = this.entityManager.getEntity(bonus.hostEntityId);
        if (!hostEntity) {
            // Host entity was destroyed, grant bonus
            const players = this.entityManager.getEntitiesWithAnyTag(['player']);
            const player = players.length > 0 ? players[0] : null;
            
            if (player) {
                this.bonusService.handleBonusCollected(player, entity);
            }
            this.entityManager.removeEntity(entity);
            return;
        }
    }

    /**
     * Handle bonus collected event
     * @param {Object} event - Bonus collected event data
     */
    handleBonusCollected(event) {
        const { player, bonus } = event;
        this.bonusService.handleBonusCollected(player, bonus);
        this.entityManager.removeEntity(bonus);

        if (this.debug) {
            console.log('[BONUS_SYSTEM] Bonus collected and removed:', bonus.id);
        }
    }

    /**
     * Clean up resources when the system is destroyed
     */
    destroy() {
        // Unsubscribe from events
        if (this.eventBus) {
            this.eventBus.unsubscribe('bonusCollected', this.handleBonusCollected);
        }

        this.entityManager = null;
        this.eventBus = null;
        this.bonusService = null;
    }
}