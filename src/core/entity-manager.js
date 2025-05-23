import { Entity } from '../entities/entity.js';
import { ServiceLocator } from './service-locator.js';

/**
 * Entity Manager
 *
 * Manages the creation, deletion, and querying of entities.
 * Provides methods to find entities with specific components or tags.
 */

export class EntityManager {
    /**
     * Create a new EntityManager instance
     */
    constructor() {
        // Map of entity ID to entity instance
        this.entities = new Map();

        // Counter for generating unique entity IDs
        this.entityIdCounter = 0;
        
        // Get the event bus
        try {
            this.eventBus = ServiceLocator.getService('eventBus');
        } catch (e) {
            // Event bus might not be registered yet, that's okay
            this.eventBus = null;
        }
        
        // Set to track entities that have had their added event published
        this.entitiesNotified = new Set();
    }

    /**
     * Create a new entity
     * @returns {Entity} The newly created entity
     */
    createEntity() {
        // Generate a unique ID for this entity
        const id = this.entityIdCounter++;

        // Create the entity
        const entity = new Entity(id);

        // Store the entity
        this.entities.set(id, entity);
        
        // Note: We'll publish the entityAdded event when the entity is fully initialized
        // by calling notifyEntityAdded(entity) after all components are added

        return entity;
    }

    /**
     * Notify that an entity has been fully initialized with all components
     * @param {Entity} entity - The fully initialized entity
     */
    notifyEntityAdded(entity) {
        if (!entity) return;
        
        // Only publish the event if it hasn't been published for this entity
        if (this.eventBus && !this.entitiesNotified.has(entity.id)) {
            this.eventBus.publish('entityAdded', { entity });
            this.entitiesNotified.add(entity.id);
        }
    }

    /**
     * Get an entity by ID
     * @param {number} id - The entity ID
     * @returns {Entity|null} The entity, or null if not found
     */
    getEntity(id) {
        return this.entities.get(id) || null;
    }

    /**
     * Check if an entity exists
     * @param {number} id - The entity ID
     * @returns {boolean} True if the entity exists, false otherwise
     */
    hasEntity(id) {
        return this.entities.has(id);
    }

    /**
     * Remove an entity
     * @param {number|Entity} entityOrId - The entity or entity ID to remove
     * @returns {boolean} True if the entity was removed, false if it didn't exist
     */
    removeEntity(entityOrId) {
        // Get the entity ID
        const id = typeof entityOrId === 'number' ? entityOrId : entityOrId.id;

        // Get the entity
        const entity = this.getEntity(id);

        if (!entity) {
            return false;
        }

        // Publish entity removed event before destroying
        if (this.eventBus) {
            this.eventBus.publish('entityRemoved', { entity });
        }

        // Clean up the entity
        entity.destroy();

        // Remove the entity from the notified set
        this.entitiesNotified.delete(id);

        // Remove the entity from the manager
        return this.entities.delete(id);
    }

    /**
     * Get all entities
     * @returns {Entity[]} Array of all entities
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }

    /**
     * Get the number of entities
     * @returns {number} The number of entities
     */
    getEntityCount() {
        return this.entities.size;
    }

    /**
     * Get all active entities
     * @returns {Entity[]} Array of all active entities
     */
    getActiveEntities() {
        return this.getAllEntities().filter(entity => entity.isActive());
    }

    /**
     * Get all entities with a specific component
     * @param {string} componentType - The component type to filter by
     * @returns {Entity[]} Array of entities with the component
     */
    getEntitiesWithComponent(componentType) {
        return this.getAllEntities().filter(entity =>
            entity.isActive() && entity.hasComponent(componentType)
        );
    }

    /**
     * Get all entities with all of the specified components
     * @param {string[]} componentTypes - Array of component types to filter by
     * @returns {Entity[]} Array of entities with all components
     */
    getEntitiesWithAllComponents(componentTypes) {
        return this.getAllEntities().filter(entity =>
            entity.isActive() && entity.hasAllComponents(componentTypes)
        );
    }

    /**
     * Get all entities with any of the specified components
     * @param {string[]} componentTypes - Array of component types to filter by
     * @returns {Entity[]} Array of entities with any of the components
     */
    getEntitiesWithAnyComponent(componentTypes) {
        return this.getAllEntities().filter(entity =>
            entity.isActive() && entity.hasAnyComponent(componentTypes)
        );
    }

    /**
     * Get all entities with a specific tag
     * @param {string} tag - The tag to filter by
     * @returns {Entity[]} Array of entities with the tag
     */
    getEntitiesWithTag(tag) {
        return this.getAllEntities().filter(entity =>
            entity.isActive() && entity.hasTag(tag)
        );
    }

    /**
     * Get all entities with all of the specified tags
     * @param {string[]} tags - Array of tags to filter by
     * @returns {Entity[]} Array of entities with all tags
     */
    getEntitiesWithAllTags(tags) {
        return this.getAllEntities().filter(entity => {
            if (!entity.isActive()) return false;
            return tags.every(tag => entity.hasTag(tag));
        });
    }

    /**
     * Get all entities with any of the specified tags
     * @param {string[]} tags - Array of tags to filter by
     * @returns {Entity[]} Array of entities with any of the tags
     */
    getEntitiesWithAnyTag(tags) {
        return this.getAllEntities().filter(entity => {
            if (!entity.isActive()) return false;
            return tags.some(tag => entity.hasTag(tag));
        });
    }

    /**
     * Remove all entities
     */
    removeAllEntities() {
        // Get a copy of all entity IDs
        const entityIds = Array.from(this.entities.keys());
        
        // Remove each entity
        for (const id of entityIds) {
            this.removeEntity(id);
        }
    }

    /**
     * Add an existing entity to the manager
     * @param {Entity} entity - The entity to add
     * @returns {boolean} True if the entity was added, false if it already exists
     */
    addEntity(entity) {
        if (this.hasEntity(entity.id)) {
            return false;
        }

        // Store the entity
        this.entities.set(entity.id, entity);
        
        // Note: We don't automatically publish entityAdded here
        // The caller should call notifyEntityAdded after adding all components
        
        return true;
    }

    /**
     * Clean up resources when the entity manager is destroyed
     */
    destroy() {
        this.removeAllEntities();
        this.entitiesNotified.clear();
    }
}
