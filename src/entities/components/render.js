import { Component } from '../component.js';
import { SpriteConfig } from '../../config/sprite-config.js';

/**
 * Render Component
 * Handles visual representation of entities
 */
export class RenderComponent extends Component {
  /**
   * Create a new RenderComponent
   */
  constructor(entity, options = {}) {
    super('render');
    
    this.entity = entity;
    
    // Original properties
    this.shapeType = options.shapeType || 'rect'; // Default shape type
    this.color = options.color || '#ffffff';
    this.width = options.width || 32;
    this.height = options.height || 32;
    this.radius = options.radius || 0;
    this.visible = options.visible !== undefined ? options.visible : true;
    this.alpha = options.alpha || 1;
    this.layer = options.layer || 0;
    this.offsetX = options.offsetX || 0;
    this.offsetY = options.offsetY || 0;

    // Original sprite properties
    this.image = options.image || null;
    this.sourceX = options.sourceX || 0;
    this.sourceY = options.sourceY || 0;
    this.sourceWidth = options.sourceWidth || 0;
    this.sourceHeight = options.sourceHeight || 0;
    
    // New sprite configuration properties
    this.entityType = options.entityType || null;
    this.entitySubtype = options.entitySubtype || null;
    this.entityVariant = options.entityVariant || null;
    this.entityState = options.entityState || null;
    
    // Animation properties
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDuration = options.frameDuration || 0.2; // seconds per frame
    
    // Initialize sprite config if entity type is provided
    if (this.entityType) {
      this.initSpriteConfig();
    }
  }

  /**
   * Set this component to render as a rectangle
   * @param {number} width - Width of the rectangle
   * @param {number} height - Height of the rectangle
   * @param {string} color - Color of the rectangle
   * @returns {RenderComponent} This component for method chaining
   */
  setAsRectangle(width, height, color) {
    this.width = width;
    this.height = height;
    this.color = color || '#FFFFFF';
    this.shapeType = 'rect';
    return this;
  }

  /**
   * Set this component to render as a circle
   * @param {number} radius - Radius of the circle
   * @param {string} color - Color of the circle
   * @returns {RenderComponent} This component for method chaining
   */
  setAsCircle(radius, color) {
    this.radius = radius;
    this.width = radius * 2; // Set width for collision detection
    this.height = radius * 2; // Set height for collision detection
    this.color = color || '#FFFFFF';
    this.shapeType = 'circle';
    return this;
  }

  /**
   * Set this component to render as a sprite
   * @param {HTMLImageElement} image - The image to use
   * @param {number} width - Width to render the sprite
   * @param {number} height - Height to render the sprite
   * @param {number} sourceX - X position in the source image
   * @param {number} sourceY - Y position in the source image
   * @param {number} sourceWidth - Width in the source image
   * @param {number} sourceHeight - Height in the source image
   * @returns {RenderComponent} This component for method chaining
   */
  setAsSprite(image, width, height, sourceX, sourceY, sourceWidth, sourceHeight) {
    this.image = image;
    this.width = width;
    this.height = height;
    this.sourceX = sourceX || 0;
    this.sourceY = sourceY || 0;
    this.sourceWidth = sourceWidth || image.width;
    this.sourceHeight = sourceHeight || image.height;
    this.shapeType = 'sprite';
    return this;
  }

  /**
   * Set the rendering layer for this component
   * Lower values are rendered first (behind higher values)
   * @param {number} layer - The layer value
   * @returns {RenderComponent} This component for method chaining
   */
  setLayer(layer) {
    this.layer = layer;
    return this;
  }
  
