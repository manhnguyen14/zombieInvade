/**
 * Collision Group Manager
 *
 * Manages collision groups for entities that are colliding with each other.
 * Calculates group speeds based on weighted averages of entity speeds and weights.
 */
import {ServiceLocator} from "./service-locator.js";

export class CollisionGroupManager {
    /**
     * Create a new CollisionGroupManager instance
     */
    constructor() {
        // Map of group ID to array of entity IDs in that group
        this.groups = new Map();
        
        // Counter for generating unique group IDs
        this.nextGroupId = 1;
        
        // Debug flag
        this.debug = false;
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether debug mode should be enabled
     */
    setDebug(enabled) {
        this.debug = enabled;
    }
    
    /**
     * Generate a unique group ID
     * @returns {string} A unique group ID
     * @private
     */
    _generateGroupId() {
        return `group_${this.nextGroupId++}`;
    }
    
    /**
     * Create a new collision group with the given entities
     * @param {Array<Entity>} entities - The entities to add to the group
     * @returns {string} The ID of the new group
     */
    createGroup(entities) {
        if (!entities || entities.length < 2) {
            if (this.debug) {
                console.log('[COLLISION_GROUP_MANAGER] Cannot create group with fewer than 2 entities');
            }
            return null;
        }
        
        const groupId = this._generateGroupId();
        
        // Create a new group with the entity IDs
        this.groups.set(groupId, entities.map(entity => entity.id));
        
        // Update each entity's movement component with the group ID
        for (const entity of entities) {
            const movement = entity.getComponent('movement');
            if (movement) {
                movement.setCollisionGroupId(groupId);
            }
        }
        
        // Calculate and set the group speed
        this.updateGroupSpeed(groupId, entities);
        console.log(`[COLLISION_GROUP_MANAGER] Created group ${groupId} with ${entities.length} entities`);
        return groupId;
    }
    
    /**
     * Add an entity to an existing group
     * @param {string} groupId - The ID of the group to add the entity to
     * @param {Entity} entity - The entity to add
     * @returns {boolean} True if the entity was added, false otherwise
     */
    addEntityToGroup(groupId, entity) {
        if (!groupId || !entity) {
            return false;
        }
        
        // Check if the group exists
        if (!this.groups.has(groupId)) {
            if (this.debug) {
                console.log(`[COLLISION_GROUP_MANAGER] Group ${groupId} does not exist`);
            }
            return false;
        }
        
        // Check if the entity is already in the group
        const entityIds = this.groups.get(groupId);
        if (entityIds.includes(entity.id)) {
            return false;
        }
        
        // Add the entity to the group
        entityIds.push(entity.id);
        
        // Update the entity's movement component
        const movement = entity.getComponent('movement');
        if (movement) {
            movement.setCollisionGroupId(groupId);
        }
        
        // Get all entities in the group
        const entityManager = this._getEntityManager();
        if (entityManager) {
            const entities = entityIds.map(id => entityManager.getEntity(id)).filter(e => e);
            
            // Update the group speed
            this.updateGroupSpeed(groupId, entities);
        }
        
        if (this.debug) {
            console.log(`[COLLISION_GROUP_MANAGER] Added entity ${entity.id} to group ${groupId}`);
        }
        
        return true;
    }
    
    /**
     * Remove an entity from its group
     * @param {Entity} entity - The entity to remove
     * @returns {boolean} True if the entity was removed, false otherwise
     */
    removeEntityFromGroup(entity) {
        if (!entity) {
            return false;
        }
        
        const movement = entity.getComponent('movement');
        if (!movement) {
            return false;
        }
        
        const groupId = movement.getCollisionGroupId();
        if (!groupId || !this.groups.has(groupId)) {
            return false;
        }
        
        // Get the entity IDs in the group
        const entityIds = this.groups.get(groupId);
        
        // Remove the entity from the group
        const index = entityIds.indexOf(entity.id);
        if (index === -1) {
            return false;
        }
        
        entityIds.splice(index, 1);
        
        // Update the entity's movement component
        movement.setCollisionGroupId(null);
        movement.setGroupSpeed(null);
        
        // If the group is now empty or has only one entity, remove it
        if (entityIds.length <= 1) {
            if (entityIds.length === 1) {
                // If there's one entity left, remove it from the group
                const lastEntityId = entityIds[0];
                const entityManager = entity.entityManager;
                const lastEntity = entityManager.getEntity(lastEntityId);
                if (lastEntity) {
                    const lastMovement = lastEntity.getComponent('movement');
                    if (lastMovement) {
                        lastMovement.setCollisionGroupId(null);
                        lastMovement.setGroupSpeed(null);
                    }
                }
            }
            
            // Remove the group
            this.groups.delete(groupId);
            
            if (this.debug) {
                console.log(`[COLLISION_GROUP_MANAGER] Removed group ${groupId} (too few entities)`);
            }
        } else {
            // Update the group speed for the remaining entities
            const entityManager = entity.entityManager;
            const remainingEntities = entityIds.map(id => entityManager.getEntity(id)).filter(e => e);
            this.updateGroupSpeed(groupId, remainingEntities);
            
            if (this.debug) {
                console.log(`[COLLISION_GROUP_MANAGER] Removed entity ${entity.id} from group ${groupId}`);
            }
        }
        
        return true;
    }
    
    /**
     * Merge two collision groups
     * @param {string} groupId1 - The ID of the first group
     * @param {string} groupId2 - The ID of the second group
     * @returns {string} The ID of the merged group (will be groupId1)
     */
    mergeGroups(groupId1, groupId2) {
        if (!groupId1 || !groupId2 || groupId1 === groupId2) {
            return groupId1;
        }
        
        // Check if both groups exist
        if (!this.groups.has(groupId1) || !this.groups.has(groupId2)) {
            if (this.debug) {
                console.log(`[COLLISION_GROUP_MANAGER] Cannot merge groups: one or both groups do not exist`);
            }
            return groupId1;
        }
        
        // Get the entity IDs from both groups
        const entityIds1 = this.groups.get(groupId1);
        const entityIds2 = this.groups.get(groupId2);
        
        // Merge the entity IDs (avoiding duplicates)
        for (const entityId of entityIds2) {
            if (!entityIds1.includes(entityId)) {
                entityIds1.push(entityId);
            }
        }
        
        // Update the entities from group 2 to be in group 1
        const entityManager = this._getEntityManager();
        if (entityManager) {
            for (const entityId of entityIds2) {
                const entity = entityManager.getEntity(entityId);
                if (entity) {
                    const movement = entity.getComponent('movement');
                    if (movement) {
                        movement.setCollisionGroupId(groupId1);
                    }
                }
            }
            
            // Get all entities in the merged group
            const entities = entityIds1.map(id => entityManager.getEntity(id)).filter(e => e);
            
            // Update the group speed
            this.updateGroupSpeed(groupId1, entities);
        }
        
        // Remove group 2
        this.groups.delete(groupId2);
        
        if (this.debug) {
            console.log(`[COLLISION_GROUP_MANAGER] Merged group ${groupId2} into group ${groupId1}`);
        }
        
        return groupId1;
    }
    
    /**
     * Update the speed of a collision group based on weighted average
     * @param {string} groupId - The ID of the group to update
     * @param {Array<Entity>} entities - The entities in the group
     */
    updateGroupSpeed(groupId, entities) {
        if (!groupId || !entities || entities.length === 0) {
            return;
        }
        
        let totalWeightedSpeed = 0;
        let totalWeight = 0;
        
        // Calculate weighted average speed
        for (const entity of entities) {
            const movement = entity.getComponent('movement');
            if (movement) {
                const weight = movement.getWeight();
                const speed = movement.speed; // Use innate speed, not effective speed
                
                totalWeightedSpeed += speed * weight;
                totalWeight += weight;
                
                if (this.debug) {
                    console.log(`[COLLISION_GROUP_MANAGER] Entity ${entity.id}: speed=${speed}, weight=${weight}`);
                }
            }
        }
        
        // Calculate group speed
        const groupSpeed = totalWeight > 0 ? totalWeightedSpeed / totalWeight : 0;
        
        if (this.debug) {
            console.log(`[COLLISION_GROUP_MANAGER] Group ${groupId} speed: ${groupSpeed} (total weight: ${totalWeight})`);
        }
        
        // Update each entity's movement component with the group speed
        for (const entity of entities) {
            const movement = entity.getComponent('movement');
            if (movement) {
                movement.setGroupSpeed(groupSpeed);
            }
        }
    }
    
    /**
     * Check if an entity is in a collision group
     * @param {Entity} entity - The entity to check
     * @returns {boolean} True if the entity is in a group, false otherwise
     */
    isEntityInGroup(entity) {
        if (!entity) {
            return false;
        }
        
        const movement = entity.getComponent('movement');
        if (!movement) {
            return false;
        }
        
        const groupId = movement.getCollisionGroupId();
        return groupId !== null && this.groups.has(groupId);
    }
    
    /**
     * Get the collision group an entity belongs to
     * @param {Entity} entity - The entity to check
     * @returns {string|null} The group ID or null if the entity is not in a group
     */
    getEntityGroupId(entity) {
        if (!entity) {
            return null;
        }
        
        const movement = entity.getComponent('movement');
        if (!movement) {
            return null;
        }
        
        const groupId = movement.getCollisionGroupId();
        return groupId !== null && this.groups.has(groupId) ? groupId : null;
    }
    
    /**
     * Get all entities in a collision group
     * @param {string} groupId - The ID of the group
     * @returns {Array<Entity>} The entities in the group
     */
    getEntitiesInGroup(groupId) {
        if (!groupId || !this.groups.has(groupId)) {
            return [];
        }
        
        const entityIds = this.groups.get(groupId);
        const entityManager = this._getEntityManager();
        if (!entityManager) {
            return [];
        }
        
        return entityIds.map(id => entityManager.getEntity(id)).filter(e => e);
    }
    
    /**
     * Get all collision groups
     * @returns {Map<string, Array<string>>} Map of group ID to array of entity IDs
     */
    getAllGroups() {
        return new Map(this.groups);
    }
    
    /**
     * Check if two entities are in the same collision group
     * @param {Entity} entity1 - The first entity
     * @param {Entity} entity2 - The second entity
     * @returns {boolean} True if the entities are in the same group, false otherwise
     */
    areEntitiesInSameGroup(entity1, entity2) {
        if (!entity1 || !entity2) {
            return false;
        }
        
        const movement1 = entity1.getComponent('movement');
        const movement2 = entity2.getComponent('movement');
        if (!movement1 || !movement2) {
            return false;
        }
        
        const groupId1 = movement1.getCollisionGroupId();
        const groupId2 = movement2.getCollisionGroupId();
        return groupId1 !== null && groupId1 === groupId2;
    }
    
    /**
     * Check if a collision group needs to be split
     * @param {string} groupId - The ID of the group to check
     * @returns {boolean} True if the group needs to be split, false otherwise
     */
    doesGroupNeedSplit(groupId) {
        if (!groupId || !this.groups.has(groupId)) {
            return false;
        }
        
        const entityIds = this.groups.get(groupId);
        if (entityIds.length <= 1) {
            return false;
        }
        
        const entityManager = this._getEntityManager();
        if (!entityManager) {
            return false;
        }
        
        const entities = entityIds.map(id => entityManager.getEntity(id)).filter(e => e);
        
        // Build a graph of collisions within the group
        const graph = this._buildCollisionGraph(entities);
        
        // Check if the graph is fully connected
        return !this._isFullyConnected(graph, entities);
    }
    
    /**
     * Split a collision group into connected components
     * @param {string} groupId - The ID of the group to split
     * @returns {Array<string>} Array of new group IDs
     */
    splitGroup(groupId) {
        if (!groupId || !this.groups.has(groupId)) {
            return [];
        }
        
        const entityIds = this.groups.get(groupId);
        if (entityIds.length <= 1) {
            return [groupId];
        }
        
        const entityManager = this._getEntityManager();
        if (!entityManager) {
            return [groupId];
        }
        
        const entities = entityIds.map(id => entityManager.getEntity(id)).filter(e => e);
        
        // Build a graph of collisions within the group
        const graph = this._buildCollisionGraph(entities);
        
        // Find connected components
        const components = this._findConnectedComponents(graph, entities);
        
        if (components.length <= 1) {
            // Group is already fully connected
            return [groupId];
        }
        
        // Create new groups for each component
        const newGroupIds = [];
        
        for (const component of components) {
            if (component.length >= 2) {
                // Create a new group for this component
                const newGroupId = this.createGroup(component);
                newGroupIds.push(newGroupId);
            } else if (component.length === 1) {
                // Single entity, restore original speed
                const entity = component[0];
                const movement = entity.getComponent('movement');
                if (movement) {
                    movement.setCollisionGroupId(null);
                    movement.setGroupSpeed(null);
                }
            }
        }
        
        // Remove the original group
        this.groups.delete(groupId);
        
        if (this.debug) {
            console.log(`[COLLISION_GROUP_MANAGER] Split group ${groupId} into ${newGroupIds.length} new groups`);
        }
        
        return newGroupIds;
    }
    
    /**
     * Build a graph of collisions within a group
     * @param {Array<Entity>} entities - The entities in the group
     * @returns {Map<string, Set<string>>} Map of entity ID to set of connected entity IDs
     * @private
     */
    _buildCollisionGraph(entities) {
        const graph = new Map();
        
        // Initialize graph with empty adjacency lists
        for (const entity of entities) {
            graph.set(entity.id, new Set());
        }
        
        // Fill in adjacency lists based on collisions
        for (const entity of entities) {
            const movement = entity.getComponent('movement');
            if (movement) {
                const collidingEntities = movement.getCollidingEntities();
                const adjacencyList = graph.get(entity.id);
                
                for (const collidingId of collidingEntities) {
                    // Only add edges for entities that are in the group
                    if (graph.has(collidingId)) {
                        adjacencyList.add(collidingId);
                        
                        // Add the reverse edge (undirected graph)
                        const reverseList = graph.get(collidingId);
                        if (reverseList) {
                            reverseList.add(entity.id);
                        }
                    }
                }
            }
        }
        
        return graph;
    }
    
    /**
     * Check if a graph is fully connected
     * @param {Map<string, Set<string>>} graph - The graph to check
     * @param {Array<Entity>} entities - The entities in the graph
     * @returns {boolean} True if the graph is fully connected, false otherwise
     * @private
     */
    _isFullyConnected(graph, entities) {
        if (entities.length <= 1) {
            return true;
        }
        
        // Perform BFS from the first entity
        const startId = entities[0].id;
        const visited = new Set([startId]);
        const queue = [startId];
        
        while (queue.length > 0) {
            const currentId = queue.shift();
            const neighbors = graph.get(currentId);
            
            for (const neighborId of neighbors) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push(neighborId);
                }
            }
        }
        
