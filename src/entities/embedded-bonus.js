import { TransformComponent } from './components/transform.js';
import { RenderComponent } from './components/render.js';
import { BonusComponent } from './components/bonus-component.js';

/**
 * Creates an embedded bonus entity
 * @param {EntityManager} entityManager - The entity manager
 * @param {Object} config - Bonus configuration
 * @returns {Entity} The created bonus entity
 */
export function createEmbeddedBonus(entityManager, config) {
    const entity = entityManager.createEntity();
    
    // Add transform component
    const transform = new TransformComponent();
    transform.init({
        x: 0, // Will be updated based on host position
        y: 0  // Will be updated based on host position
    });
    entity.addComponent(transform);

    // Add render component with sprite configuration
    const render = new RenderComponent();
    render.entityType = 'bonus';
    render.entitySubtype = 'embedded';
    render.initSpriteConfig(); // Initialize sprite from config
    render.layer = 100; // Draw above other entities
    render.alpha = 0.8;
    entity.addComponent(render);

    // Add progress bar render component
    const progressRender = new RenderComponent();
    progressRender.setAsRectangle(20, 4, '#00ff00');
    progressRender.layer = 101; // Draw above the bonus circle
    progressRender.offsetY = -20; // Position below the bonus circle
    entity.addComponent(progressRender);

    // Add bonus component
    const bonus = new BonusComponent();
    bonus.init(config);
    entity.addComponent(bonus);

    // Add tags
    entity.addTag('bonus');
    entity.addTag('embeddedBonus');
    entity.addTag(config.bonusType);
    entity.addTag(config.bonusVariant);

    // Notify entity manager that the entity is fully initialized
    entityManager.notifyEntityAdded(entity);

    return entity;
}

/**
 * Get the color for a bonus type
 * @param {string} bonusType - Type of bonus
 * @returns {string} The color for this bonus type
 */
function getBonusColor(bonusType) {
    switch (bonusType) {
        case 'soldier':
            return '#00ff00';
        case 'weapon':
            return '#ff0000';
        case 'grenade':
            return '#ffff00';
        case 'gun':
            return '#0000ff';
        default:
            return '#ffffff';
    }
} 