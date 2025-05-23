/**
 * Entity Class
 *
 * Base class for all game entities. Entities are containers for components
 * and have no behavior of their own. All game logic is implemented in systems
 * that operate on entities with specific components.
 */

export class Entity {
    /**
     * Create a new Entity instance
     * @param {number} id - Unique entity ID (assigned by EntityManager)
     */
    constructor(id) {
        if (typeof id !== 'number' || id < 0) {
            throw new Error('Entity ID must be a non-negative number');
        }

        // Unique identifier
        this.id = id;

        // Map of component type to array of component instances
        this.components = new Map();

        // Whether the entity is active (processed by systems)
        this.active = true;

        // Tags for quick filtering (Set of strings)
        this.tags = new Set();
    }

    /**
     * Add a component to the entity
     * @param {Object} component - The component to add
     * @returns {Entity} This entity for method chaining
     */
    addComponent(component) {
        if (!component || !component.type) {
            throw new Error('Cannot add invalid component to entity');
        }

        // Get or create array for this component type
        if (!this.components.has(component.type)) {
            this.components.set(component.type, []);
        }
        const components = this.components.get(component.type);
        components.push(component);

        // Set the entity reference on the component
        if (typeof component.setEntity === 'function') {
            component.setEntity(this);
        }

        return this;
    }

    /**
     * Remove a component from the entity
     * @param {string} componentType - The type of component to remove
     * @returns {boolean} True if the component was removed, false if it didn't exist
     */
    removeComponent(componentType) {
        if (!this.hasComponent(componentType)) {
            return false;
        }

        // Get the components before removing them
        const components = this.components.get(componentType);

        // Clear the entity reference on each component
        for (const component of components) {
            if (typeof component.setEntity === 'function') {
                component.setEntity(null);
            }
        }

        // Remove the component type
        return this.components.delete(componentType);
    }

    /**
     * Get a component by type (returns the first one if multiple exist)
     * @param {string} componentType - The type of component to get
     * @returns {Object|null} The component, or null if not found
     */
    getComponent(componentType) {
        const components = this.components.get(componentType);
        return components && components.length > 0 ? components[0] : null;
    }

    /**
     * Get all components of a specific type
     * @param {string} componentType - The type of component to get
     * @returns {Object[]} Array of components of the specified type
     */
    getComponents(componentType) {
        return this.components.get(componentType) || [];
    }

    /**
     * Check if the entity has a component
     * @param {string} componentType - The type of component to check for
     * @returns {boolean} True if the entity has the component, false otherwise
     */
    hasComponent(componentType) {
        const components = this.components.get(componentType);
        return components && components.length > 0;
    }

    /**
     * Check if the entity has all of the specified components
     * @param {string[]} componentTypes - Array of component types to check for
     * @returns {boolean} True if the entity has all components, false otherwise
     */
    hasAllComponents(componentTypes) {
        if (!Array.isArray(componentTypes)) {
            throw new Error('Component types must be an array');
        }

        return componentTypes.every(type => this.hasComponent(type));
    }

    /**
     * Check if the entity has any of the specified components
     * @param {string[]} componentTypes - Array of component types to check for
     * @returns {boolean} True if the entity has any of the components, false otherwise
     */
    hasAnyComponent(componentTypes) {
        if (!Array.isArray(componentTypes)) {
            throw new Error('Component types must be an array');
        }

        return componentTypes.some(type => this.hasComponent(type));
    }

    /**
     * Get all components on the entity
     * @returns {Object[]} Array of all components
     */
    getAllComponents() {
        const allComponents = [];
        for (const components of this.components.values()) {
            allComponents.push(...components);
        }
        return allComponents;
    }

    /**
     * Get the number of components on the entity
     * @returns {number} The number of components
     */
    getComponentCount() {
        return this.components.size;
    }

    /**
     * Add a tag to the entity
     * @param {string} tag - The tag to add
     * @returns {Entity} This entity for method chaining
     */
    addTag(tag) {
        if (typeof tag !== 'string' || !tag) {
            throw new Error('Tag must be a non-empty string');
        }

        this.tags.add(tag);
        return this;
    }

    /**
     * Remove a tag from the entity
     * @param {string} tag - The tag to remove
     * @returns {boolean} True if the tag was removed, false if it didn't exist
     */
    removeTag(tag) {
        return this.tags.delete(tag);
    }

    /**
     * Check if the entity has a tag
     * @param {string} tag - The tag to check for
     * @returns {boolean} True if the entity has the tag, false otherwise
     */
    hasTag(tag) {
        return this.tags.has(tag);
    }

    /**
     * Get all tags on the entity
     * @returns {string[]} Array of all tags
     */
    getAllTags() {
        return Array.from(this.tags);
    }

    /**
     * Activate the entity (make it processed by systems)
     * @returns {Entity} This entity for method chaining
     */
    activate() {
        this.active = true;
        return this;
    }

    /**
     * Deactivate the entity (make it ignored by systems)
     * @returns {Entity} This entity for method chaining
     */
    deactivate() {
        this.active = false;
        return this;
    }

    /**
     * Check if the entity is active
     * @returns {boolean} True if the entity is active, false otherwise
     */
    isActive() {
        return this.active;
    }
    /**
     * Get all soldiers assigned to this entity
     * @returns {Soldier[]} Array of all soldiers
     */
    getSoldiers(){}
    /**
     * Clean up resources when the entity is destroyed
     */
    destroy() {
        // Remove all components
        for (const componentType of this.components.keys()) {
            this.removeComponent(componentType);
        }

        // Clear tags
        this.tags.clear();

        // Deactivate
        this.active = false;
    }
}
