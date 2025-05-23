/**
 * Movement System
 *
 * Handles entity movement based on movement components.
 * Integrates with the collision system for obstacle interaction.
 * Implements different movement behaviors for different entity types.
 */

import { EntitySystem } from './entity-system.js';
import { ServiceLocator } from '../core/service-locator.js';
import { MovementType } from '../entities/components/movement.js';
import { GameSpeedController } from '../core/game-speed-controller.js';

export class MovementSystem extends EntitySystem {
    /**
     * Create a new MovementSystem instance
     */
    constructor() {
        // This system requires transform and movement components
        super('movementSystem', ['transform', 'movement']);

        // Set a medium priority
        this.setPriority(5);

        // Create a game speed controller
        this.speedController = new GameSpeedController();

        // Register the speed controller with the service locator
        ServiceLocator.registerService('speedController', this.speedController);

        // Frame counter for logging
        this.frameCount = 0;

        // Debug flag
        this.debug = false;

        //event bus
        this.eventBus = null;
    }

    /**
     * Initialize the system
     */
    initialize() {
        // Get the event bus
        this.eventBus = ServiceLocator.getService('eventBus');
        if (this.eventBus) {
            // Subscribe to events
            this.eventBus.subscribe('entityStoppedForAttack', this.handleEntityStoppedForAttack.bind(this));
            this.eventBus.subscribe('entityResumedFromAttack', this.handleEntityResumedFromAttack.bind(this));
            this.eventBus.subscribe('entityRemoved', this.handleEntityRemoved.bind(this));
        } else {
            console.error('[MOVEMENT_SYSTEM] Event bus not found');
        }
    }

    /**
     * Update method called every frame
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Increment frame counter
        this.frameCount++;

        // Get all entities with transform and movement components
        const entityManager = ServiceLocator.getService('entityManager');

        // Get entities with transform and movement components
        const entities = entityManager.getEntitiesWithAllComponents(['transform', 'movement']);

        // Process all entities
        for (const entity of entities) {
            this.processEntity(entity, deltaTime);
        }
    }

    /**
     * Handle entity stopped for attack event
     * @param {Object} event - Event data
     */
    handleEntityStoppedForAttack(event) {
        const { entity } = event;
        if (!entity) return;

        const movement = entity.getComponent('movement');
        if (movement) {
            movement.enabled = false;
        }
    }

    /**
     * Handle entity resumed from attack event
     * @param {Object} event - Event data
     */
    handleEntityResumedFromAttack(event) {
        const { entity } = event;
        if (!entity) return;

        const movement = entity.getComponent('movement');
        if (movement) {
            movement.enabled = true;
        }
    }

    /**
     * Handle entity removed event
     * @param {Object} event - Event data
     */
    handleEntityRemoved(event) {
        const { entity } = event;
        if (!entity) return;

        const movement = entity.getComponent('movement');
        if (movement) {
            movement.enabled = false;
        }
    }

    /**
     * Process an entity with transform and movement components
     * @param {Entity} entity - The entity to process
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    processEntity(entity, deltaTime) {
        const transform = entity.getComponent('transform');
        const movement = entity.getComponent('movement');

        // We should always have both components since we're using getEntitiesWithAllComponents
        if (!transform || !movement) {
            return;
        }

        // Skip if movement is disabled
        if (!movement.enabled) {
            return;
        }

        // Store original position for logging
        const originalX = transform.x;
        const originalY = transform.y;

        // Calculate movement delta
        const delta = movement.calculateMovementDelta(deltaTime);

        // Apply movement based on entity type
        switch (movement.movementType) {
            case MovementType.PLAYER:
                this._processPlayerMovement(entity, transform, movement, delta, deltaTime);
                break;
            case MovementType.ENEMY:
                this._processLaneEntityMovement(entity, transform, movement, delta, deltaTime);
                break;
            case MovementType.OBSTACLE:
                this._processLaneEntityMovement(entity, transform, movement, delta, deltaTime);
                break;
            case MovementType.PROJECTILE:
                this._processProjectileMovement(entity, transform, movement, delta, deltaTime);
                break;
            case MovementType.BONUS:
                this._processLaneEntityMovement(entity, transform, movement, delta, deltaTime);
                break;
            default:
                // Default movement behavior
                transform.x += delta.x;
                transform.y += delta.y;
                break;
        }

        // Check for off-screen entities
        this._checkOffScreen(entity, transform);
    }

    /**
     * Process player movement
     * @private
     */
    _processPlayerMovement(entity, transform, movement, delta, deltaTime) {
        // Player is fixed at the left side of the screen
        // We don't move the player horizontally, but instead adjust the speed modifier

        // Get input handler
        const inputHandler = ServiceLocator.getService('input');

        // Check for speed modifier adjustments with K and ; keys
        if (inputHandler && inputHandler.wasKeyJustPressed) {
            if (inputHandler.wasKeyJustPressed('Semicolon')) { // Forward - increase speed
                const newSpeed = this.speedController.increasePlayerSpeed();
                // Update speed display if it exists
                const speedDisplay = document.getElementById('speed-display');
                if (speedDisplay) {
                    speedDisplay.textContent = newSpeed;
                }
            } else if (inputHandler.wasKeyJustPressed('KeyK')) { // Backward - decrease speed
                const newSpeed = this.speedController.decreasePlayerSpeed();

                // Update speed display if it exists
                const speedDisplay = document.getElementById('speed-display');
                if (speedDisplay) {
                    speedDisplay.textContent = newSpeed;
                }
            }
        }

        // Fix player position at left side of screen
        transform.x = 100; // Fixed position
    }

