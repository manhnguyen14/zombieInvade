/**
 * Damage Area Factory
 *
 * Creates temporary damage area entities when enemies attack soldiers.
 * Handles damage application and visual effects.
 */

import { TransformComponent } from './components/transform.js';
import { RenderComponent } from './components/render.js';
import { DamageType } from './components/damage.js';
import { DamageAreaComponent } from './components/damage-area-component.js';

/**
 * Create a new damage area entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Damage area configuration
 * @returns {Entity} The damage area entity
 */
export function createDamageArea(entityManager, config = {}) {
    if (!entityManager) {
        throw new Error('DamageArea requires an entity manager');
    }

    // Create the damage area entity
    const entity = entityManager.createEntity();

    // Add damage area tag
    entity.addTag('damageArea');

    // Add transform component
    const transform = new TransformComponent();
    transform.init({
        x: config.x || 0,
        y: config.y || 0
    });
    entity.addComponent(transform);
    // Add render component
    const render = new RenderComponent();

    // Determine the appropriate sprite configuration based on damage type
    if (config.isGrenade) {
        // Set up grenade damage area sprite
        render.entityType = 'damageArea';
        render.entitySubtype = 'grenade';
        render.initSpriteConfig();
    } else if (config.gunType) {
        // Set up gun damage area sprite
        render.entityType = 'damageArea';
        render.entitySubtype = 'gun';
        render.entityVariant = config.gunType;
        render.initSpriteConfig();
    } else if (config.damageType === DamageType.ENEMY_TO_SOLDIER) {
        // Determine zombie type from source entity if available
        let zombieType = 'normal';
        if (config.sourceEntity && config.sourceEntity.hasTag('enemy')) {
            if (config.sourceEntity.hasTag('giantZombie')) {
                zombieType = 'giant';
            } else if (config.sourceEntity.hasTag('armoredZombie')) {
                zombieType = 'armored';
            } else if (config.sourceEntity.hasTag('normalZombie')) {
                zombieType = 'normal';
            }
            render.entityType = 'damageArea';
            render.entitySubtype = 'zombie';
            render.entityVariant = zombieType;
            render.initSpriteConfig();
        } else if (config.sourceEntity && config.sourceEntity.hasTag('obstacle')) {
            render.entityType = 'damageArea';
            render.entitySubtype = 'obstacle';
            render.initSpriteConfig();
        }
    } else {
        // Default to rectangle for other damage areas
        render.setAsRectangle(
            config.width || 50,
            config.height || 100,
            config.color || 'rgba(255, 0, 0, 0.3)');
        render.shapeType = 'rectangle';
    }

    entity.addComponent(render);
    const renderComponent = entity.getComponent('render');
    console.log(`[AREA-CONFIG] entity's render component: `, renderComponent);

    // Add damage area component
    const damageArea = new DamageAreaComponent();
    damageArea.init({
        damageType: config.damageType || DamageType.ENEMY_TO_SOLDIER,
        damageAmount: config.damageAmount || 1,
        affectedEntities: config.affectedEntities || 1,
        sourceEntity: config.sourceEntity || null,
        lifetime: config.lifetime || 0.2,
        gunType: config.gunType || null,
        isGrenade: config.isGrenade || false
    });
    entity.addComponent(damageArea);

    // Notify entity manager that the entity is fully initialized
    entityManager.notifyEntityAdded(entity);

    return entity;
}