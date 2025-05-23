/**
 * Player
 *
 * Represents the player team in the game.
 * Manages a collection of soldiers and handles team-level logic.
 */

import { Entity } from './entity.js';
import { TransformComponent } from './components/transform.js';
import { LaneComponent } from './components/lane.js';
import { RenderComponent } from './components/render.js';
import { MovementComponent, MovementType } from './components/movement.js';
import { CollisionComponent, CollisionType } from './components/collision.js';
import { GunComponent, GunType } from './components/gun.js';
import { PlayerComponent } from './components/player-component.js';

// Define grenade types
export const GrenadeType = {
    STANDARD: 'standard',
    STICKY: 'sticky'
};

/**
 * Factory function to create a new player entity with components
 * @param {EntityManager} entityManager - The entity manager
 * @returns {Entity} The created player entity
 */
export function createPlayerEntity(entityManager) {
    if (!entityManager) {
        throw new Error('createPlayerEntity requires an entity manager');
    }

    // Create the player entity
    const entity = entityManager.createEntity();
    entity.addTag('player');

    // Add transform component
    const transform = new TransformComponent();
    transform.init({
        x: 100,
        y: 0
    });
    entity.addComponent(transform);

    // Add lane component
    const lane = new LaneComponent();
    lane.init({
        laneIndex: 4
    });
    entity.addComponent(lane);

    // Add render component with sprite configuration
    const render = new RenderComponent();
    render.entityType = 'player';
    render.frameDuration = 0.2; // Animation speed (seconds per frame)
    render.initSpriteConfig(); // Initialize sprite configuration
    entity.addComponent(render);

    // Add movement component
    const movement = new MovementComponent();
    movement.init({
        type: MovementType.PLAYER,
        speed: 200
    });
    entity.addComponent(movement);

    // Add collision component
    const collision = new CollisionComponent();
    collision.init({
        collisionType: CollisionType.PLAYER,
        width: 40,
        height: 40
    });
    entity.addComponent(collision);

    // Add gun component
    const gun = new GunComponent();
    gun.init({
        gunType: GunType.GLOCK_17
    });
    entity.addComponent(gun);

    // Add player data component
    const playerComponent = new PlayerComponent();
    entity.addComponent(playerComponent);

    // Notify that the entity is fully initialized with all components
    entityManager.notifyEntityAdded(entity);

    return entity;
}
