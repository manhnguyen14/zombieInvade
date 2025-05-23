/**
 * Lane System
 * 
 * Manages the lane-based positioning of entities in the game.
 * Handles lane creation, entity positioning within lanes, and lane-specific logic.
 */

import { EntitySystem } from './entity-system.js';
import { ServiceLocator } from '../core/service-locator.js';
import { TransformComponent } from '../entities/components/transform.js';
import { RenderComponent } from '../entities/components/render.js';
import { LaneComponent } from '../entities/components/lane.js';

export class LaneSystem extends EntitySystem {
    /**
     * Create a new LaneSystem instance
     * @param {Object} config - Configuration object
     * @param {number} [config.laneCount=9] - Number of lanes (default: 9)
     * @param {number} [config.laneHeight=60] - Height of each lane in pixels
     * @param {number} [config.laneWidth=800] - Width of each lane in pixels
     * @param {string} [config.bonusLaneColor='#2c3e50'] - Color of the bonus lane
     * @param {string} [config.combatLaneColor='#34495e'] - Color of combat lanes
     */
    constructor(config = {}) {
        // This system requires the lane component
        super('laneSystem', ['lane']);

        // Set a high priority so it runs before other systems
        this.setPriority(10);

        // Lane configuration
        this.laneCount = config.laneCount || 9; // 0 = bonus lane, 1-8 = combat lanes
        this.laneHeight = config.laneHeight || 60;
        this.laneWidth = config.laneWidth || 800;
        this.bonusLaneColor = config.bonusLaneColor || '#1f1f1f';
        this.combatLaneColor = config.combatLaneColor || '#0d0d0d';

        // Store lane entities for reference
        this.laneEntities = [];
    }

    /**
     * Initialize the lane system
     * Creates lane background entities
     */
    initialize() {
        console.log('Initializing LaneSystem...');
        
        const entityManager = ServiceLocator.getService('entityManager');
        
        // Create lane background entities
        for (let i = 0; i < this.laneCount; i++) {
            const entity = entityManager.createEntity();

            // Add transform component
            const transform = new TransformComponent();
            transform.init({
                x: this.laneWidth / 2,
                y: i * this.laneHeight + this.laneHeight / 2
            });
            entity.addComponent(transform);

            // Add render component
            const render = new RenderComponent();
            render.setAsRectangle(
                this.laneWidth, 
                this.laneHeight, 
                i === 0 ? this.bonusLaneColor : this.combatLaneColor
            );
            render.setLayer(-100); // Draw behind other entities
            entity.addComponent(render);

            // Add lane component
            const lane = new LaneComponent();
            lane.init({
                laneIndex: i,
                laneWidth: this.laneWidth,
                laneHeight: this.laneHeight
            });
            entity.addComponent(lane);

            // Add tag
            entity.addTag('lane');
            entity.addTag('background');

            // Store lane entity for reference
            this.laneEntities[i] = entity;
        }
    }

    /**
     * Process an entity with lane component
     * @param {Entity} entity - The entity to process
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    processEntity(entity, deltaTime) {
        // Skip lane background entities
        if (entity.hasTag('lane')) return;

        const lane = entity.getComponent('lane');
        const transform = entity.getComponent('transform');

        // If entity has a transform component, update its Y position based on lane
        if (transform) {
            transform.y = lane.laneIndex * this.laneHeight + this.laneHeight / 2;
        }
    }

    /**
     * Get the lane entity for a specific lane index
     * @param {number} laneIndex - The lane index
     * @returns {Entity|null} The lane entity, or null if not found
     */
    getLaneEntity(laneIndex) {
        if (laneIndex < 0 || laneIndex >= this.laneCount) {
            return null;
        }
        return this.laneEntities[laneIndex];
    }

    /**
     * Check if a lane index is valid
     * @param {number} laneIndex - The lane index to check
     * @returns {boolean} True if the lane index is valid, false otherwise
     */
    isValidLane(laneIndex) {
        return laneIndex >= 0 && laneIndex < this.laneCount;
    }

    /**
     * Check if a lane index is the bonus lane
     * @param {number} laneIndex - The lane index to check
     * @returns {boolean} True if the lane is the bonus lane, false otherwise
     */
    isBonusLane(laneIndex) {
        return laneIndex === 0;
    }

    /**
     * Check if a lane index is a combat lane
     * @param {number} laneIndex - The lane index to check
     * @returns {boolean} True if the lane is a combat lane, false otherwise
     */
    isCombatLane(laneIndex) {
        return laneIndex > 0 && laneIndex < this.laneCount;
    }

    /**
     * Get the total number of lanes
     * @returns {number} The total number of lanes
     */
    getLaneCount() {
        return this.laneCount;
    }

    /**
     * Get the height of each lane
     * @returns {number} The lane height in pixels
     */
    getLaneHeight() {
        return this.laneHeight;
    }

    /**
     * Get the width of each lane
     * @returns {number} The lane width in pixels
     */
    getLaneWidth() {
        return this.laneWidth;
    }

    /**
     * Move an entity to a specific lane
     * @param {Entity} entity - The entity to move
     * @param {number} laneIndex - The target lane index
     * @returns {boolean} True if the entity was moved, false otherwise
     */
    moveEntityToLane(entity, laneIndex) {
        if (!this.isValidLane(laneIndex) || !entity.hasComponent('lane')) {
            return false;
        }

        const lane = entity.getComponent('lane');
        lane.laneIndex = laneIndex;

        // Update transform if available
        const transform = entity.getComponent('transform');
        if (transform) {
            transform.y = laneIndex * this.laneHeight + this.laneHeight / 2;
        }

        return true;
    }

    /**
     * Get all entities in a specific lane
     * @param {number} laneIndex - The lane index
     * @returns {Entity[]} Array of entities in the lane
     */
    getEntitiesInLane(laneIndex) {
        if (!this.isValidLane(laneIndex)) {
            return [];
        }

        const entityManager = ServiceLocator.getService('entityManager');
        const entities = entityManager.getEntitiesWithComponent('lane');
        
        return entities.filter(entity => {
            if (entity.hasTag('lane')) return false; // Skip lane background entities
            const lane = entity.getComponent('lane');
            return lane.laneIndex === laneIndex;
        });
    }

    /**
     * Calculate lane coverage based on soldier count
     * @param {number} soldierCount - Number of soldiers
     * @returns {number} Number of lanes covered
     */
    calculateLaneCoverage(soldierCount) {
        if (soldierCount <= 5) {
            return 1;
        } else if (soldierCount <= 10) {
            return 2;
        } else {
            return 3;
        }
    }
}
