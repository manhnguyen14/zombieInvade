/**
 * Entity System
 *
 * Base class for systems that operate on entities with specific components.
 * Provides methods to get entities with required components.
 */

import { System } from './system.js';
import { ServiceLocator } from '../core/service-locator.js';

export class EntitySystem extends System {
    /**
     * Create a new EntitySystem instance
     * @param {string} name - The system name
     * @param {string[]} requiredComponents - Array of component types required by this system
     */
    constructor(name, requiredComponents = []) {
        super(name);

        if (!Array.isArray(requiredComponents)) {
            throw new Error('Required components must be an array');
        }

        // Component types required by this system
        this.requiredComponents = requiredComponents;
    }

    /**
     * Get all entities with the required components
     * @returns {Entity[]} Array of entities with all required components
     */
    getEntities() {
        // Get the entity manager from the service locator
        const entityManager = ServiceLocator.getService('entityManager');

        // If no required components, return all active entities
        if (this.requiredComponents.length === 0) {
            const entities = entityManager.getActiveEntities();
            return entities;
        }

        // Otherwise, return entities with all required components
        const entities = entityManager.getEntitiesWithAllComponents(this.requiredComponents);
        return entities;
    }

    /**
     * Process an entity
     * @param {Entity} entity - The entity to process
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    processEntity(entity, deltaTime) {
        // Base implementation does nothing
        // Subclasses should override this to implement their specific logic
    }

    /**
     * Update the system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Skip if disabled
        if (!this.enabled) {
            console.log(`${this.name}: System is disabled, skipping update`);
            return;
        }

        // Get entities with required components
        const entities = this.getEntities();

        // Process each entity
        for (const entity of entities) {
            this.processEntity(entity, deltaTime);
        }

    }
}
