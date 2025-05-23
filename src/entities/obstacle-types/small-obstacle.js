/**
 * Small Obstacle Class
 * 
 * Represents a small obstacle in the game.
 * Has low health but fast movement speed.
 */

import { createObstacleEntity } from '../obstacle.js';

/**
 * Factory function to create a new small obstacle entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Obstacle configuration
 * @returns {Entity} The created small obstacle entity
 */
export function createSmallObstacleEntity(entityManager, config = {}) {
    // Set default properties for small obstacles
    const smallObstacleConfig = {
        ...config,
        type: 'small',
        variant: config.variant || 'standard',
        health: config.health || 1,
        speed: config.speed || 40,
        width: config.width || 30,
        height: config.height || 30,
        color: config.color || '#7f8c8d',
        impassable: false
    };
    const entity = createObstacleEntity(entityManager, smallObstacleConfig);
    entity.addTag('smallObstacle');

    return entity;
}

// Small obstacle variants
export const SmallObstacleVariants = {
    // Standard small obstacle
    Standard: {
        variant: 'standard',
        health: 1,
        speed: 40,
        color: '#7f8c8d',
        weight: 3 // Standard weight for small obstacles
    },

    // Barricade - slightly more health
    Barricade: {
        variant: 'barricade',
        health: 2,
        speed: 40,
        color: '#95a5a6',
        weight: 4 // Slightly heavier due to more health
    },

    // Crate - can contain bonuses
    Crate: {
        variant: 'crate',
        health: 1,
        speed: 40,
        color: '#d35400',
        weight: 3 // Standard weight
    },

    // Trash Can - faster but less health
    TrashCan: {
        variant: 'trashCan',
        health: 1,
        speed: 50,
        color: '#16a085',
        weight: 2 // Lighter due to faster speed
    }
};
