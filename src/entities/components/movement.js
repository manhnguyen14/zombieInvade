/**
 * Movement Component
 *
 * Stores movement information for an entity.
 * Used for controlling entity movement behavior.
 */

import { Component } from '../component.js';

// Movement types
export const MovementType = {
    NONE: 'none',           // No movement
    PLAYER: 'player',       // Player-controlled movement
    ENEMY: 'enemy',         // Enemy movement (right to left)
    OBSTACLE: 'obstacle',   // Obstacle movement (right to left)
    PROJECTILE: 'projectile', // Projectile movement (left to right)
    BONUS: 'bonus'          // Bonus movement (right to left)
};

export class MovementComponent extends Component {
    /**
     * Create a new MovementComponent instance
     */
    constructor() {
        super('movement');

        // Movement type (different from component type)
        this.movementType = MovementType.NONE;

        // Movement speed (pixels per second)
        this.speed = 0;

        // Base speed (used for resetting)
        this.baseSpeed = 0;

        // Direction vector (normalized)
        this.directionX = 0; // Default: no horizontal movement (will be handled by MovementSystem)
        this.directionY = 0;

        // Whether movement is enabled
        this.enabled = true;

        // Speed multiplier (for temporary speed changes)
        this.speedMultiplier = 1;

        // Weight for collision group speed calculations
        this.weight = 1;

        // ID of the collision group this entity belongs to (null if not in a group)
        this.collisionGroupId = null;

        // Current group speed (if part of a collision group)
        this.groupSpeed = null;

        // Entities this entity is directly colliding with
        this.collidingWith = new Set();
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {string} [data.movementType=MovementType.NONE] - Movement type (preferred)
     * @param {string} [data.type=MovementType.NONE] - Movement type (legacy, use movementType instead)
     * @param {number} [data.speed=0] - Movement speed
     * @param {number} [data.directionX=-1] - X direction
     * @param {number} [data.directionY=0] - Y direction
     * @param {boolean} [data.enabled=true] - Whether movement is enabled
     * @param {number} [data.weight=1] - Weight for collision group speed calculations
     * @returns {MovementComponent} This component for method chaining
     */
    init(data = {}) {
        // Set movement type (not component type)
        // Use movementType if provided, otherwise fall back to type, then default
        this.movementType = data.movementType !== undefined ? data.movementType : 
                           (data.type !== undefined ? data.type : MovementType.NONE);

        // Set other properties
        this.speed = data.speed !== undefined ? data.speed : 0;
        this.baseSpeed = this.speed;
        this.directionX = data.directionX !== undefined ? data.directionX : -1;
        this.directionY = data.directionY !== undefined ? data.directionY : 0;
        this.enabled = data.enabled !== undefined ? data.enabled : true;
        this.weight = data.weight !== undefined ? data.weight : 1;

        // Normalize direction
        this.normalizeDirection();

        return this;
    }

    /**
     * Reset the component to its default state
     * @returns {MovementComponent} This component for method chaining
     */
    reset() {
        this.speed = this.baseSpeed;
        this.speedMultiplier = 1;
        this.enabled = true;
        this.collisionGroupId = null;
        this.groupSpeed = null;
        this.collidingWith.clear();

        return this;
    }

    /**
     * Normalize the direction vector
     * @returns {MovementComponent} This component for method chaining
     */
    normalizeDirection() {
        const length = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY);

        if (length > 0) {
            this.directionX /= length;
            this.directionY /= length;
        } else {
            // Default to right-to-left if direction is zero
            this.directionX = -1;
            this.directionY = 0;
        }

        return this;
    }

    /**
     * Set the movement speed
     * @param {number} speed - New movement speed
     * @param {boolean} [updateBase=true] - Whether to update the base speed
     * @returns {MovementComponent} This component for method chaining
     */
    setSpeed(speed, updateBase = true) {
        this.speed = Math.max(0, speed);

        if (updateBase) {
            this.baseSpeed = this.speed;
        }

        return this;
    }

    /**
     * Set the movement direction
     * @param {number} directionX - X direction
     * @param {number} directionY - Y direction
     * @returns {MovementComponent} This component for method chaining
     */
    setDirection(directionX, directionY) {
        this.directionX = directionX;
        this.directionY = directionY;

        return this.normalizeDirection();
    }

