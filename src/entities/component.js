/**
 * Base Component class
 * All components should extend this class
 */
export class Component {
    /**
     * Create a new Component
     * @param {string} type - The type of component
     */
    constructor(type) {
        if (!type) {
            throw new Error('Component requires a type');
        }
        
        /**
         * The type of component
         * @type {string}
         */
        this.type = type;
        
        /**
         * Reference to the entity this component is attached to
         * @type {Entity}
         */
        this.entity = null;
    }
    
    /**
     * Set the entity this component is attached to
     * @param {Entity} entity - The entity
     */
    setEntity(entity) {
        this.entity = entity;
    }
    
    /**
     * Initialize the component with configuration
     * @param {Object} config - Configuration object
     */
    init(config = {}) {
        // Base implementation does nothing
        // Subclasses should override this method
    }
}
