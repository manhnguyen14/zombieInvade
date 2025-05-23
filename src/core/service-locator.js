/**
 * Service Locator
 * 
 * Implements the Service Locator pattern to provide a central registry for core services.
 * This pattern decouples systems from specific service implementations, making the code
 * more modular and easier to test.
 */

class ServiceLocator {
    /**
     * Private static field to store services
     * @private
     */
    static #services = new Map();

    /**
     * Register a service with the locator
     * @param {string} name - The name of the service
     * @param {Object} service - The service instance
     */
    static registerService(name, service) {
        if (!name || typeof name !== 'string') {
            throw new Error('Service name must be a non-empty string');
        }

        if (!service) {
            throw new Error(`Cannot register null or undefined service for '${name}'`);
        }

        ServiceLocator.#services.set(name, service);
    }

    /**
     * Get a service from the locator
     * @param {string} name - The name of the service to retrieve
     * @returns {Object} The requested service
     * @throws {Error} If the service is not found
     */
    static getService(name) {
        if (!ServiceLocator.#services.has(name)) {
            throw new Error(`Service '${name}' not found in ServiceLocator`);
        }

        return ServiceLocator.#services.get(name);
    }

    /**
     * Check if a service exists in the locator
     * @param {string} name - The name of the service to check
     * @returns {boolean} True if the service exists, false otherwise
     */
    static hasService(name) {
        return ServiceLocator.#services.has(name);
    }

    /**
     * Remove a service from the locator
     * @param {string} name - The name of the service to remove
     * @returns {boolean} True if the service was removed, false if it didn't exist
     */
    static removeService(name) {
        return ServiceLocator.#services.delete(name);
    }

    /**
     * Clear all services from the locator
     * Useful for testing and resetting the application state
     */
    static clearServices() {
        ServiceLocator.#services.clear();
    }
}

export { ServiceLocator };