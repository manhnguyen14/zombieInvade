/**
 * Enemy Base Class
 *
 * Base class for all enemy types in the game.
 * Provides common functionality for zombies.
 */

import { TransformComponent } from './components/transform.js';
import { LaneComponent } from './components/lane.js';
import { RenderComponent } from './components/render.js';
import { MovementComponent, MovementType } from './components/movement.js';
import { CollisionComponent, CollisionType } from './components/collision.js';
import { HealthComponent } from './components/health.js';
import { DamageComponent, DamageType, AttackBehavior } from './components/damage.js';
import { Entity } from './entity.js';

/**
 * Factory function to create a new enemy entity with components
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Enemy configuration
 * @returns {Entity} The created enemy entity
 */
export function createEnemy(entityManager, config = {}) {
    if (!entityManager) {
        throw new Error('createEnemy requires an entity manager');
    }

    // Create the enemy entity
    const entity = entityManager.createEntity();
    entity.addTag('enemy');

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

    // Add render component with sprite configuration
    const render = new RenderComponent(entity, {
        entityType: 'zombie',
        entitySubtype: config.type || 'normal',
        entityState: 'walking',
        entityVariant: config.variant || 'normal',
        width: config.width || 40,
        height: config.height || 40
    });
    entity.addComponent(render);

    // Add movement component
    const movement = new MovementComponent();
    movement.init({
        type: MovementType.ENEMY,
        speed: config.speed || 50,
        directionX: 0,
        directionY: 0,
        weight: config.weight || 1
    });
    entity.addComponent(movement);

    // Add collision component
    const collision = new CollisionComponent();
    collision.type = 'collision';
    collision.init({
        width: config.width || 30,
        height: config.height || 30
    });
    collision.collisionType = CollisionType.ENEMY;
    collision.setCanStack(true);
    collision.setCanPush(true);
    collision.setCanBePushed(true);
    entity.addComponent(collision);

    // Add health component
    const health = new HealthComponent();
    health.init({
        maxHealth: config.health || 1,
        currentHealth: config.health || 1,
        deathTimer: config.deathTimer || 0.5
    });
    entity.addComponent(health);

    // Add damage component
    const damage = new DamageComponent();
    let damageConfig = {
        damageType: DamageType.ENEMY_TO_SOLDIER,
        damageAmount: config.attackDamage || 1,
        reachWidth: config.reachWidth || 20,
        reachHeight: config.reachHeight || 20,
        affectedEntities: config.affectedEntities || 1,
        damageInterval: config.attackInterval || 1.0,
        attackBehavior: AttackBehavior.STOP
    };
    damage.init(damageConfig);
    entity.addComponent(damage);

    // Notify that the entity is fully initialized with all components
    entityManager.notifyEntityAdded(entity);

    return entity;
}
