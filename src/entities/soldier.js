/**
 * Soldier Class
 *
 * Represents an individual soldier in the player's team.
 * Handles soldier-specific behavior and properties.
 */

import { Entity } from './entity.js';
import { TransformComponent } from './components/transform.js';
import { RenderComponent } from './components/render.js';
import { CollisionComponent, CollisionType } from './components/collision.js';
import { HealthComponent } from './components/health.js';
import { LaneComponent } from './components/lane.js';
import { GunComponent, GunType } from './components/gun.js';
import { Component } from './component.js';

/**
 * Create a soldier entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Configuration for the soldier
 * @returns {Entity} The created soldier entity
 */
export function createSoldierEntity(entityManager, config = {}) {
    if (!entityManager) {
        throw new Error('createSoldierEntity requires an entity manager');
    }

    // Create the soldier entity
    const entity = entityManager.createEntity();
    entity.addTag('soldier');

    // Add transform component
    const transform = new TransformComponent();
    transform.init({
        x: config.x || 0,
        y: config.y || 0
    });
    entity.addComponent(transform);

    // Add render component with sprite configuration
    const render = new RenderComponent();
    render.entityType = 'soldier';
    render.frameDuration = 0.3; // Animation speed (seconds per frame)
    render.initSpriteConfig(); // Initialize sprite configuration
    entity.addComponent(render);

    // Add collision component
    const collision = new CollisionComponent();
    collision.init({
        collisionType: CollisionType.SOLDIER,
        width: 20,
        height: 20
    });
    entity.addComponent(collision);

    // Add health component
    const health = new HealthComponent();
    health.init({
        maxHealth: config.health || 1,
        currentHealth: config.health || 1
    });
    entity.addComponent(health);

    // Add lane component if a lane index is provided
    if (config.laneIndex !== undefined) {
        const lane = new LaneComponent();
        lane.init({
            laneIndex: config.laneIndex
        });
        entity.addComponent(lane);
    }

    // Add gun component
    const gun = new GunComponent();
    gun.init({
        gunType: config.gunType || GunType.GLOCK_17
    });
    entity.addComponent(gun);

    // Optionally store assigned position/lane as properties on the entity
    entity.assignedLane = config.laneIndex !== undefined ? config.laneIndex : null;
    entity.assignedPosition = config.position || 'middle';

    // Notify that the entity is fully initialized with all components
    entityManager.notifyEntityAdded(entity);

    return entity;
}
