/**
 * Obstacle Base Class
 *
 * Base class for all obstacle types in the game.
 * Provides common functionality for obstacles.
 */

import { TransformComponent } from './components/transform.js';
import { LaneComponent } from './components/lane.js';
import { RenderComponent } from './components/render.js';
import { MovementComponent, MovementType } from './components/movement.js';
import { CollisionComponent, CollisionType } from './components/collision.js';
import { HealthComponent } from './components/health.js';
import { DamageComponent, DamageType, AttackBehavior } from './components/damage.js';

/**
 * Factory function to create a new obstacle entity with components
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Obstacle configuration
 * @returns {Entity} The created obstacle entity
 */
export function createObstacleEntity(entityManager, config = {}) {
    if (!entityManager) {
        throw new Error('createObstacleEntity requires an entity manager');
    }

    // Create the obstacle entity
    const entity = entityManager.createEntity();
    entity.addTag('obstacle');

    // Add transform component
    const transform = new TransformComponent();
    transform.init({
        x: config.x || 800,
        y: config.y || 0
    });
    entity.addComponent(transform);

    // Add lane component
    const lane = new LaneComponent();
    lane.init({
        laneIndex: config.laneIndex || 1
    });
    entity.addComponent(lane);

    // Add render component
    const render = new RenderComponent(entity, {
        entityType: 'obstacle',
        entitySubtype: config.type || 'small', // small, medium, large, or hazard
        entityVariant: config.variant || 'standard'
    });
    entity.addComponent(render);

    // Add movement component
    const movement = new MovementComponent();
    movement.init({
        type: MovementType.OBSTACLE,
        speed: config.speed || 0,
        directionX: 0,
        directionY: 0,
        weight: config.weight || 5
    });
    entity.addComponent(movement);

    // Add collision component
    const collision = new CollisionComponent();
    collision.type = 'collision';
    collision.init({
        width: config.width || 30,
        height: config.height || 30,
        projectilesPassThrough: config.projectilesPassThrough || false
    });
    collision.collisionType = CollisionType.OBSTACLE;
    collision.setCanStack(false);
    collision.setCanPush(true);
    collision.setCanBePushed(true);
    entity.addComponent(collision);

    // Add health component
    const health = new HealthComponent();
    health.init({
        maxHealth: config.health || 1,
        currentHealth: config.health || 1
    });
    entity.addComponent(health);

    // Add damage component
    const damage = new DamageComponent();
    let damageConfig = {
        damageType: DamageType.ENEMY_TO_SOLDIER,
        damageAmount: config.damageAmount || 3,
        reachWidth: config.reachWidth || 50,
        reachHeight: config.reachHeight || 50,
        affectedEntities: config.affectedEntities || 3,
        damageInterval: config.damageInterval || 0.4,
        attackBehavior: AttackBehavior.CONTINUE
    };
    damage.init(damageConfig);
    entity.addComponent(damage);

    // Store extra ECS-style data on the entity if needed
    entity.type = config.type || 'small';
    entity.variant = config.variant || 'standard';
    entity.impassable = config.impassable || false;

    // Notify that the entity is fully initialized with all components
    entityManager.notifyEntityAdded(entity);

    return entity;
}
