/**
 * Adapter for PlayerSoldierService to handle player actions
 */
import { PlayerSoldierService } from '../core/player-soldier-service.js';

export class PlayerAdapter {
    /**
     * Move player to a specific lane
     * @param {Entity} playerEntity - The player entity
     * @param {number} laneIndex - The target lane index
     * @returns {boolean} Whether the move was successful
     */
    static moveToLane(playerEntity, laneIndex) {
        if (!playerEntity) return false;
        
        try {
            // Call the original service method
            return PlayerSoldierService.moveToLane(playerEntity, laneIndex);
        } catch (error) {
            console.error('Error moving player to lane:', error);
            
            // Fallback implementation if the service method fails
            try {
                const lane = playerEntity.getComponent('lane');
                if (!lane) return false;
                
                // Update lane index
                lane.laneIndex = laneIndex;
                
                // Update transform component to match lane position
                const transform = playerEntity.getComponent('transform');
                if (transform) {
                    // Assuming lane height of 60 pixels
                    transform.y = laneIndex * 60 + 30; // Center in lane
                }
                
                return true;
            } catch (fallbackError) {
                console.error('Fallback implementation failed:', fallbackError);
                return false;
            }
        }
    }
    
    /**
     * Add a soldier to the player
     * @param {EntityManager} entityManager - The entity manager
     * @param {Entity} playerEntity - The player entity
     * @param {Object} config - Additional configuration
     * @returns {Entity} The created soldier entity
     */
    static addSoldier(entityManager, playerEntity, config = {}) {
        if (!playerEntity || !entityManager) return null;
        
        try {
            // Call the original service method
            return PlayerSoldierService.addSoldier(entityManager, playerEntity, config);
        } catch (error) {
            console.error('Error adding soldier:', error);
            return null;
        }
    }
    
    /**
     * Remove a soldier from the player
     * @param {EntityManager} entityManager - The entity manager
     * @param {Entity} playerEntity - The player entity
     * @param {Entity} soldierEntity - The soldier entity to remove
     * @returns {boolean} Whether the removal was successful
     */
    static removeSoldier(entityManager, playerEntity, soldierEntity) {
        if (!playerEntity || !entityManager || !soldierEntity) return false;
        
        try {
            // Call the original service method
            return PlayerSoldierService.removeSoldier(entityManager, playerEntity, soldierEntity);
        } catch (error) {
            console.error('Error removing soldier:', error);
            return false;
        }
    }
    
    /**
     * Throw a grenade
     * @param {EntityManager} entityManager - The entity manager
     * @param {Entity} playerEntity - The player entity
     * @param {string} grenadeType - The grenade type
     * @returns {Entity} The created grenade entity
     */
    static throwGrenade(entityManager, playerEntity, grenadeType) {
        if (!playerEntity || !entityManager) return null;
        
        try {
            // Call the original service method
            return PlayerSoldierService.throwGrenade(entityManager, playerEntity, grenadeType);
        } catch (error) {
            console.error('Error throwing grenade:', error);
            return null;
        }
    }
    
    /**
     * Get all soldiers for a player
     * @param {EntityManager} entityManager - The entity manager
     * @param {Entity} playerEntity - The player entity
     * @returns {Array} Array of soldier entities
     */
    static getSoldiers(entityManager, playerEntity) {
        if (!playerEntity || !entityManager) return [];
        
        try {
            // Call the original service method
            return PlayerSoldierService.getSoldiers(entityManager, playerEntity);
        } catch (error) {
            console.error('Error getting soldiers:', error);
            return [];
        }
    }
}