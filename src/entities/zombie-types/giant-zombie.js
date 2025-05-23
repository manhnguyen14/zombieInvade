/**
 * Giant Zombie Class
 * 
 * Represents a giant zombie enemy in the game.
 * Has high health, can push obstacles, and has a wide attack.
 */

import { createEnemy } from '../enemy.js';

/**
 * Factory function to create a new giant zombie entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Zombie configuration
 * @returns {Entity} The created giant zombie entity
 */
export function createGiantZombieEntity(entityManager, config = {}) {
    // Set default properties for giant zombies
    const giantZombieConfig = {
        ...config,
        type: 'giant',
        variant: config.variant || 'standard',
        health: config.health || 8,
        speed: config.speed || 35,
        attackDamage: config.attackDamage || 2,
        attackRate: config.attackRate || 0.5,
        pointValue: config.pointValue || 50,
        width: config.width || 50,
        height: config.height || 50,
        color: config.color || '#8e44ad'
    };
    const entity = createEnemy(entityManager, giantZombieConfig);
    entity.addTag('giantZombie');
    entity.attackWidth = giantZombieConfig.attackWidth;
    return entity;
}

// Giant zombie variants
export const GiantZombieVariants = {
    // Standard giant zombie
    Standard: {
        variant: 'standard',
        health: 8,
        speed: 35,
        attackDamage: 2,
        attackRate: 0.5,
        reachWidth: 30,
        reachHeight: 30,
        pointValue: 50,
        color: '#8e44ad',
        weight: 8 // Standard weight for giant zombies
    },

    // Tank giant - more health but slower
    Tank: {
        variant: 'tank',
        health: 12,
        speed: 25,
        attackDamage: 2,
        attackRate: 0.4,
        reachWidth: 30,
        reachHeight: 30,
        pointValue: 75,
        color: '#9b59b6',
        weight: 12 // Heavier due to more health
    },

    // Berserker giant - less health but faster and more damage
    Berserker: {
        variant: 'berserker',
        health: 6,
        speed: 45,
        attackDamage: 3,
        attackRate: 0.6,
        reachWidth: 30,
        reachHeight: 30,
        pointValue: 60,
        color: '#e74c3c',
        weight: 6 // Lighter due to less health but still a giant
    },

    // Slow giant - very slow but very high health
    Slow: {
        variant: 'slow',
        health: 15,
        speed: 20,
        attackDamage: 2,
        attackRate: 0.3,
        reachWidth: 30,
        reachHeight: 30,
        pointValue: 100,
        color: '#2c3e50',
        weight: 15 // Very heavy due to very high health
    }
};