        // Check if all entities were visited
        return visited.size === entities.length;
    }
    
    /**
     * Find connected components in a graph
     * @param {Map<string, Set<string>>} graph - The graph to check
     * @param {Array<Entity>} entities - The entities in the graph
     * @returns {Array<Array<Entity>>} Array of connected components (each an array of entities)
     * @private
     */
    _findConnectedComponents(graph, entities) {
        const components = [];
        const visited = new Set();
        
        for (const entity of entities) {
            if (!visited.has(entity.id)) {
                // Start a new component
                const component = [];
                const queue = [entity];
                
                while (queue.length > 0) {
                    const currentEntity = queue.shift();
                    const currentId = currentEntity.id;
                    
                    if (!visited.has(currentId)) {
                        visited.add(currentId);
                        component.push(currentEntity);
                        
                        const neighbors = graph.get(currentId);
                        for (const neighborId of neighbors) {
                            const neighborEntity = entities.find(e => e.id === neighborId);
                            if (neighborEntity && !visited.has(neighborId)) {
                                queue.push(neighborEntity);
                            }
                        }
                    }
                }
                
                components.push(component);
            }
        }
        
        return components;
    }
    
    /**
     * Get the entity manager from the service locator
     * @private
     * @returns {EntityManager|null} The entity manager or null if not found
     */
    _getEntityManager() {
        return ServiceLocator.getService('entityManager');
    }
    
    /**
     * Clear all collision groups
     */
    clear() {
        this.groups.clear();
        this.nextGroupId = 1;
    }

    /**
     * Get all entity IDs in a collision group
     * @param {string} groupId - The ID of the group
     * @returns {Array<string>|null} Array of entity IDs in the group, or null if group doesn't exist
     */
    getGroup(groupId) {
        if (!groupId || !this.groups.has(groupId)) {
            return null;
        }
        
        return this.groups.get(groupId);
    }
}
