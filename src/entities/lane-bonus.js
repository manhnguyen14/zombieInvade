/**
 * Lane Bonus Class
 *
 * Represents a bonus item that appears in the bonus lane.
 * Can be collected by the player when they are in the bonus lane.
 */

import { TransformComponent } from './components/transform.js';
import { LaneComponent } from './components/lane.js';
import { RenderComponent } from './components/render.js';
import { MovementComponent, MovementType } from './components/movement.js';
import { CollisionComponent, CollisionType } from './components/collision.js';
import { BonusComponent } from './components/bonus-component.js';

/**
 * Creates a lane bonus entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Bonus configuration
 * @returns {Entity} The created bonus entity
 */
export function createLaneBonusEntity(entityManager, config = {}) {
    const entity = entityManager.createEntity();

    // Add transform component
    const transform = new TransformComponent();
    transform.init({
        x: config.x || 800, // Right side of the screen
        y: config.y || 0    // Will be set by lane system
    });
    entity.addComponent(transform);

    // Add lane component
    const lane = new LaneComponent();
    lane.init({
        laneIndex: 0 // Always in bonus lane
    });
    entity.addComponent(lane);

    // Add render component with sprite configuration
    const render = new RenderComponent();
    render.entityType = 'lane_bonus';
    render.entitySubtype = config.bonusType || 'soldier';
    render.entityVariant = config.bonusVariant || 'standard';

    // Initialize sprite configuration from the sprite config
    render.initSpriteConfig();
    
    // Set default dimensions if sprite config didn't provide them
    if (!render.width) render.width = config.width || 50;
    if (!render.height) render.height = config.height || 50;
    
    entity.addComponent(render);

    // Add movement component
    const movement = new MovementComponent();
    movement.init({
        type: MovementType.BONUS,
        speed: config.speed || 100, // Default bonus speed
        directionX: -1, // Move from right to left
        directionY: 0,
        weight: 1 // Light weight for movement
    });
    entity.addComponent(movement);

    // Add collision component
    const collision = new CollisionComponent();
    collision.init({
        width: render.width,
        height: render.height
    });
    collision.collisionType = CollisionType.BONUS;
    collision.setCanStack(false);
    collision.setCanPush(false);
    collision.setCanBePushed(false);
    entity.addComponent(collision);

    // Add bonus component
    const bonus = new BonusComponent();
    bonus.init({
        bonusType: config.bonusType || 'soldier',
        bonusVariant: config.bonusVariant || 'standard',
        ...config.bonusData
    });
    entity.addComponent(bonus);

    // Add tags
    entity.addTag('bonus');
    entity.addTag('laneBonus');
    entity.addTag(bonus.bonusType);
    entity.addTag(bonus.bonusVariant);

    // Notify that the entity is fully initialized with all components
    entityManager.notifyEntityAdded(entity);

    console.log(`[LANE_BONUS] Created lane bonus of type ${bonus.bonusType} (${render.entityVariant}) in lane ${lane.laneIndex} with sprite dimensions ${render.width}x${render.height}`);

    return entity;
}