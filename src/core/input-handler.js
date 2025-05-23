/**
 * InputHandler Class
 * 
 * Handles keyboard and touch input for the game.
 * Provides methods for detecting key presses, key releases, and touch events.
 * Uses an event-based system to track input state.
 */

export class InputHandler {
    /**
     * Create a new InputHandler instance
     */
    constructor() {
        // Track pressed keys
        this.keys = new Map();
        
        // Track key states for single-press detection
        this.keyStates = new Map();
        
        // Track touch positions
        this.touchPositions = [];
        
        // Track if touch is active
        this.isTouching = false;
        
        // Bind event handlers
        this._bindEventListeners();

    }

    /**
     * Bind event listeners for keyboard and touch events
     * @private
     */
    _bindEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', this._handleKeyDown.bind(this));
        window.addEventListener('keyup', this._handleKeyUp.bind(this));
        
        // Touch events
        window.addEventListener('touchstart', this._handleTouchStart.bind(this));
        window.addEventListener('touchmove', this._handleTouchMove.bind(this));
        window.addEventListener('touchend', this._handleTouchEnd.bind(this));
        
        // Prevent context menu on right-click
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - The keydown event
     * @private
     */
    _handleKeyDown(event) {
        // Store the key state
        this.keys.set(event.code, true);
        
        // For single-press detection
        if (!this.keyStates.has(event.code) || this.keyStates.get(event.code) === 'released') {
            this.keyStates.set(event.code, 'pressed');
        }
    }

    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - The keyup event
     * @private
     */
    _handleKeyUp(event) {
        // Update the key state
        this.keys.set(event.code, false);
        
        // For single-press detection
        this.keyStates.set(event.code, 'released');
    }

    /**
     * Handle touchstart events
     * @param {TouchEvent} event - The touchstart event
     * @private
     */
    _handleTouchStart(event) {
        event.preventDefault();
        this.isTouching = true;
        
        // Store touch positions
        this.touchPositions = Array.from(event.touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY
        }));
    }

    /**
     * Handle touchmove events
     * @param {TouchEvent} event - The touchmove event
     * @private
     */
    _handleTouchMove(event) {
        event.preventDefault();
        
        // Update touch positions
        this.touchPositions = Array.from(event.touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY
        }));
    }

    /**
     * Handle touchend events
     * @param {TouchEvent} event - The touchend event
     * @private
     */
    _handleTouchEnd(event) {
        event.preventDefault();
        
        // Remove ended touches
        const activeIds = Array.from(event.touches).map(touch => touch.identifier);
        this.touchPositions = this.touchPositions.filter(touch => 
            activeIds.includes(touch.id)
        );
        
        // Update touching state
        this.isTouching = this.touchPositions.length > 0;
    }

    /**
     * Check if a key is currently pressed
     * @param {string} keyCode - The key code to check
     * @returns {boolean} True if the key is pressed, false otherwise
     */
    isKeyPressed(keyCode) {
        return this.keys.get(keyCode) === true;
    }

    /**
     * Check if a key was just pressed (single press detection)
     * Only returns true once per key press
     * @param {string} keyCode - The key code to check
     * @returns {boolean} True if the key was just pressed, false otherwise
     */
    wasKeyJustPressed(keyCode) {
        if (this.keyStates.get(keyCode) === 'pressed') {
            this.keyStates.set(keyCode, 'held');
            return true;
        }
        return false;
    }

    /**
     * Check if a key was just released
     * Only returns true once per key release
     * @param {string} keyCode - The key code to check
     * @returns {boolean} True if the key was just released, false otherwise
     */
    wasKeyJustReleased(keyCode) {
        if (this.keyStates.get(keyCode) === 'released') {
            this.keyStates.set(keyCode, 'up');
            return true;
        }
        return false;
    }

    /**
     * Get all current touch positions
     * @returns {Array} Array of touch position objects with x, y, and id properties
     */
    getTouchPositions() {
        return [...this.touchPositions];
    }

    /**
     * Check if the screen is currently being touched
     * @returns {boolean} True if touching, false otherwise
     */
    isTouchActive() {
        return this.isTouching;
    }

    /**
     * Get the primary touch position (first touch)
     * @returns {Object|null} Touch position object with x and y properties, or null if not touching
     */
    getPrimaryTouchPosition() {
        return this.touchPositions.length > 0 ? { ...this.touchPositions[0] } : null;
    }

    /**
     * Update method called each frame to update input states
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // This method is required by the game loop
        // Currently empty as state updates are handled by event listeners
    }

    /**
     * Clean up event listeners when the input handler is destroyed
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('keydown', this._handleKeyDown);
        window.removeEventListener('keyup', this._handleKeyUp);
        window.removeEventListener('touchstart', this._handleTouchStart);
        window.removeEventListener('touchmove', this._handleTouchMove);
        window.removeEventListener('touchend', this._handleTouchEnd);
        window.removeEventListener('contextmenu', (e) => e.preventDefault());
        
        // Clear data
        this.keys.clear();
        this.keyStates.clear();
        this.touchPositions = [];

    }
}