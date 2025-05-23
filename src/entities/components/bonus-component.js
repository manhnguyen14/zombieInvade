/**
 * Bonus Component
 * 
 * Stores data about a bonus entity including its type, variant, lifetime,
 * and host entity (for embedded bonuses).
 */

import { Component } from '../component.js';

export class BonusComponent extends Component {
    /**
     * Create a new BonusComponent instance
     */
    constructor() {
        super('bonus');
        
        // Bonus type (e.g., 'soldier', 'weapon', 'grenade', 'gun')
        this.bonusType = null;
        
        // Bonus variant (e.g., 'standard', 'double')
        this.bonusVariant = null;
        
        // Lifetime in milliseconds
        this.lifetime = 8000; // Default 8 seconds
        
        // Time remaining in milliseconds
        this.timeRemaining = this.lifetime;
        
        // Host entity ID (for embedded bonuses)
        this.hostEntityId = null;
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {string} data.bonusType - Type of bonus (e.g., 'soldier', 'weapon', 'grenade', 'gun')
     * @param {string} data.bonusVariant - Variant of the bonus (e.g., 'standard', 'double')
     * @param {number} [data.lifetime=8000] - Lifetime in milliseconds
     * @param {string} [data.hostEntityId=null] - ID of the host entity (for embedded bonuses)
     * @returns {BonusComponent} This component for method chaining
     */
    init(data = {}) {
        this.bonusType = data.bonusType;
        this.bonusVariant = data.bonusVariant;
        this.lifetime = data.lifetime !== undefined ? data.lifetime : this.lifetime;
        this.timeRemaining = this.lifetime;
        this.hostEntityId = data.hostEntityId || null;
        
        return this;
    }

    /**
     * Reset the component to its default state
     * @returns {BonusComponent} This component for method chaining
     */
    reset() {
        this.bonusType = null;
        this.bonusVariant = null;
        this.lifetime = 8000;
        this.timeRemaining = this.lifetime;
        this.hostEntityId = null;
        
        return this;
    }

    /**
     * Clone the component
     * @returns {BonusComponent} A new component instance with the same properties
     */
    clone() {
        const clone = new BonusComponent();
        
        clone.bonusType = this.bonusType;
        clone.bonusVariant = this.bonusVariant;
        clone.lifetime = this.lifetime;
        clone.timeRemaining = this.timeRemaining;
        clone.hostEntityId = this.hostEntityId;
        
        return clone;
    }
}