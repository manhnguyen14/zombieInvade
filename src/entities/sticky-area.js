/**
 * Sticky Area Factory
 *
 * Creates temporary area entities that slow enemies and obstacles.
 * Created by sticky grenades.
 */

import { TransformComponent } from './components/transform.js';
import { RenderComponent } from './components/render.js';
import { MovementComponent, MovementType } from './components/movement.js';
import { CollisionComponent, CollisionType } from './components/collision.js';
import { EffectComponent, EffectType } from './components/effect.js';

/**
 * Create a new sticky area entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Sticky area configuration
 * @returns {Entity} The sticky area entity
 */
export function createStickyArea(entityManager, config = {}) {
    if (!entityManager) {
        throw new Error('StickyArea requires an entity manager');
    }

    // Create the sticky area entity
    const entity = entityManager.createEntity();

    // Add sticky area tag
    entity.addTag('stickyArea');

    // Add transform component
    const transform = new TransformComponent();
    transform.init({
        x: config.x || 0,
        y: config.y || 0
    });
    entity.addComponent(transform);

    // Add render component
    const render = new RenderComponent();
    render.entityType = 'stickyArea';
    render.initSpriteConfig();
    entity.addComponent(render);

    // Add movement component with zero speed (will move with game speed)
    const movement = new MovementComponent();
    movement.init({
        type: MovementType.OBSTACLE, // Use obstacle movement type to move with game speed
        speed: 0, // Zero innate speed
        directionX: -1, // Move left
        directionY: 0
    });
    entity.addComponent(movement);

    // Add collision component
    const collision = new CollisionComponent();
    collision.init({
        width: config.width || 100,
        height: config.height || 100
    });
    collision.collisionType = CollisionType.EFFECT_AREA;

    // Set collision behavior
    collision.setCanStack(true); // Can stack with other entities
    collision.setCanPush(false); // Cannot push other entities
    collision.setCanBePushed(false); // Cannot be pushed
    
    entity.addComponent(collision);

    // Add effect component
    const effect = new EffectComponent();
    effect.init({
        effectType: EffectType.SLOW,
        strength: config.slowFactor || 0.5, // Slow to 50% speed by default
        duration: config.duration || 5 // 5 seconds by default
    });
    entity.addComponent(effect);

    // Notify that the entity is fully initialized with all components
    entityManager.notifyEntityAdded(entity);

    return entity;
}
