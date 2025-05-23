/**
 * Medium Obstacle Class
 * 
 * Represents a medium-sized obstacle in the game.
 * Has medium health and movement speed.
 */

import { createObstacleEntity } from '../obstacle.js';

/**
 * Factory function to create a new medium obstacle entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Obstacle configuration
 * @returns {Entity} The created medium obstacle entity
 */
export function createMediumObstacleEntity(entityManager, config = {}) {
    // Set default properties for medium obstacles
    const mediumObstacleConfig = {
        ...config,
        type: 'medium',
        variant: config.variant || 'standard',
        health: config.health || 3,
        speed: config.speed || 30,
        width: config.width || 40,
        height: config.height || 40,
        color: config.color || '#34495e',
        impassable: false
    };
    const entity = createObstacleEntity(entityManager, mediumObstacleConfig);
    entity.addTag('mediumObstacle');

    return entity;
}

// Medium obstacle variants
export const MediumObstacleVariants = {
    // Standard medium obstacle
    Standard: {
        variant: 'standard',
        health: 3,
        speed: 30,
        color: '#34495e',
        weight: 6 // Standard weight for medium obstacles
    },

    // Car - slightly more health
    Car: {
        variant: 'car',
        health: 4,
        speed: 30,
        color: '#3498db',
        weight: 7 // Heavier due to more health
    },

    // Dumpster - can contain bonuses
    Dumpster: {
        variant: 'dumpster',
        health: 3,
        speed: 30,
        color: '#27ae60',
        weight: 6 // Standard weight
    },

    // Fence - less health but wider
    Fence: {
        variant: 'fence',
        health: 2,
        speed: 30,
        width: 60,
        height: 30,
        color: '#f39c12',
        weight: 5 // Lighter due to less health
    }
};
