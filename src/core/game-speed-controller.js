/**
 * Game Speed Controller
 *
 * Controls the global game speed and provides methods to adjust it.
 * This affects how fast objects move from right to left in the game.
 */

export class GameSpeedController {
    /**
     * Create a new GameSpeedController instance
     */
    constructor() {
        // Base speed for objects moving from right to left
        this.baseSpeed = 5; // Default base speed (pixels per second)

        // Player speed modifier (affects all other objects)
        this.playerSpeedModifier = 4; // Default modifier

        // Minimum and maximum speed modifier values
        this.minSpeedModifier = -10;
        this.maxSpeedModifier = 20;

        // Step size for speed adjustments
        this.speedModifierStep = 1;
    }

    /**
     * Get the current player speed modifier
     * @returns {number} The current player speed modifier
     */
    getPlayerSpeedModifier() {
        return this.playerSpeedModifier;
    }

    /**
     * Set the player speed modifier
     * @param {number} modifier - The new player speed modifier
     * @returns {number} The updated player speed modifier
     */
    setPlayerSpeedModifier(modifier) {
        this.playerSpeedModifier = Math.max(
            this.minSpeedModifier,
            Math.min(this.maxSpeedModifier, modifier)
        );
        return this.playerSpeedModifier;
    }

    /**
     * Increase the player speed modifier
     * @returns {number} The updated player speed modifier
     */
    increasePlayerSpeed() {
        return this.setPlayerSpeedModifier(
            this.playerSpeedModifier + this.speedModifierStep
        );
    }

    /**
     * Decrease the player speed modifier
     * @returns {number} The updated player speed modifier
     */
    decreasePlayerSpeed() {
        return this.setPlayerSpeedModifier(
            this.playerSpeedModifier - this.speedModifierStep
        );
    }

    /**
     * Get the base speed for objects
     * @returns {number} The base speed in pixels per second
     */
    getBaseSpeed() {
        return this.baseSpeed;
    }

    /**
     * Set the base speed for objects
     * @param {number} speed - The new base speed in pixels per second
     * @returns {number} The updated base speed
     */
    setBaseSpeed(speed) {
        this.baseSpeed = Math.max(0, speed);
        return this.baseSpeed;
    }

    /**
     * Calculate the effective speed for an object
     * @param {number} objectSpeed - The object's own speed
     * @returns {number} The effective speed with player modifier applied
     */
    getEffectiveSpeed(objectSpeed) {
        return objectSpeed + (this.baseSpeed * this.playerSpeedModifier);
    }
}
