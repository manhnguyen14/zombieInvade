/**
 * Gun Component
 * 
 * Defines a gun that can be equipped by entities.
 * Manages gun type, load speed, and bullet type.
 */

import { Component } from '../component.js';

// Gun types
export const GunType = {
    NONE: 'none',
    GLOCK_17: 'glock_17',
    DESERT_EAGLE: 'desert_eagle',
    BENELLI_M4: 'benelli_m4',
    AK47: 'ak47',
    BARRETT_XM109: 'barrett_xm109'
};

// Default gun configurations
export const GunConfigs = {
    [GunType.NONE]: {
        bulletType: 'none',
        loadSpeed: 0,
        damage: 0,
        bulletSpeed: 0,
        bulletWidth: 0,
        bulletHeight: 0,
        affectedEntities: 0,
        areaWidth: 0,
        areaHeight: 0,
        color: '#ffffff'
    },
    [GunType.GLOCK_17]: {
        bulletType: 'small',
        loadSpeed: 0.5, // 2 bullets per second
        damage: 1,
        bulletSpeed: 400,
        bulletWidth: 5,
        bulletHeight: 2,
        affectedEntities: 1,
        areaWidth: 32,  // Small area effect
        areaHeight: 16,
        color: '#ffff00' // Yellow
    },
    [GunType.DESERT_EAGLE]: {
        bulletType: 'medium',
        loadSpeed: 0.8, // 1.25 bullets per second
        damage: 2,
        bulletSpeed: 500,
        bulletWidth: 8,
        bulletHeight: 4,
        affectedEntities: 1,
        areaWidth: 40,  // Medium area effect
        areaHeight: 16,
        color: '#ffa500' // Orange
    },
    [GunType.BENELLI_M4]: {
        bulletType: 'shotgun',
        loadSpeed: 1.0, // 1 bullet per second
        damage: 1,
        bulletSpeed: 350,
        bulletWidth: 10,
        bulletHeight: 10,
        affectedEntities: 3, // Can hit multiple enemies
        areaWidth: 40,  // Large area effect (shotgun spread)
        areaHeight: 84,
        color: '#ff0000' // Red
    },
    [GunType.AK47]: {
        bulletType: 'rifle',
        loadSpeed: 0.2, // 5 bullets per second
        damage: 1,
        bulletSpeed: 600,
        bulletWidth: 6,
        bulletHeight: 3,
        affectedEntities: 1,
        areaWidth: 40,  // Small-medium area effect
        areaHeight: 16,
        color: '#00ff00' // Green
    },
    [GunType.BARRETT_XM109]: {
        bulletType: 'sniper',
        loadSpeed: 1.5, // 0.67 bullets per second
        damage: 5,
        bulletSpeed: 800,
        bulletWidth: 12,
        bulletHeight: 5,
        affectedEntities: 4, // Can penetrate and hit multiple enemies
        areaWidth: 80,  // Medium-large area effect
        areaHeight: 16,
        color: '#0000ff' // Blue
    }
};

export class GunComponent extends Component {
    /**
     * Create a new GunComponent instance
     */
    constructor() {
        super('gun');
        
        // Gun type
        this.gunType = GunType.GLOCK_17; // Default gun
        
        // Load speed (time between shots in seconds)
        this.loadSpeed = GunConfigs[GunType.GLOCK_17].loadSpeed;
        
        // Bullet type
        this.bulletType = GunConfigs[GunType.GLOCK_17].bulletType;
        
        // Bullet properties
        this.bulletDamage = GunConfigs[GunType.GLOCK_17].damage;
        this.bulletSpeed = GunConfigs[GunType.GLOCK_17].bulletSpeed;
        this.bulletWidth = GunConfigs[GunType.GLOCK_17].bulletWidth;
        this.bulletHeight = GunConfigs[GunType.GLOCK_17].bulletHeight;
        this.affectedEntities = GunConfigs[GunType.GLOCK_17].affectedEntities;
        this.areaWidth = GunConfigs[GunType.GLOCK_17].areaWidth;
        this.areaHeight = GunConfigs[GunType.GLOCK_17].areaHeight;
        this.bulletColor = GunConfigs[GunType.GLOCK_17].color;
        
        // Cooldown timer
        this.cooldown = 0;
        
        // Whether the gun is enabled
        this.enabled = true;
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {string} [data.gunType=GunType.GLOCK_17] - Gun type
     * @returns {GunComponent} This component for method chaining
     */
    init(data = {}) {
        this.setGunType(data.gunType || GunType.GLOCK_17);
        this.enabled = data.enabled !== undefined ? data.enabled : true;
        
        return this;
    }

    /**
     * Set the gun type and update properties accordingly
     * @param {string} gunType - Gun type
     * @returns {GunComponent} This component for method chaining
     */
    setGunType(gunType) {
        if (!GunConfigs[gunType]) {
            console.warn(`Unknown gun type: ${gunType}, defaulting to GLOCK_17`);
            gunType = GunType.GLOCK_17;
        }
        
        this.gunType = gunType;
        const config = GunConfigs[gunType];
        
        this.loadSpeed = config.loadSpeed;
        this.bulletType = config.bulletType;
        this.bulletDamage = config.damage;
        this.bulletSpeed = config.bulletSpeed;
        this.bulletWidth = config.bulletWidth;
        this.bulletHeight = config.bulletHeight;
        this.affectedEntities = config.affectedEntities;
        this.areaWidth = config.areaWidth;
        this.areaHeight = config.areaHeight;
        this.bulletColor = config.color;
        
        return this;
    }

    /**
     * Update the cooldown
     * @param {number} deltaTime - Time elapsed since last update in seconds
     * @returns {boolean} True if the cooldown is complete, false otherwise
     */
    updateCooldown(deltaTime) {
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }
        
        if (this.cooldown <= 0) {
            this.cooldown = 0;
            return true;
        }
        
        return false;
    }

    /**
     * Reset the cooldown
     * @returns {GunComponent} This component for method chaining
     */
    resetCooldown() {
        this.cooldown = this.loadSpeed;
        return this;
    }

    /**
     * Check if the gun can shoot (cooldown is complete)
     * @returns {boolean} True if the gun can shoot, false otherwise
     */
    canShoot() {
        return this.enabled && this.cooldown <= 0;
    }

    /**
     * Clone the component
     * @returns {GunComponent} A new component instance with the same properties
     */
    clone() {
        const clone = super.clone();
        
        // Copy gun-specific properties
        clone.gunType = this.gunType;
        clone.loadSpeed = this.loadSpeed;
        clone.bulletType = this.bulletType;
        clone.bulletDamage = this.bulletDamage;
        clone.bulletSpeed = this.bulletSpeed;
        clone.bulletWidth = this.bulletWidth;
        clone.bulletHeight = this.bulletHeight;
        clone.affectedEntities = this.affectedEntities;
        clone.areaWidth = this.areaWidth;
        clone.areaHeight = this.areaHeight;
        clone.bulletColor = this.bulletColor;
        clone.cooldown = this.cooldown;
        clone.enabled = this.enabled;
        
        return clone;
    }
}