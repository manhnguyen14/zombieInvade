/**
 * Lane Component
 * 
 * Stores lane information for an entity.
 * Used for positioning entities in the lane-based system.
 */

import { Component } from '../component.js';

export class LaneComponent extends Component {
    /**
     * Create a new LaneComponent instance
     */
    constructor() {
        super('lane');
        
        // Lane index (0 = bonus lane, 1-8 = combat lanes)
        this.laneIndex = 0;
        
        // Horizontal position within the lane (0 = left edge, 1 = right edge)
        this.position = 0;
        
        // Lane width in pixels
        this.laneWidth = 0;
        
        // Lane height in pixels
        this.laneHeight = 0;
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @param {number} [data.laneIndex=0] - Lane index
     * @param {number} [data.position=0] - Horizontal position within the lane
     * @param {number} [data.laneWidth=0] - Lane width in pixels
     * @param {number} [data.laneHeight=0] - Lane height in pixels
     * @returns {LaneComponent} This component for method chaining
     */
    init(data = {}) {
        this.laneIndex = data.laneIndex !== undefined ? data.laneIndex : 0;
        this.position = data.position !== undefined ? data.position : 0;
        this.laneWidth = data.laneWidth !== undefined ? data.laneWidth : 0;
        this.laneHeight = data.laneHeight !== undefined ? data.laneHeight : 0;
        
        return this;
    }

    /**
     * Reset the component to its default state
     * @returns {LaneComponent} This component for method chaining
     */
    reset() {
        this.laneIndex = 0;
        this.position = 0;
        this.laneWidth = 0;
        this.laneHeight = 0;
        
        return this;
    }

    /**
     * Set the lane index
     * @param {number} laneIndex - Lane index
     * @returns {LaneComponent} This component for method chaining
     */
    setLaneIndex(laneIndex) {
        this.laneIndex = laneIndex;
        
        return this;
    }

    /**
     * Set the horizontal position within the lane
     * @param {number} position - Horizontal position (0 = left edge, 1 = right edge)
     * @returns {LaneComponent} This component for method chaining
     */
    setPosition(position) {
        this.position = position;
        
        return this;
    }

    /**
     * Set the lane dimensions
     * @param {number} width - Lane width in pixels
     * @param {number} height - Lane height in pixels
     * @returns {LaneComponent} This component for method chaining
     */
    setLaneDimensions(width, height) {
        this.laneWidth = width;
        this.laneHeight = height;
        
        return this;
    }

    /**
     * Check if the entity is in the bonus lane
     * @returns {boolean} True if the entity is in the bonus lane, false otherwise
     */
    isInBonusLane() {
        return this.laneIndex === 0;
    }

    /**
     * Check if the entity is in a combat lane
     * @returns {boolean} True if the entity is in a combat lane, false otherwise
     */
    isInCombatLane() {
        return this.laneIndex > 0;
    }

    /**
     * Clone the component
     * @returns {LaneComponent} A new component instance with the same properties
     */
    clone() {
        const clone = new LaneComponent();
        
        clone.laneIndex = this.laneIndex;
        clone.position = this.position;
        clone.laneWidth = this.laneWidth;
        clone.laneHeight = this.laneHeight;
        
        return clone;
    }
}