    /**
     * Enable or disable movement
     * @param {boolean} enabled - Whether movement should be enabled
     * @returns {MovementComponent} This component for method chaining
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        return this;
    }

    /**
     * Set the speed multiplier
     * @param {number} multiplier - Speed multiplier
     * @returns {MovementComponent} This component for method chaining
     */
    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = Math.max(0, multiplier);
        return this;
    }


    /**
     * Get the effective movement speed
     * @returns {number} Effective movement speed
     */
    getEffectiveSpeed() {
        // If part of a collision group, use the group speed
        if (this.groupSpeed !== null) {
            return this.groupSpeed * this.speedMultiplier;
        }
        return this.speed * this.speedMultiplier;
    }

    /**
     * Calculate the movement delta for a time step
     * @param {number} deltaTime - Time elapsed since last update in seconds
     * @returns {Object} Movement delta {x, y}
     */
    calculateMovementDelta(deltaTime) {
        if (!this.enabled || deltaTime <= 0) {
            return { x: 0, y: 0 };
        }

        const effectiveSpeed = this.getEffectiveSpeed();

        return {
            x: this.directionX * effectiveSpeed * deltaTime,
            y: this.directionY * effectiveSpeed * deltaTime
        };
    }

    /**
     * Clone the component
     * @returns {MovementComponent} A new component instance with the same properties
     */
    clone() {
        const clone = super.clone();

        // Copy movement-specific properties
        clone.type = this.type;
        clone.speed = this.speed;
        clone.baseSpeed = this.baseSpeed;
        clone.directionX = this.directionX;
        clone.directionY = this.directionY;
        clone.enabled = this.enabled;
        clone.speedMultiplier = this.speedMultiplier;
        clone.weight = this.weight;

        // Don't copy collision group state
        clone.collisionGroupId = null;
        clone.groupSpeed = null;
        clone.collidingWith = new Set();

        return clone;
    }

    /**
     * Clean up resources when the component is destroyed
     */
    destroy() {
        this.collidingWith.clear();
        super.destroy();
    }

    /**
     * Set the weight for collision group speed calculations
     * @param {number} weight - The weight value (higher values have more influence on group speed)
     * @returns {MovementComponent} This component for method chaining
     */
    setWeight(weight) {
        this.weight = Math.max(0, weight);
        return this;
    }

    /**
     * Get the weight for collision group speed calculations
     * @returns {number} The weight value
     */
    getWeight() {
        return this.weight;
    }

    /**
     * Set the collision group ID
     * @param {string|null} groupId - The collision group ID or null if not in a group
     * @returns {MovementComponent} This component for method chaining
     */
    setCollisionGroupId(groupId) {
        this.collisionGroupId = groupId;
        return this;
    }

    /**
     * Get the collision group ID
     * @returns {string|null} The collision group ID or null if not in a group
     */
    getCollisionGroupId() {
        return this.collisionGroupId;
    }

    /**
     * Set the group speed
     * @param {number|null} speed - The group speed or null if not in a group
     * @returns {MovementComponent} This component for method chaining
     */
    setGroupSpeed(speed) {
        this.groupSpeed = speed;
        return this;
    }

    /**
     * Add an entity to the list of entities this entity is colliding with
     * @param {Entity} entity - The entity to add
     * @returns {boolean} True if the entity was added, false if it was already in the list
     */
    addCollidingEntity(entity) {
        if (!entity) return false;
        const wasAdded = !this.collidingWith.has(entity.id);
        this.collidingWith.add(entity.id);
        return wasAdded;
    }

    /**
     * Remove an entity from the list of entities this entity is colliding with
     * @param {Entity} entity - The entity to remove
     * @returns {boolean} True if the entity was removed, false if it wasn't in the list
     */
    removeCollidingEntity(entity) {
        if (!entity) return false;
        return this.collidingWith.delete(entity.id);
    }

    /**
     * Check if this entity is colliding with another entity
     * @param {Entity} entity - The entity to check
     * @returns {boolean} True if the entities are colliding, false otherwise
     */
    isCollidingWith(entity) {
        if (!entity) return false;
        return this.collidingWith.has(entity.id);
    }

    /**
     * Get all entities this entity is colliding with
     * @returns {Set<string>} Set of entity IDs this entity is colliding with
     */
    getCollidingEntities() {
        return new Set(this.collidingWith);
    }
}