    /**
     * Process projectile movement
     * @private
     */
    _processProjectileMovement(entity, transform, movement, delta, deltaTime) {
        // Projectiles move in their own direction, not affected by speed modifier
        transform.x += delta.x;
        transform.y += delta.y;
    }

    /**
     * Process enemy, obstacle, and bonus movement
     * @private
     */
    _processLaneEntityMovement(entity, transform, movement, delta, deltaTime) {
        // Apply vertical movement
        transform.y += delta.y;

        // Get the speed controller
        if (!this.speedController) {
            this.speedController = ServiceLocator.getService('speedController');
        }

        // Apply horizontal movement with speed modifier
        const baseSpeed = this.speedController ? this.speedController.getBaseSpeed() : 100;
        const speedModifier = this.speedController ? this.speedController.getPlayerSpeedModifier() : 4;
        // Make the speed more responsive to game speed changes
        let effectiveSpeed;
        if (movement.collisionGroupId !== null) {
            // Use the group speed instead of individual speed
            effectiveSpeed = movement.groupSpeed + (baseSpeed * speedModifier);
        } else {
            // Use individual speed as before
            effectiveSpeed = movement.speed + (baseSpeed * speedModifier);
        }
        const moveAmount = effectiveSpeed * deltaTime;

        // Apply movement
        transform.x -= moveAmount;

        // Debug log if debug is enabled
    }



    /**
     * Check if an entity is off screen and handle accordingly
     * @private
     */
    _checkOffScreen(entity, transform) {
        // Get renderer for screen dimensions
        const renderer = ServiceLocator.getService('renderer');
        if (!renderer) {
            console.error('[ERROR] Renderer not found, cannot check if entity is off screen');
            return;
        }

        // Don't remove entities with the 'persistent' tag
        if (entity.hasTag('persistent')) {
            return;
        }

        // Access canvas dimensions directly from renderer
        const canvasWidth = renderer.width;
        const canvasHeight = renderer.height;

        if (!canvasWidth || !canvasHeight) {
            console.error('[ERROR] Canvas dimensions not available');
            return;
        }

        // Check if entity is off screen
        const margin = 100; // Allow entities to go slightly off screen before removing

        // Only remove entities that have moved off the left side of the screen
        // or too far above/below the screen
        const movement = entity.getComponent('movement');
        if (transform.x < -margin ||
            (transform.x > canvasWidth && movement.movementType === MovementType.PROJECTILE) ||
            transform.y < -margin ||
            transform.y > canvasHeight + margin ) {

            // Don't remove player or lane entities
            if (entity.hasTag('player') || entity.hasTag('lane')) {
                return;
            }

            // Entity will be removed, no need to handle collision groups here
            // The collision system is responsible for managing collision groups

            //publish event enemy escaped
            if (this.eventBus && entity.hasTag('enemy')) {
                this.eventBus.publish('enemyEscaped', { entity });
            }

            // Remove entity
            const entityManager = ServiceLocator.getService('entityManager');
            if (entityManager) {
                entityManager.removeEntity(entity);
            }
        }
    }

    /**
     * Clean up resources when the system is destroyed
     */
    destroy() {
        // Unsubscribe from events
        if (this.eventBus) {
            this.eventBus.unsubscribe('entityStoppedForAttack', this.handleEntityStoppedForAttack);
            this.eventBus.unsubscribe('entityResumedFromAttack', this.handleEntityResumedFromAttack);
        }

        this.eventBus = null;
        this.speedController = null;
    }
}
