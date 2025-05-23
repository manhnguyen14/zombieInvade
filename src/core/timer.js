/**
 * Timer Class
 * 
 * Manages game timing, provides methods for tracking elapsed time,
 * creating timers, and scheduling events.
 */

export class Timer {
    /**
     * Create a new Timer instance
     */
    constructor() {
        // Total elapsed time since timer creation (in seconds)
        this.totalTime = 0;
        
        // Collection of active timers
        this.timers = new Map();
        
        // Counter for generating unique timer IDs
        this.timerIdCounter = 0;
        
        console.log('Timer initialized');
    }

    /**
     * Update the timer state
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Update total elapsed time
        this.totalTime += deltaTime;
        
        // Update and process all active timers
        this._updateTimers(deltaTime);
    }

    /**
     * Update all active timers
     * @param {number} deltaTime - Time elapsed since last update in seconds
     * @private
     */
    _updateTimers(deltaTime) {
        // Process each timer
        for (const [id, timer] of this.timers.entries()) {
            // Update remaining time
            timer.remaining -= deltaTime;
            
            // Check if timer has completed
            if (timer.remaining <= 0) {
                // Execute callback
                try {
                    timer.callback();
                } catch (error) {
                    console.error(`Error in timer callback (ID: ${id}):`, error);
                }
                
                // Handle repeating timers
                if (timer.repeat) {
                    // Reset timer
                    timer.remaining = timer.duration;
                } else {
                    // Remove completed non-repeating timer
                    this.timers.delete(id);
                }
            }
        }
    }

    /**
     * Create a new timer
     * @param {number} duration - Duration in seconds
     * @param {Function} callback - Function to call when timer completes
     * @param {boolean} repeat - Whether the timer should repeat
     * @returns {number} Timer ID that can be used to cancel the timer
     */
    createTimer(duration, callback, repeat = false) {
        if (typeof duration !== 'number' || duration <= 0) {
            throw new Error('Timer duration must be a positive number');
        }
        
        if (typeof callback !== 'function') {
            throw new Error('Timer callback must be a function');
        }
        
        // Generate a unique ID for this timer
        const id = this.timerIdCounter++;
        
        // Create and store the timer
        this.timers.set(id, {
            duration: duration,
            remaining: duration,
            callback: callback,
            repeat: repeat
        });
        
        return id;
    }

    /**
     * Cancel a timer by ID
     * @param {number} id - Timer ID to cancel
     * @returns {boolean} True if the timer was found and cancelled, false otherwise
     */
    cancelTimer(id) {
        return this.timers.delete(id);
    }

    /**
     * Check if a timer is active
     * @param {number} id - Timer ID to check
     * @returns {boolean} True if the timer is active, false otherwise
     */
    isTimerActive(id) {
        return this.timers.has(id);
    }

    /**
     * Get the remaining time for a timer
     * @param {number} id - Timer ID to check
     * @returns {number|null} Remaining time in seconds, or null if timer not found
     */
    getTimerRemaining(id) {
        const timer = this.timers.get(id);
        return timer ? timer.remaining : null;
    }

    /**
     * Create a one-shot timer (convenience method)
     * @param {number} duration - Duration in seconds
     * @param {Function} callback - Function to call when timer completes
     * @returns {number} Timer ID that can be used to cancel the timer
     */
    setTimeout(duration, callback) {
        return this.createTimer(duration, callback, false);
    }

    /**
     * Create a repeating timer (convenience method)
     * @param {number} interval - Interval in seconds
     * @param {Function} callback - Function to call when timer completes
     * @returns {number} Timer ID that can be used to cancel the timer
     */
    setInterval(interval, callback) {
        return this.createTimer(interval, callback, true);
    }

    /**
     * Cancel a timeout (convenience method)
     * @param {number} id - Timer ID to cancel
     * @returns {boolean} True if the timer was found and cancelled, false otherwise
     */
    clearTimeout(id) {
        return this.cancelTimer(id);
    }

    /**
     * Cancel an interval (convenience method)
     * @param {number} id - Timer ID to cancel
     * @returns {boolean} True if the timer was found and cancelled, false otherwise
     */
    clearInterval(id) {
        return this.cancelTimer(id);
    }

    /**
     * Get the total elapsed time since timer creation
     * @returns {number} Total elapsed time in seconds
     */
    getTotalTime() {
        return this.totalTime;
    }

    /**
     * Reset the total elapsed time to zero
     */
    resetTotalTime() {
        this.totalTime = 0;
    }

    /**
     * Get the count of active timers
     * @returns {number} Number of active timers
     */
    getActiveTimerCount() {
        return this.timers.size;
    }

    /**
     * Cancel all active timers
     */
    cancelAllTimers() {
        this.timers.clear();
        console.log('All timers cancelled');
    }

    /**
     * Clean up resources when the timer is destroyed
     */
    destroy() {
        this.cancelAllTimers();
        console.log('Timer destroyed');
    }
}