/**
 * Impassable Hazard Class
 *
 * Represents an impassable hazard in the game.
 * Cannot be destroyed and blocks zombies.
 */

import { createObstacleEntity } from '../obstacle.js';
import { CollisionType } from '../components/collision.js';

/**
 * Factory function to create a new impassable hazard entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Hazard configuration
 * @returns {Entity} The created impassable hazard entity
 */
export function createImpassableHazardEntity(entityManager, config = {}) {
    // Set default properties for impassable hazards
    const hazardConfig = {
        ...config,
        type: 'hazard',
        variant: config.variant || 'standard',
        health: 999999,
        speed: config.speed !== undefined ? config.speed : 0,
        width: config.width || 40,
        height: config.height || 40,
        color: config.color || '#000000',
        impassable: true,
        projectilesPassThrough: true
    };
    const entity = createObstacleEntity(entityManager, hazardConfig);
    entity.addTag('hazard');
    // Make health component invulnerable
    const health = entity.getComponent('health');
    if (health) {
        health.setInvulnerable(true);
    }


    return entity;
}

// Impassable hazard variants
export const ImpassableHazardVariants = {
    // Standard
    Standard: {
        variant: 'standard',
        speed: 0,
        color: '#000000',
        weight: 9999 // Extremely high weight as it's impassable
    },
    // Hole in the ground
    Hole: {
        variant: 'hole',
        speed: 0,
        color: '#000000',
        weight: 9999 // Extremely high weight as it's impassable
    },

    // Spike pit
    Spikes: {
        variant: 'spikes',
        speed: 0,
        color: '#7f8c8d',
        weight: 9999 // Extremely high weight as it's impassable
    },

    // Fire
    Fire: {
        variant: 'fire',
        speed: 0,
        color: '#e74c3c',
        weight: 9999 // Extremely high weight as it's impassable
    },

    // Toxic waste
    Toxic: {
        variant: 'toxic',
        speed: 0,
        color: '#2ecc71',
        weight: 9999 // Extremely high weight as it's impassable
    }
};
