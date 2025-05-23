/**
 * Transform Component
 * 
 * Stores position, rotation, and scale information for an entity.
 * This is a fundamental component used by most entities.
 */

import { Component } from '../component.js';

export class TransformComponent extends Component {
    /**
     * Create a new TransformComponent instance
     */
    constructor() {
        super('transform');
        
        // Position
        this.x = 0;
        this.y = 0;
        
        // Rotation in radians
        this.rotation = 0;
        
        // Scale
        this.scaleX = 1;
        this.scaleY = 1;
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {number} [data.x=0] - X position
     * @param {number} [data.y=0] - Y position
     * @param {number} [data.rotation=0] - Rotation in radians
     * @param {number} [data.scaleX=1] - X scale
     * @param {number} [data.scaleY=1] - Y scale
     * @returns {TransformComponent} This component for method chaining
     */
    init(data = {}) {
        this.x = data.x !== undefined ? data.x : 0;
        this.y = data.y !== undefined ? data.y : 0;
        this.rotation = data.rotation !== undefined ? data.rotation : 0;
        this.scaleX = data.scaleX !== undefined ? data.scaleX : 1;
        this.scaleY = data.scaleY !== undefined ? data.scaleY : 1;
        
        return this;
    }

    /**
     * Reset the component to its default state
     * @returns {TransformComponent} This component for method chaining
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        
        return this;
    }

    /**
     * Set the position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {TransformComponent} This component for method chaining
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        
        return this;
    }

    /**
     * Set the rotation
     * @param {number} rotation - Rotation in radians
     * @returns {TransformComponent} This component for method chaining
     */
    setRotation(rotation) {
        this.rotation = rotation;
        
        return this;
    }

    /**
     * Set the scale
     * @param {number} scaleX - X scale
     * @param {number} scaleY - Y scale
     * @returns {TransformComponent} This component for method chaining
     */
    setScale(scaleX, scaleY) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        
        return this;
    }

    /**
     * Clone the component
     * @returns {TransformComponent} A new component instance with the same properties
     */
    clone() {
        const clone = new TransformComponent();
        
        clone.x = this.x;
        clone.y = this.y;
        clone.rotation = this.rotation;
        clone.scaleX = this.scaleX;
        clone.scaleY = this.scaleY;
        
        return clone;
    }
}
