/**
 * Armored Zombie Class
 * 
 * Represents an armored zombie enemy in the game.
 * Has medium health, armor, and increased threat level.
 */

import { createEnemy } from '../enemy.js';
import { Entity } from '../entity.js';
/**
 * Factory function to create a new armored zombie entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Zombie configuration
 * @returns {Entity} The created armored zombie entity
 */
export function createArmoredZombieEntity(entityManager, config = {}) {
    // Set default properties for armored zombies
    const armoredZombieConfig = {
        ...config,
        type: 'armored',
        variant: config.variant || 'standard',
        health: config.health || 3,
        speed: config.speed || 40,
        attackDamage: config.attackDamage || 1,
        attackRate: config.attackRate || 0.8,
        pointValue: config.pointValue || 25,
        width: config.width || 30,
        height: config.height || 30,
        color: config.color || '#34495e',
        armor: config.armor || 1
    };
    const entity = createEnemy(entityManager, armoredZombieConfig);
    entity.addTag('armoredZombie');
    // Set armor value on health component
    const health = entity.getComponent('health');
    if (health) {
        health.setArmor(armoredZombieConfig.armor);
    }
    return entity;
}

// Armored zombie variants
export const ArmoredZombieVariants = {
    // Standard armored zombie
    Standard: {
        variant: 'standard',
        health: 3,
        armor: 1,
        speed: 40,
        attackDamage: 1,
        attackRate: 0.8,
        pointValue: 25,
        color: '#34495e',
        weight: 4 // Standard weight for armored zombies
    },

    // Heavy armor - more health and armor but slower
    HeavyArmor: {
        variant: 'heavyArmor',
        health: 5,
        armor: 2,
        speed: 30,
        attackDamage: 1,
        attackRate: 0.6,
        pointValue: 35,
        color: '#2c3e50',
        weight: 6 // Heavier due to more armor and health
    },

    // Partial armor - less armor but faster
    PartialArmor: {
        variant: 'partialArmor',
        health: 2,
        armor: 1,
        speed: 50,
        attackDamage: 1,
        attackRate: 1,
        pointValue: 20,
        color: '#7f8c8d',
        weight: 3 // Lighter due to less armor
    }
};
