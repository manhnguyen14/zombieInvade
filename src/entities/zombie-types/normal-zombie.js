/**
 * Normal Zombie Class
 * 
 * Represents a basic zombie enemy in the game.
 * Has low health and standard threat level.
 */

import { createEnemy } from '../enemy.js';

/**
 * Factory function to create a new normal zombie entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Zombie configuration
 * @returns {Entity} The created normal zombie entity
 */
export function createNormalZombieEntity(entityManager, config = {}) {
    // Set default properties for normal zombies
    const normalZombieConfig = {
        ...config,
        type: 'normal',
        variant: config.variant || 'standard',
        health: config.health || 1,
        speed: config.speed || 50,
        attackDamage: config.attackDamage || 1,
        attackRate: config.attackRate || 1,
        pointValue: config.pointValue || 10,
        width: config.width || 30,
        height: config.height || 30,
        color: config.color || '#e74c3c'
    };
    const entity = createEnemy(entityManager, normalZombieConfig);
    entity.addTag('normalZombie');
    return entity;
}

// Normal zombie variants
export const NormalZombieVariants = {
    // Standard normal zombie
    Standard: {
        variant: 'standard',
        health: 1,
        speed: 50,
        attackDamage: 1,
        attackRate: 1,
        pointValue: 10,
        color: '#e74c3c',
        weight: 2 // Standard weight for normal zombies
    },

    // Crawler - slower but more health
    Crawler: {
        variant: 'crawler',
        health: 2,
        speed: 30,
        attackDamage: 1,
        attackRate: 0.8,
        pointValue: 15,
        color: '#c0392b',
        weight: 3 // Heavier due to more health
    },

    // Runner - faster but less health
    Runner: {
        variant: 'runner',
        health: 1,
        speed: 80,
        attackDamage: 1,
        attackRate: 1.2,
        pointValue: 20,
        color: '#e67e22',
        weight: 1 // Lighter due to speed
    }
};
