/**
 * Event Bus
 * 
 * Implements the Observer pattern for system communication.
 * Allows systems to publish events and subscribe to events
 * without direct dependencies between them.
 */

export class EventBus {
    /**
     * Create a new EventBus instance
     */
    constructor() {
        // Map of event types to arrays of subscribers
        this.subscribers = new Map();
        
        // Counter for generating unique subscription IDs
        this.subscriptionIdCounter = 0;
    }

    /**
     * Subscribe to an event
     * @param {string} eventType - The type of event to subscribe to
     * @param {Function} callback - Function to call when the event is published
     * @returns {number} Subscription ID that can be used to unsubscribe
     */
    subscribe(eventType, callback) {
        if (typeof eventType !== 'string' || !eventType) {
            throw new Error('Event type must be a non-empty string');
        }
        
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        
        // Get or create the array of subscribers for this event type
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        
        // Generate a unique ID for this subscription
        const id = this.subscriptionIdCounter++;
        
        // Add the subscriber
        this.subscribers.get(eventType).push({
            id: id,
            callback: callback
        });
        
        return id;
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventType - The type of event to unsubscribe from
     * @param {number} subscriptionId - The subscription ID returned from subscribe
     * @returns {boolean} True if the subscription was found and removed, false otherwise
     */
    unsubscribe(eventType, subscriptionId) {
        if (!this.subscribers.has(eventType)) {
            return false;
        }
        
        const subscribers = this.subscribers.get(eventType);
        const initialLength = subscribers.length;
        
        // Filter out the subscription with the given ID
        const filteredSubscribers = subscribers.filter(sub => sub.id !== subscriptionId);
        
        // Update the subscribers array
        this.subscribers.set(eventType, filteredSubscribers);
        
        // Return true if a subscription was removed
        return filteredSubscribers.length < initialLength;
    }

    /**
     * Publish an event
     * @param {string} eventType - The type of event to publish
     * @param {Object} eventData - Data to pass to subscribers
     */
    publish(eventType, eventData = {}) {
        if (!this.subscribers.has(eventType)) {
            return; // No subscribers for this event type
        }
        
        const subscribers = this.subscribers.get(eventType);
        
        // Call each subscriber's callback with the event data
        for (const subscriber of subscribers) {
            try {
                subscriber.callback(eventData);
            } catch (error) {
                console.error(`Error in event subscriber for '${eventType}':`, error);
            }
        }
    }

    /**
     * Check if an event type has subscribers
     * @param {string} eventType - The event type to check
     * @returns {boolean} True if the event type has subscribers, false otherwise
     */
    hasSubscribers(eventType) {
        return this.subscribers.has(eventType) && this.subscribers.get(eventType).length > 0;
    }

    /**
     * Get the number of subscribers for an event type
     * @param {string} eventType - The event type to check
     * @returns {number} The number of subscribers
     */
    getSubscriberCount(eventType) {
        if (!this.subscribers.has(eventType)) {
            return 0;
        }
        
        return this.subscribers.get(eventType).length;
    }

    /**
     * Clear all subscribers for an event type
     * @param {string} eventType - The event type to clear
     * @returns {boolean} True if subscribers were cleared, false if none existed
     */
    clearEventSubscribers(eventType) {
        if (!this.subscribers.has(eventType)) {
            return false;
        }
        
        this.subscribers.set(eventType, []);
        return true;
    }

    /**
     * Clear all subscribers for all event types
     */
    clearAllSubscribers() {
        this.subscribers.clear();
    }

    /**
     * Clean up resources when the event bus is destroyed
     */
    destroy() {
        this.clearAllSubscribers();
    }
}
