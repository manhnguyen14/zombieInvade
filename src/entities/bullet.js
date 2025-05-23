/**
 * Bullet entity creation and configuration
 * Represents a bullet fired by a gun using pure ECS pattern
 */
import { TransformComponent } from './components/transform.js';
import { RenderComponent } from './components/render.js';
import { MovementComponent, MovementType } from './components/movement.js';
import { CollisionComponent, CollisionType } from './components/collision.js';
import { ProjectileComponent } from './components/projectile.js';

/**
 * Creates a bullet entity with all required components
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Bullet configuration
 * @returns {Entity} The created bullet entity
 */
export function createBulletEntity(entityManager, config) {
    if (!entityManager) {
        throw new Error('Entity manager is required');
    }

    // Create the entity
    const entity = entityManager.createEntity();
    
    if (!entity) {
        throw new Error('Failed to create bullet entity');
    }

    // Add transform component
    const transform = new TransformComponent();
    transform.init({
        x: config.x || 0,
        y: config.y || 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
    });
    entity.addComponent(transform);

    // Add render component
    const render = new RenderComponent();
    render.setAsRectangle(
        config.width || 5,
        config.height || 3,
        config.color || '#ffff00'
    );
    entity.addComponent(render);

    // Add movement component
    const movement = new MovementComponent();
    movement.init({
        movementType: MovementType.PROJECTILE,
        speed: config.speed || 400,
        directionX: 1 // Right direction
    });
    entity.addComponent(movement);

    // Add collision component
    const collision = new CollisionComponent();
    collision.init({
        collisionType: CollisionType.PROJECTILE,
        width: config.width || 5,
        height: config.height || 3
    });
    entity.addComponent(collision);

    // Add projectile component
    const projectile = new ProjectileComponent();
    projectile.init({
        damage: config.damage || 1,
        affectedEntities: config.affectedEntities || 1,
        areaWidth: config.areaWidth || 10,
        areaHeight: config.areaHeight || 10,
        sourceEntity: config.sourceEntity || null,
        gunType: config.gunType || null
    });
    entity.addComponent(projectile);

    // Add bullet tag
    entity.addTag('bullet');

    // Notify entity manager that the entity is fully initialized
    entityManager.notifyEntityAdded(entity);

    return entity;
}

/**
 * Factory function to create bullets based on gun type
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} gunComponent - The gun component containing bullet properties
 * @param {Entity} sourceEntity - The entity that fired the bullet
 * @param {Object} position - The position where the bullet should be created
 * @returns {Entity} The created bullet entity
 */
export function createBullet(entityManager, gunComponent, sourceEntity, position) {
    const config = {
        x: position.x,
        y: position.y,
        width: gunComponent.bulletWidth,
        height: gunComponent.bulletHeight,
        color: gunComponent.bulletColor,
        speed: gunComponent.bulletSpeed,
        damage: gunComponent.bulletDamage,
        affectedEntities: gunComponent.affectedEntities,
        areaWidth: gunComponent.areaWidth,
        areaHeight: gunComponent.areaHeight,
        sourceEntity: sourceEntity,
        gunType: gunComponent.gunType
    };

    return createBulletEntity(entityManager, config);
}
