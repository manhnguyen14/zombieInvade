/**
 * System Base Class
 * 
 * Base class for all game systems. Systems contain game logic that operates
 * on entities with specific components.
 */

export class System {
    /**
     * Create a new System instance
     * @param {string} name - The system name
     */
    constructor(name) {
        if (typeof name !== 'string' || !name) {
            throw new Error('System name must be a non-empty string');
        }
        
        // System name
        this.name = name;
        
        // Whether the system is enabled
        this.enabled = true;
        
        // Priority for update order (higher priority systems update first)
        this.priority = 0;
    }

    /**
     * Update the system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Base implementation does nothing
        // Subclasses should override this to implement their specific logic
    }

    /**
     * Enable the system
     * @returns {System} This system for method chaining
     */
    enable() {
        this.enabled = true;
        return this;
    }

    /**
     * Disable the system
     * @returns {System} This system for method chaining
     */
    disable() {
        this.enabled = false;
        return this;
    }

    /**
     * Check if the system is enabled
     * @returns {boolean} True if the system is enabled, false otherwise
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Set the system priority
     * @param {number} priority - The priority value (higher values update first)
     * @returns {System} This system for method chaining
     */
    setPriority(priority) {
        if (typeof priority !== 'number') {
            throw new Error('Priority must be a number');
        }
        
        this.priority = priority;
        return this;
    }

    /**
     * Get the system priority
     * @returns {number} The priority value
     */
    getPriority() {
        return this.priority;
    }

    /**
     * Initialize the system
     * Called when the system is added to the game
     */
    initialize() {
        // Base implementation does nothing
        // Subclasses can override this to perform initialization
    }

    /**
     * Clean up resources when the system is destroyed
     */
    destroy() {
        // Base implementation does nothing
        // Subclasses should override this to clean up their resources
    }
}
