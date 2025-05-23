/**
 * Large Obstacle Class
 * 
 * Represents a large obstacle in the game.
 * Has high health but slow movement speed.
 */

import { createObstacleEntity } from '../obstacle.js';

/**
 * Factory function to create a new large obstacle entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Obstacle configuration
 * @returns {Entity} The created large obstacle entity
 */
export function createLargeObstacleEntity(entityManager, config = {}) {
    // Set default properties for large obstacles
    const largeObstacleConfig = {
        ...config,
        type: 'large',
        variant: config.variant || 'standard',
        health: config.health || 6,
        speed: config.speed || 20,
        width: config.width || 60,
        height: config.height || 60,
        color: config.color || '#2c3e50',
        impassable: false
    };
    const entity = createObstacleEntity(entityManager, largeObstacleConfig);
    entity.addTag('largeObstacle');

    return entity;
}

// Large obstacle variants
export const LargeObstacleVariants = {
    // Standard large obstacle
    Standard: {
        variant: 'standard',
        health: 6,
        speed: 20,
        color: '#2c3e50',
        weight: 10 // Standard weight for large obstacles
    },

    // Bus - very high health
    Bus: {
        variant: 'bus',
        health: 8,
        speed: 15,
        width: 80,
        height: 60,
        color: '#f1c40f',
        weight: 14 // Heavier due to more health and size
    },

    // Truck - can contain bonuses
    Truck: {
        variant: 'truck',
        health: 6,
        speed: 20,
        width: 70,
        height: 50,
        color: '#e74c3c',
        weight: 10 // Standard weight
    },

    // Wall - very high health but very slow
    Wall: {
        variant: 'wall',
        health: 10,
        speed: 10,
        width: 50,
        height: 70,
        color: '#95a5a6',
        weight: 18 // Very heavy due to very high health
    }
};
