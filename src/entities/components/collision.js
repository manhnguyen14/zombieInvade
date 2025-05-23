/**
 * Collision Component
 *
 * Stores collision information for an entity.
 * Used for collision detection and response.
 */

import { Component } from '../component.js';

// Collision types
export const CollisionType = {
    NONE: 'none',           // No collision
    PLAYER: 'player',       // Player team
    SOLDIER: 'soldier',     // Individual soldier
    ENEMY: 'enemy',         // Enemy (zombie)
    OBSTACLE: 'obstacle',   // Obstacle
    PROJECTILE: 'projectile', // Bullet or grenade
    BONUS: 'bonus',         // Bonus item
    HAZARD: 'hazard',       // Impassable hazard
    EFFECT_AREA: 'effectArea' // Area that applies effects (like sticky area)
};

export class CollisionComponent extends Component {
    /**
     * Create a new CollisionComponent instance
     */
    constructor() {
        super('collision');

        // Collision type
        this.collisionType = CollisionType.NONE;

        // Hitbox dimensions (relative to entity position)
        this.width = 0;
        this.height = 0;

        // Offset from entity position
        this.offsetX = 0;
        this.offsetY = 0;

        // Whether collision is enabled
        this.enabled = true;

        // Whether this entity can stack with others of the same type
        this.canStack = false;

        // Whether this entity can push others
        this.canPush = false;

        // Whether this entity can be pushed by others
        this.canBePushed = false;

        // Whether projectiles can pass through this entity
        this.projectilesPassThrough = false;

        // Entities this entity is currently colliding with
        this.collidingEntities = new Set();
        
        // Lanes this entity is occupying (calculated based on position and size)
        this.occupiedLanes = [];
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {string} [data.collisionType=CollisionType.NONE] - Collision type
     * @param {number} [data.width=0] - Hitbox width
     * @param {number} [data.height=0] - Hitbox height
     * @param {number} [data.offsetX=0] - X offset from entity position
     * @param {number} [data.offsetY=0] - Y offset from entity position
     * @param {boolean} [data.enabled=true] - Whether collision is enabled
     * @param {boolean} [data.canStack=false] - Whether this entity can stack with others
     * @param {boolean} [data.canPush=false] - Whether this entity can push others
     * @param {boolean} [data.canBePushed=false] - Whether this entity can be pushed
     * @param {boolean} [data.projectilesPassThrough=false] - Whether projectiles can pass through this entity
     * @returns {CollisionComponent} This component for method chaining
     */
    init(data = {}) {
        this.collisionType = data.collisionType !== undefined ? data.collisionType : CollisionType.NONE;
        this.width = data.width !== undefined ? data.width : 0;
        this.height = data.height !== undefined ? data.height : 0;
        this.offsetX = data.offsetX !== undefined ? data.offsetX : 0;
        this.offsetY = data.offsetY !== undefined ? data.offsetY : 0;
        this.enabled = data.enabled !== undefined ? data.enabled : true;
        this.canStack = data.canStack !== undefined ? data.canStack : false;
        this.canPush = data.canPush !== undefined ? data.canPush : false;
        this.canBePushed = data.canBePushed !== undefined ? data.canBePushed : false;
        this.projectilesPassThrough = data.projectilesPassThrough !== undefined ? data.projectilesPassThrough : false;
        return this;
    }

    /**
     * Reset the component to its default state
     * @returns {CollisionComponent} This component for method chaining
     */
    reset() {
        this.enabled = true;
        this.collidingEntities.clear();

        return this;
    }

    /**
     * Set the hitbox dimensions
     * @param {number} width - Hitbox width
     * @param {number} height - Hitbox height
     * @returns {CollisionComponent} This component for method chaining
     */
    setHitbox(width, height) {
        this.width = Math.max(0, width);
        this.height = Math.max(0, height);

        return this;
    }

    /**
     * Set the hitbox offset
     * @param {number} offsetX - X offset from entity position
     * @param {number} offsetY - Y offset from entity position
     * @returns {CollisionComponent} This component for method chaining
     */
    setOffset(offsetX, offsetY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        return this;
    }

    /**
     * Enable or disable collision
     * @param {boolean} enabled - Whether collision should be enabled
     * @returns {CollisionComponent} This component for method chaining
     */
    setEnabled(enabled) {
        this.enabled = enabled;

        // Clear colliding entities if disabled
        if (!enabled) {
            this.collidingEntities.clear();
        }

        return this;
    }

    /**
     * Set whether this entity can stack with others
     * @param {boolean} canStack - Whether stacking is allowed
     * @returns {CollisionComponent} This component for method chaining
     */
    setCanStack(canStack) {
        this.canStack = canStack;
        return this;
    }

    /**
     * Set whether this entity can push others
     * @param {boolean} canPush - Whether pushing is allowed
     * @returns {CollisionComponent} This component for method chaining
     */
    setCanPush(canPush) {
        this.canPush = canPush;
        return this;
    }

    /**
     * Set whether this entity can be pushed by others
     * @param {boolean} canBePushed - Whether being pushed is allowed
     * @returns {CollisionComponent} This component for method chaining
     */
    setCanBePushed(canBePushed) {
        this.canBePushed = canBePushed;
        return this;
    }

    /**
     * Add a colliding entity
     * @param {Entity} entity - The entity this entity is colliding with
     * @returns {boolean} True if the entity was added, false if it was already colliding
     */
    addCollidingEntity(entity) {
        if (!this.enabled || !entity) {
            return false;
        }

        const wasAdded = !this.collidingEntities.has(entity.id);
        this.collidingEntities.add(entity.id);

        return wasAdded;
    }

    /**
     * Remove a colliding entity
     * @param {Entity} entity - The entity to remove
     * @returns {boolean} True if the entity was removed, false if it wasn't colliding
     */
    removeCollidingEntity(entity) {
        if (!entity) {
            return false;
        }

        return this.collidingEntities.delete(entity.id);
    }

    /**
     * Check if this entity is colliding with another entity
     * @param {Entity} entity - The entity to check
     * @returns {boolean} True if the entities are colliding, false otherwise
     */
    isCollidingWith(entity) {
        if (!entity) {
            return false;
        }

        return this.collidingEntities.has(entity.id);
    }

    /**
     * Get all entities this entity is colliding with
     * @returns {Set<number>} Set of entity IDs this entity is colliding with
     */
    getCollidingEntities() {
        return new Set(this.collidingEntities);
    }

    /**
     * Clear all colliding entities
     * @returns {CollisionComponent} This component for method chaining
     */
    clearCollidingEntities() {
        this.collidingEntities.clear();
        return this;
    }

    /**
     * Get the hitbox bounds
     * @param {Object} transform - The entity's transform component
     * @returns {Object} Hitbox bounds {left, top, right, bottom, width, height}
     */
    getHitboxBounds(transform) {
        console.log(`[COLLISION_COMPONENT] Getting hitbox bounds for entity ${this.entity.id} with transform: `, transform);

        if (!transform) {
            return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
        }

        console.log(`[COLLISION_COMPONENT] Hitbox width: ${this.width}, height: ${this.height}, offset: ${this.offsetX}, ${this.offsetY}`);
        const left = transform.x + this.offsetX - this.width / 2;
        const top = transform.y + this.offsetY - this.height / 2;

        console.log(`[COLLISION_COMPONENT] Hitbox bounds: left=${left}, top=${top}, right=${left + this.width}, bottom=${top + this.height}`);
        return {
            left,
            top,
            right: left + this.width,
            bottom: top + this.height,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Check if this hitbox intersects with another hitbox
     * @param {Object} bounds1 - This entity's hitbox bounds
     * @param {Object} bounds2 - Other entity's hitbox bounds
     * @returns {boolean} True if the hitboxes intersect, false otherwise
     */
    static intersects(bounds1, bounds2) {
        return !(
            bounds1.right < bounds2.left ||
            bounds1.left > bounds2.right ||
            bounds1.bottom < bounds2.top ||
            bounds1.top > bounds2.bottom
        );
    }

    /**
     * Clone the component
     * @returns {CollisionComponent} A new component instance with the same properties
     */
    clone() {
        const clone = super.clone();

        // Copy collision-specific properties
        clone.type = this.type;
        clone.width = this.width;
        clone.height = this.height;
        clone.offsetX = this.offsetX;
        clone.offsetY = this.offsetY;
        clone.enabled = this.enabled;
        clone.canStack = this.canStack;
        clone.canPush = this.canPush;
        clone.canBePushed = this.canBePushed;
        clone.projectilesPassThrough = this.projectilesPassThrough;

        // Don't copy colliding entities
        clone.collidingEntities = new Set();

        return clone;
    }

    /**
     * Clean up resources when the component is destroyed
     */
    destroy() {
        this.collidingEntities.clear();
        super.destroy();
    }

    /**
     * Calculate which lanes this entity is occupying based on its position and size
     * @param {Object} transform - The entity's transform component
     * @param {number} laneHeight - Height of each lane
     * @returns {number[]} Array of lane indices this entity occupies
     */
    calculateOccupiedLanes(transform, laneHeight) {
        if (!transform || laneHeight <= 0) {
            console.log(`[COLLISION_COMPONENT] Cannot calculate occupied lanes: invalid transform or lane height`);
            this.occupiedLanes = [];
            return this.occupiedLanes;
        }

        // First check if entity has a lane component with a valid laneIndex
        const laneComponent = this.entity.getComponent('lane');
        if (laneComponent && typeof laneComponent.laneIndex === 'number') {
            console.log(`[COLLISION_COMPONENT] Using lane component index: ${laneComponent.laneIndex}`);
            this.occupiedLanes = [laneComponent.laneIndex];
            return this.occupiedLanes;
        }

        // Fall back to transform-based calculation if no lane component
        const bounds = this.getHitboxBounds(transform);
        console.log(`[COLLISION_COMPONENT] Calculating occupied lanes for entity ${this.entity.id} with bounds: left=${bounds.left}, top=${bounds.top}, right=${bounds.right}, bottom=${bounds.bottom}`);
        const topLane = Math.floor(bounds.top / laneHeight);
        console.log(`[COLLISION_COMPONENT] Top lane: ${topLane}`);
        const bottomLane = Math.floor(bounds.bottom / laneHeight);
        console.log(`[COLLISION_COMPONENT] Bottom lane: ${bottomLane}`);
        
        // Create array of occupied lanes
        this.occupiedLanes = [];
        for (let i = topLane; i <= bottomLane; i++) {
            console.log(`[COLLISION_COMPONENT] Adding lane ${i} to occupied lanes`);
            if (i >= 0) {
                console.log(`[COLLISION_COMPONENT] Pushing lane ${i} to occupied lanes`);
                this.occupiedLanes.push(i);
            }
        }
        
        return this.occupiedLanes;
    }

    /**
     * Get the lanes this entity is occupying
     * @returns {number[]} Array of lane indices
     */
    getOccupiedLanes() {
        return [...this.occupiedLanes];
    }
}
