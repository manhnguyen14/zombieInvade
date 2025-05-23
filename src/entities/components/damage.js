/**
 * Damage Component
 * 
 * Stores damage information for an entity.
 * Used for creating damage areas when entities collide with soldiers.
 */

import { Component } from '../component.js';

// Damage types
export const DamageType = {
    NONE: 'none',
    ENEMY_TO_SOLDIER: 'enemy_to_soldier',
    PROJECTILE_TO_ENEMY: 'projectile_to_enemy'
};

// Attack behavior
export const AttackBehavior = {
    STOP: 'stop',         // Stop moving when attacking
    CONTINUE: 'continue'  // Continue moving while attacking
};

export class DamageComponent extends Component {
    /**
     * Create a new DamageComponent instance
     */
    constructor() {
        super('damage');
        
        // Damage type
        this.damageType = DamageType.NONE;
        
        // Damage amount
        this.damageAmount = 1;
        
        // Reach dimensions (damage area size)
        this.reachWidth = 50;
        this.reachHeight = 100;
        
        // Number of entities that can be affected in one attack
        this.affectedEntities = 1;
        
        // Damage interval in seconds
        this.damageInterval = 1.0;
        
        // Attack behavior
        this.attackBehavior = AttackBehavior.STOP;
        
        // Current attack cooldown
        this.attackCooldown = 0;
        
        // Whether the entity is currently attacking
        this.isAttacking = false;
        
        // Entities currently being attacked
        this.attackTargets = new Set();
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {string} [data.damageType=DamageType.NONE] - Damage type
     * @param {number} [data.damageAmount=1] - Damage amount
     * @param {number} [data.reachWidth=50] - Reach width
     * @param {number} [data.reachHeight=100] - Reach height
     * @param {number} [data.affectedEntities=1] - Number of affected entities
     * @param {number} [data.damageInterval=1.0] - Damage interval in seconds
     * @param {string} [data.attackBehavior=AttackBehavior.STOP] - Attack behavior
     * @returns {DamageComponent} This component for method chaining
     */
    init(data = {}) {
        this.damageType = data.damageType !== undefined ? data.damageType : DamageType.NONE;
        this.damageAmount = data.damageAmount !== undefined ? data.damageAmount : 1;
        this.reachWidth = data.reachWidth !== undefined ? data.reachWidth : 50;
        this.reachHeight = data.reachHeight !== undefined ? data.reachHeight : 100;
        this.affectedEntities = data.affectedEntities !== undefined ? data.affectedEntities : 1;
        this.damageInterval = data.damageInterval !== undefined ? data.damageInterval : 1.0;
        this.attackBehavior = data.attackBehavior !== undefined ? data.attackBehavior : AttackBehavior.STOP;
        
        return this;
    }

    /**
     * Reset the component to its default state
     * @returns {DamageComponent} This component for method chaining
     */
    reset() {
        this.attackCooldown = 0;
        this.isAttacking = false;
        this.attackTargets.clear();
        
        return this;
    }

    /**
     * Start attacking
     * @returns {DamageComponent} This component for method chaining
     */
    startAttack() {
        this.isAttacking = true;
        return this;
    }

    /**
     * Stop attacking
     * @returns {DamageComponent} This component for method chaining
     */
    stopAttack() {
        this.isAttacking = false;
        this.attackTargets.clear();
        return this;
    }

    /**
     * Add an attack target
     * @param {Entity} target - The entity to attack
     * @returns {boolean} True if the target was added, false if already attacking it
     */
    addAttackTarget(target) {
        if (!target) {
            return false;
        }

        const wasAdded = !this.attackTargets.has(target.id);
        this.attackTargets.add(target.id);
        
        return wasAdded;
    }

    /**
     * Remove an attack target
     * @param {Entity} target - The entity to stop attacking
     * @returns {boolean} True if the target was removed, false if not attacking it
     */
    removeAttackTarget(target) {
        if (!target) {
            return false;
        }

        return this.attackTargets.delete(target.id);
    }

    /**
     * Check if attacking a specific target
     * @param {Entity} target - The entity to check
     * @returns {boolean} True if attacking the target, false otherwise
     */
    isAttackingTarget(target) {
        if (!target) {
            return false;
        }

        return this.attackTargets.has(target.id);
    }

    /**
     * Get all attack targets
     * @returns {Set<number>} Set of entity IDs being attacked
     */
    getAttackTargets() {
        return new Set(this.attackTargets);
    }

    /**
     * Update the attack cooldown
     * @param {number} deltaTime - Time elapsed since last update in seconds
     * @returns {boolean} True if the cooldown is complete, false otherwise
     */
    updateCooldown(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        if (this.attackCooldown <= 0) {
            this.attackCooldown = 0;
            return true;
        }
        
        return false;
    }

    /**
     * Reset the attack cooldown
     * @returns {DamageComponent} This component for method chaining
     */
    resetCooldown() {
        this.attackCooldown = this.damageInterval;
        return this;
    }

    /**
     * Check if the entity can attack (cooldown is complete)
     * @returns {boolean} True if the entity can attack, false otherwise
     */
    canAttack() {
        return this.attackCooldown <= 0;
    }

    /**
     * Clone the component
     * @returns {DamageComponent} A new component instance with the same properties
     */
    clone() {
        const clone = super.clone();
        
        // Copy damage-specific properties
        clone.damageType = this.damageType;
        clone.damageAmount = this.damageAmount;
        clone.reachWidth = this.reachWidth;
        clone.reachHeight = this.reachHeight;
        clone.affectedEntities = this.affectedEntities;
        clone.damageInterval = this.damageInterval;
        clone.attackBehavior = this.attackBehavior;
        clone.attackCooldown = this.attackCooldown;
        clone.isAttacking = this.isAttacking;
        
        // Don't copy attack targets
        clone.attackTargets = new Set();
        
        return clone;
    }

    /**
     * Clean up resources when the component is destroyed
     */
    destroy() {
        this.attackTargets.clear();
        super.destroy();
    }
}