/**
 * Projectile Component
 * 
 * Stores projectile information for bullets.
 * Used for damage calculation and tracking source entity.
 */

import { Component } from '../component.js';

export class ProjectileComponent extends Component {
    /**
     * Create a new ProjectileComponent instance
     */
    constructor() {
        super('projectile');
        
        // Damage amount
        this.damage = 1;
        
        // Number of entities that can be affected by this projectile
        this.affectedEntities = 1;
        
        // Area of effect dimensions
        this.areaWidth = 10;  // Default small area
        this.areaHeight = 10;
        
        // Entity that fired this projectile
        this.sourceEntity = null;

        // grenade-specific properties
        this.isGrenade = false;
        this.grenadeType = null;
        this.slowFactor = 0;
        this.slowDuration = 0;

        this.gunType = null;
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {number} [data.damage=1] - Damage amount
     * @param {number} [data.affectedEntities=1] - Number of entities that can be affected
     * @param {number} [data.areaWidth=10] - Width of the area effect
     * @param {number} [data.areaHeight=10] - Height of the area effect
     * @param {Entity} [data.sourceEntity=null] - Entity that fired this projectile
     * @returns {ProjectileComponent} This component for method chaining
     */
    init(data = {}) {
        this.damage = data.damage !== undefined ? data.damage : 1;
        this.affectedEntities = data.affectedEntities !== undefined ? data.affectedEntities : 1;
        this.areaWidth = data.areaWidth !== undefined ? data.areaWidth : 10;
        this.areaHeight = data.areaHeight !== undefined ? data.areaHeight : 10;
        this.sourceEntity = data.sourceEntity || null;
        this.isGrenade = data.isGrenade || false;
        this.grenadeType = data.grenadeType || null;
        this.slowFactor = data.slowFactor || 0;
        this.slowDuration = data.slowDuration || 0;
        this.gunType = data.gunType || null;
        
        return this;
    }

    /**
     * Clone the component
     * @returns {ProjectileComponent} A new component instance with the same properties
     */
    clone() {
        const clone = super.clone();
        
        // Copy projectile-specific properties
        clone.damage = this.damage;
        clone.affectedEntities = this.affectedEntities;
        clone.areaWidth = this.areaWidth;
        clone.areaHeight = this.areaHeight;
        clone.sourceEntity = this.sourceEntity;
        clone.isGrenade = this.isGrenade;
        clone.grenadeType = this.grenadeType;
        clone.slowFactor = this.slowFactor;
        clone.slowDuration = this.slowDuration;
        clone.gunType = this.gunType;
        
        return clone;
    }

    /**
     * Clean up resources when the component is destroyed
     */
    destroy() {
        this.sourceEntity = null;
        super.destroy();
    }
}