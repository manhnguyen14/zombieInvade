/**
 * Damage Area Component
 * 
 * Stores damage area information and tracks damaged entities.
 * Used for creating temporary damage areas that can affect multiple entities.
 */

import { Component } from '../component.js';
import { DamageType } from './damage.js';

export class DamageAreaComponent extends Component {
    /**
     * Create a new DamageAreaComponent instance
     */
    constructor() {
        super('damageArea');
        
        // Damage type
        this.damageType = DamageType.NONE;
        
        // Damage amount
        this.damageAmount = 1;
        
        // Number of entities that can be affected
        this.affectedEntities = 1;
        
        // Source entity that created this damage area
        this.sourceEntity = null;
        
        // Lifetime of the damage area in seconds
        this.lifetime = 0.2;
        
        // Remaining time
        this.remainingTime = 0.2;

        //gun type
        this.gunType = null;

        // Set of entity IDs that have been damaged
        this.damagedEntityIds = new Set();

        // Whether the damage area is a grenade
        this.isGrenade = false;
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {string} [data.damageType=DamageType.NONE] - Damage type
     * @param {number} [data.damageAmount=1] - Damage amount
     * @param {number} [data.affectedEntities=1] - Number of affected entities
     * @param {Entity} [data.sourceEntity=null] - Source entity
     * @param {number} [data.lifetime=0.2] - Lifetime in seconds
     * @returns {DamageAreaComponent} This component for method chaining
     */
    init(data = {}) {
        this.damageType = data.damageType !== undefined ? data.damageType : DamageType.NONE;
        this.damageAmount = data.damageAmount !== undefined ? data.damageAmount : 1;
        this.affectedEntities = data.affectedEntities !== undefined ? data.affectedEntities : 1;
        this.sourceEntity = data.sourceEntity || null;
        this.lifetime = data.lifetime !== undefined ? data.lifetime : 0.2;
        this.remainingTime = this.lifetime;
        this.damagedEntityIds.clear();
        this.gunType = data.gunType || null;
        this.isGrenade = data.isGrenade || false;
        
        return this;
    }

    /**
     * Update the damage area
     * @param {number} deltaTime - Time elapsed since last update in seconds
     * @returns {boolean} True if the damage area is still active, false if it should be removed
     */
    update(deltaTime) {
        this.remainingTime -= deltaTime;
        return this.remainingTime > 0;
    }

    /**
     * Check if an entity has been damaged
     * @param {Entity} entity - The entity to check
     * @returns {boolean} True if the entity has been damaged, false otherwise
     */
    hasDamagedEntity(entity) {
        return this.damagedEntityIds.has(entity.id);
    }

    /**
     * Add an entity to the damaged entities set
     * @param {Entity} entity - The entity to add
     */
    addDamagedEntity(entity) {
        this.damagedEntityIds.add(entity.id);
    }

    /**
     * Check if the damage area can damage more entities
     * @returns {boolean} True if the area can damage more entities, false otherwise
     */
    canDamageMoreEntities() {
        return this.damagedEntityIds.size < this.affectedEntities;
    }

    /**
     * Clean up resources when the component is destroyed
     */
    destroy() {
        this.sourceEntity = null;
        this.damagedEntityIds.clear();
    }
} 