/**
 * Health Component
 * 
 * Stores health information for an entity.
 * Used for damage, healing, and death handling.
 */

import { Component } from '../component.js';

export class HealthComponent extends Component {
    /**
     * Create a new HealthComponent instance
     */
    constructor() {
        super('health');
        
        // Current health points
        this.currentHealth = 1;
        
        // Maximum health points
        this.maxHealth = 1;
        
        // Whether the entity is invulnerable
        this.invulnerable = false;
        
        // Whether the entity is dead
        this.isDead = false;

        // dead timer
        this.deathTimer = 0;
        
        // Armor value (damage reduction)
        this.armor = 0;
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {number} [data.currentHealth=1] - Current health points
     * @param {number} [data.maxHealth=1] - Maximum health points
     * @param {boolean} [data.invulnerable=false] - Whether the entity is invulnerable
     * @param {number} [data.armor=0] - Armor value (damage reduction)
     * @param {number} [data.deathTimer=0] - Death timer
     * @returns {HealthComponent} This component for method chaining
     */
    init(data = {}) {
        this.maxHealth = data.maxHealth !== undefined ? data.maxHealth : 1;
        this.currentHealth = data.currentHealth !== undefined ? data.currentHealth : this.maxHealth;
        this.invulnerable = data.invulnerable !== undefined ? data.invulnerable : false;
        this.armor = data.armor !== undefined ? data.armor : 0;
        this.isDead = this.currentHealth <= 0;
        this.deathTimer = data.deathTimer !== undefined ? data.deathTimer : 0;
        
        return this;
    }

    /**
     * Reset the component to its default state
     * @returns {HealthComponent} This component for method chaining
     */
    reset() {
        this.currentHealth = this.maxHealth;
        this.isDead = false;
        
        return this;
    }

    /**
     * Take damage
     * @param {number} amount - Amount of damage to take
     * @returns {number} Actual damage taken
     */
    takeDamage(amount) {
        // No damage if invulnerable or already dead
        if (this.invulnerable || this.isDead) {
            return 0;
        }
        
        // Calculate actual damage after armor reduction
        const actualDamage = Math.max(1, amount - this.armor);
        
        // Reduce health
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        
        // Check for death
        if (this.currentHealth <= 0) {
            this.isDead = true;
        }
        
        return actualDamage;
    }

    /**
     * Heal the entity
     * @param {number} amount - Amount of health to restore
     * @returns {number} Actual amount healed
     */
    heal(amount) {
        // No healing if dead
        if (this.isDead) {
            return 0;
        }
        
        // Calculate actual healing
        const previousHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        
        return this.currentHealth - previousHealth;
    }

    /**
     * Set the entity's maximum health
     * @param {number} maxHealth - New maximum health
     * @param {boolean} [healToFull=false] - Whether to heal to full health
     * @returns {HealthComponent} This component for method chaining
     */
    setMaxHealth(maxHealth, healToFull = false) {
        this.maxHealth = Math.max(1, maxHealth);
        
        // Ensure current health doesn't exceed maximum
        this.currentHealth = Math.min(this.currentHealth, this.maxHealth);
        
        // Heal to full if requested
        if (healToFull) {
            this.currentHealth = this.maxHealth;
        }
        
        return this;
    }

    /**
     * Set the entity's armor value
     * @param {number} armor - New armor value
     * @returns {HealthComponent} This component for method chaining
     */
    setArmor(armor) {
        this.armor = Math.max(0, armor);
        return this;
    }

    /**
     * Make the entity invulnerable or vulnerable
     * @param {boolean} invulnerable - Whether the entity should be invulnerable
     * @returns {HealthComponent} This component for method chaining
     */
    setInvulnerable(invulnerable) {
        this.invulnerable = invulnerable;
        return this;
    }

    /**
     * Kill the entity immediately
     * @returns {HealthComponent} This component for method chaining
     */
    kill() {
        if (!this.invulnerable) {
            this.currentHealth = 0;
            this.isDead = true;
        }
        
        return this;
    }

    /**
     * Revive the entity with specified health
     * @param {number} [health] - Health to revive with (defaults to max health)
     * @returns {HealthComponent} This component for method chaining
     */
    revive(health) {
        this.isDead = false;
        this.currentHealth = health !== undefined ? Math.min(health, this.maxHealth) : this.maxHealth;
        
        return this;
    }

    /**
     * Get the current health percentage
     * @returns {number} Health percentage (0-1)
     */
    getHealthPercentage() {
        return this.maxHealth > 0 ? this.currentHealth / this.maxHealth : 0;
    }

    /**
     * Check if the entity is alive
     * @returns {boolean} True if the entity is alive, false if dead
     */
    isAlive() {
        return !this.isDead;
    }

    /**
     * update death timer with deltaTime
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    updateDeathTimer(deltaTime) {
        if (this.isDead) {
            this.deathTimer -= deltaTime;
        }
    }

    /**
     * Clone the component
     * @returns {HealthComponent} A new component instance with the same properties
     */
    clone() {
        const clone = super.clone();
        
        // Copy health-specific properties
        clone.currentHealth = this.currentHealth;
        clone.maxHealth = this.maxHealth;
        clone.invulnerable = this.invulnerable;
        clone.isDead = this.isDead;
        clone.armor = this.armor;
        
        return clone;
    }
}
