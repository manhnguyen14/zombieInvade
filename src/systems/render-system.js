/**
 * RenderSystem Class
 *
 * Handles the rendering of all entities in the game.
 * Processes entities with both transform and render components.
 */

import { EntitySystem } from './entity-system.js';
import { ServiceLocator } from '../core/service-locator.js';

export class RenderSystem extends EntitySystem {
    /**
     * Create a new RenderSystem
     */
    constructor() {
        super('renderSystem', ['transform', 'render']);
        this.setPriority(-100); // Negative priority to be identified as a render system
        this.entityManager = ServiceLocator.getService('entityManager');
    }

    initialize() {
        this.renderer = ServiceLocator.getService('renderer');
        if (!this.renderer) {
            throw new Error('Renderer service not found');
        }
    }

    /**
     * Update the system
     * @param {number} deltaTime - Time in seconds since the last update
     */
    update(deltaTime) {
        const entities = this.getEntities();
        const renderEntries = [];

        // Update animation frames for entities with sprite configurations
        for (const entity of entities) {
            if (!entity.hasComponent('render')) continue;
            if (entity.hasTag('embeddedBonus')) {
                this.processEmbeddedBonus(entity);
            }
            const renders = entity.getComponents('render');

            if (renders) {
                for (const render of renders) {
                    // Update animation frame if entity has a sprite configuration
                    if (render.spriteConfig && render.frameCount > 1) {
                        render.update(deltaTime);
                    }

                    renderEntries.push([entity, render]);
                }
            }
        }

        // Sort entities by render layer
        renderEntries.sort((a, b) => {
            const renderA = a[1];
            const renderB = b[1];
            return renderA.layer - renderB.layer;
        });

        // Render entities in the sorted order
        for (const [entity, render] of renderEntries) {
            this.renderComponent(entity, render);
        }
        this._drawFinishLine();
    }


    /**
     * render component
     * @param {Entity} entity - The entity to render
     * @param {RenderComponent} renderComponent - The render component to render
     */
    renderComponent(entity, renderComponent) {
        const render = renderComponent;
        const transform = entity.getComponent('transform');
        const game = ServiceLocator.getService('game');
        const debugMode = game.debugMode;

        if (!render.visible) {
            return;
        }

        // Save the current context state
        this.renderer.save();

        // Set alpha if specified
        if (render.alpha !== undefined) {
            this.renderer.setAlpha(render.alpha);
        }

        // Get the canvas context for transformations
        const ctx = this.renderer.getContext();

        // Apply transformations
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.rotation);
        ctx.scale(transform.scale, transform.scale);

        // Render based on type
        switch (render.shapeType) {
            case 'rectangle':
            case 'rect':
                this.renderer.drawRect(
                    -render.width / 2,
                    -render.height / 2,
                    render.width,
                    render.height,
                    render.color,
                    render.offsetX,
                    render.offsetY
                );
                break;

            case 'circle':
                this.renderer.drawCircle(
                    0,
                    0,
                    render.radius,
                    render.color
                );
                break;

            case 'image':
                if (render.image) {
                    this.renderer.drawImage(
                        render.image,
                        -render.width / 2,
                        -render.height / 2,
                        render.width,
                        render.height
                    );
                } else {
                    console.log(`[RenderSystem] Entity ${entity.id} has image type but no image`);
                }
                break;

            case 'sprite':
                if (render.spriteConfig) {
                    // Get the sprite sheet from the asset loader
                    const assetLoader = ServiceLocator.getService('assetLoader');
                    const spriteSheet = assetLoader ? assetLoader.getImage('spriteSheet') : null;
                    
                    if (spriteSheet) {
                        // Calculate source coordinates based on animation frame
                        const sourceX = render.spriteConfig.sourceX + (render.frameIndex * render.spriteConfig.width);
                        const sourceY = render.spriteConfig.sourceY;

                        this.renderer.drawSprite(
                            spriteSheet,
                            sourceX,
                            sourceY,
                            render.spriteConfig.width,
                            render.spriteConfig.height,
                            -render.width / 2,
                            -render.height / 2,
                            render.width,
                            render.height
                        );
                    } else {
                        console.log(`[RenderSystem] Sprite sheet not found for entity ${entity.id}`);
                    }
                } else if (render.spritesheet) {
                    this.renderer.drawSprite(
                        render.spritesheet,
                        render.sourceX,
                        render.sourceY,
                        render.sourceWidth,
                        render.sourceHeight,
                        -render.width / 2,
                        -render.height / 2,
                        render.width,
                        render.height
                    );
                } else {
                    console.log(`[RenderSystem] Entity ${entity.id} has sprite type but no spritesheet`);
                }
                break;
        }

        if (debugMode) {
            this.renderer.drawText(entity.id, 30, 0, '#ffffff', '16px Arial');
        }

        // Restore the context state
        this.renderer.restore();
    }


    /**
     * Process embedded bonus
     * @param {Entity} entity - The entity to process
     */
    processEmbeddedBonus(entity) {
        if (!entity.hasTag('embeddedBonus')) {
            return;
        }
        
        const transform = entity.getComponent('transform');
        const renders = entity.getComponents('render');
        const bonus = entity.getComponent('bonus');

        try {
            const progressRender = renders[1];
            if (progressRender) {
                progressRender.width = bonus.timeRemaining/bonus.lifetime * 20;
            }
        } catch (error) {
            console.log("[EmbeddedBonus] unable to call progressRender.width", error);
        }
        

        // Get the host entity
        if(!bonus.hostEntityId) {
            console.log("[RenderSystem] Embedded bonus has no host entity", entity.id);
            return;
        }

        const hostEntity = this.entityManager.getEntity(bonus.hostEntityId);

        if (hostEntity) {
            const hostTransform = hostEntity.getComponent('transform');
            transform.x = hostTransform.x + 20;
            transform.y = hostTransform.y - 30;
        } else {
            transform.x = 0;
            transform.y = 0;
        }

    } 



    /**
     * Draw the finish line if configured
     * @private
     */
    _drawFinishLine() {
        // Get game instance
        const game = ServiceLocator.getService('game');
        if (!game) return;
        
        // Get finish line data
        const finishLineData = game.getFinishLineData();
        if (!finishLineData) return;
        
        const { position, passed } = finishLineData;
        console.log("[RenderSystem] Drawing finish line at", position);

        // Only draw if visible on screen
        if (position >= 0 && position <= this.renderer.width) {
            // Draw a vertical line
            const ctx = this.renderer.getContext();
            
            // Use different color if passed
            ctx.strokeStyle = passed ? '#00ff00' : '#ff0000';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(position, 0);
            ctx.lineTo(position, 540);
            ctx.stroke();
            
            // Draw finish text
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.fillText('FINISH', position - 30, 30);
        }
    }

    /**
     * Destroy the system
     */
    destroy() {
        this.renderer = null;
    }
}