  /**
   * Initialize sprite configuration based on entity type
   */
  initSpriteConfig() {
    // Get sprite config based on entity type hierarchy
    let config = SpriteConfig[this.entityType];
    
    if (config && this.entitySubtype) {
      config = config[this.entitySubtype] || config;
    }
    
    if (config && this.entityState) {
      config = config[this.entityState] || config;
    }
    
    if (config && this.entityVariant) {
      config = config[this.entityVariant] || config;
    }
    
    this.spriteConfig = config;
    
    // Set animation properties from config
    if (this.spriteConfig) {
      this.frameCount = this.spriteConfig.frameCount || 1;
      this.loop = this.spriteConfig.loop !== false;
      this.width = this.spriteConfig.width || this.width;
      this.height = this.spriteConfig.height || this.height;
      
      // Set sprite properties for compatibility with existing code
      this.shapeType = 'sprite';
      this.sourceX = this.spriteConfig.sourceX || 0;
      this.sourceY = this.spriteConfig.sourceY || 0;
      this.sourceWidth = this.spriteConfig.width || this.width;
      this.sourceHeight = this.spriteConfig.height || this.height;
    } else {
      this.frameCount = 1;
      this.loop = false;
    }
  }

  /**
   * Update the animation frame
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (!this.spriteConfig || this.frameCount <= 1) return;
    
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0;
      
      // Only advance frame if looping or not at the end of animation
      if (this.loop || this.frameIndex < this.frameCount - 1) {
        this.frameIndex = (this.frameIndex + 1) % this.frameCount;
        
        // Update sourceX for compatibility with existing code
        if (this.spriteConfig) {
          this.sourceX = this.spriteConfig.sourceX + (this.frameIndex * this.spriteConfig.width);
        }
      }
    }
  }

  /**
   * Render the entity
   * @param {Renderer} renderer - The renderer
   * @param {AssetLoader} assetLoader - The asset loader
   */
  render(renderer, assetLoader) {
    const transform = this.entity.getComponent('transform');
    if (!transform) return;
    
    const x = transform.position.x;
    const y = transform.position.y;
    
    renderer.save();
    renderer.setAlpha(this.alpha);
    
    if (this.spriteConfig) {
      this.renderSprite(renderer, assetLoader, x, y);
    } else if (this.shapeType === 'sprite' && this.image) {
      // Handle legacy sprite rendering
      renderer.drawSprite(
        this.image,
        this.sourceX,
        this.sourceY,
        this.sourceWidth,
        this.sourceHeight,
        x - this.width / 2,
        y - this.height / 2,
        this.width,
        this.height
      );
    } else if (this.shapeType === 'circle') {
      // Render circle
      renderer.drawCircle(x, y, this.radius, this.color);
    } else {
      // Fallback to rectangle rendering
      renderer.fillRect(
        x - this.width / 2,
        y - this.height / 2,
        this.width,
        this.height,
        this.color
      );
    }
    
    renderer.restore();
  }
  
  /**
   * Render using sprite
   * @param {Renderer} renderer - The renderer
   * @param {AssetLoader} assetLoader - The asset loader
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  renderSprite(renderer, assetLoader, x, y) {
    const spriteSheet = assetLoader.getImage('spriteSheet');
    if (!spriteSheet || !this.spriteConfig) return;
    
    // Calculate source coordinates based on animation frame
    const sourceX = this.spriteConfig.sourceX + (this.frameIndex * this.spriteConfig.width);
    const sourceY = this.spriteConfig.sourceY;
    
    // Apply offset if specified
    const renderX = x - this.width / 2 + this.offsetX;
    const renderY = y - this.height / 2 + this.offsetY;
    
    renderer.drawSprite(
      spriteSheet,
      sourceX,
      sourceY,
      this.spriteConfig.width,
      this.spriteConfig.height,
      renderX,
      renderY,
      this.width,
      this.height
    );
  }
  
  /**
   * Set entity state (for animations)
   * @param {string} state - New entity state
   */
  setState(state) {
    if (this.entityState === state) return;
    
    this.entityState = state;
    this.frameIndex = 0;
    this.frameTimer = 0;
    
    // Re-initialize sprite config with new state
    this.initSpriteConfig();
    
    // If this is a dying state, ensure we don't loop the animation
    if (state === 'dying') {
      this.loop = false;
    }
  }
}
