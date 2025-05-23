// move data in sticky area to effect area

import { Component } from '../component.js';

export const EffectType = {
    NONE: 'none',
    SLOW: 'slow'
};

export class EffectComponent extends Component {
    constructor() {
        super('effect');

        // Effect type
        this.effectType = EffectType.NONE;

        // Effect strength (e.g., slow factor)
        this.strength = 0;

        // Effect duration
        this.duration = 0;

        // Remaining time
        this.remainingTime = 0;

        // Entities affected by this effect
        this.affectedEntities = new Set();
    }

    /**
     * Initialize the component with data
     * @param {Object} data - Data to initialize the component with
     * @returns {EffectComponent} This component for method chaining
     */
    init(data = {}) {
        this.effectType = data.effectType || EffectType.NONE;
        this.strength = data.strength !== undefined ? data.strength : 0;
        this.duration = data.duration !== undefined ? data.duration : 0;
        this.remainingTime = this.duration;
        this.affectedEntities.clear();
        
        return this;
    }

    /**
     * Clean up resources when the component is destroyed
     */
    destroy() {
        this.affectedEntities.clear();
    }
}