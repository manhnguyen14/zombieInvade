/**
 * Entity Manager
 * Handles entity creation, deletion, and management
 */
export class EntityManager {
    constructor(editor) {
        this.editor = editor;
    }
    
    // Show dialog to add a new entity
    showAddEntityDialog() {
        if (!this.editor.currentMap) {
            alert('Please create or select a map first');
            return;
        }
        
        // Use the current entity selection values from the UI
        const type = this.editor.ui.selectedEntityType;
        const objectType = this.editor.ui.selectedObjectType;
        const variant = this.editor.ui.selectedVariant;
        
        console.log(`Selected entity from UI: ${type} (${objectType}, ${variant})`);
        
        // Determine appropriate lane based on entity type
        const lane = type === 'bonus' ? 0 : 1;
        const position = this.editor.viewportOffset + Math.floor(this.editor.gameWidth / 2);
        
        // Check if embedded bonus is enabled
        let embeddedBonus = null;
        const embedBonusCheckbox = document.getElementById('embed-bonus-checkbox');
        if (embedBonusCheckbox && embedBonusCheckbox.checked) {
            const bonusType = document.getElementById('embed-bonus-type-select').value;
            const bonusVariant = document.getElementById('embed-bonus-variant-select').value;
            
            embeddedBonus = {
                type: bonusType,
                variant: bonusVariant
            };
        }
        
        // Add entity with current selection
        this.editor.addEntity(
            type,
            objectType,
            variant,
            lane,
            position,
            embeddedBonus
        );
        
        // Center viewport on the new entity
        this.editor.centerViewportOnEntity(this.editor.selectedEntity);
    }
    
    // Get entity by ID
    getEntityById(id) {
        if (!this.editor.currentMap) return null;
        
        return this.editor.currentMap.objects.find(entity => entity.id === id);
    }
    
    // Get entities by type
    getEntitiesByType(type) {
        if (!this.editor.currentMap) return [];
        
        return this.editor.currentMap.objects.filter(entity => entity.type === type);
    }
    
    // Get entities in lane
    getEntitiesInLane(lane) {
        if (!this.editor.currentMap) return [];
        
        return this.editor.currentMap.objects.filter(entity => entity.lane === lane);
    }
    
    // Get entities in position range
    getEntitiesInPositionRange(startPosition, endPosition) {
        if (!this.editor.currentMap) return [];
        
        return this.editor.currentMap.objects.filter(entity => 
            entity.position >= startPosition && entity.position <= endPosition
        );
    }
    
    // Create a spawn zone
    createSpawnZone() {
        if (!this.editor.currentMap) {
            alert('Please create or select a map first');
            return;
        }
        
        // Get spawn zone parameters from user
        const startPosition = parseInt(prompt('Enter start position:'));
        if (isNaN(startPosition)) return;
        
        const endPosition = parseInt(prompt('Enter end position:'));
        if (isNaN(endPosition)) return;
        
        const spawnFrequency = parseFloat(prompt('Enter spawn frequency (seconds):'));
        if (isNaN(spawnFrequency)) return;
        
        const spawnCount = parseInt(prompt('Enter spawn count:'));
        if (isNaN(spawnCount)) return;
        
        // Create lanes array
        const lanesInput = prompt('Enter lanes (comma-separated, e.g. 1,2,3):');
        if (!lanesInput) return;
        
        const lanes = lanesInput.split(',').map(lane => parseInt(lane.trim())).filter(lane => !isNaN(lane));
        
        if (lanes.length === 0) {
            alert('Please enter at least one valid lane');
            return;
        }
        
        // Validate lanes
        for (const lane of lanes) {
            if (lane < 1 || lane >= this.editor.laneCount) {
                alert(`Lane ${lane} is invalid. Lanes must be between 1 and ${this.editor.laneCount - 1}`);
                return;
            }
        }
        
        // Get entity types for spawn zone
        const entityTypesInput = prompt('Enter entity types (comma-separated, e.g. Normal,Armored):');
        if (!entityTypesInput) return;
        
        const entityTypes = entityTypesInput.split(',').map(type => type.trim()).filter(type => type);
        
        if (entityTypes.length === 0) {
            alert('Please enter at least one entity type');
            return;
        }
        
        // Create spawn zone
        const spawnZone = {
            type: 'enemy',
            startPosition,
            endPosition,
            lanes,
            spawnFrequency,
            spawnCount,
            possibleEntities: entityTypes.map(type => {
                return {
                    objectType: type,
                    variant: 'Standard',
                    weight: 10
                };
            })
        };
        
        // Add spawn zone to map
        if (!this.editor.currentMap.spawnZones) {
            this.editor.currentMap.spawnZones = [];
        }
        
        this.editor.currentMap.spawnZones.push(spawnZone);
        
        // Update UI
        alert('Spawn zone created successfully');
    }
    
    // Delete a spawn zone
    deleteSpawnZone(index) {
        if (!this.editor.currentMap || !this.editor.currentMap.spawnZones) return;
        
        if (index >= 0 && index < this.editor.currentMap.spawnZones.length) {
            this.editor.currentMap.spawnZones.splice(index, 1);
            alert('Spawn zone deleted successfully');
        }
    }
    
    // Get all spawn zones
    getSpawnZones() {
        if (!this.editor.currentMap) return [];
        
        return this.editor.currentMap.spawnZones || [];
    }
    
    // Get spawn zones in position range
    getSpawnZonesInRange(startPosition, endPosition) {
        if (!this.editor.currentMap || !this.editor.currentMap.spawnZones) return [];
        
        return this.editor.currentMap.spawnZones.filter(zone => 
            (zone.startPosition >= startPosition && zone.startPosition <= endPosition) ||
            (zone.endPosition >= startPosition && zone.endPosition <= endPosition) ||
            (zone.startPosition <= startPosition && zone.endPosition >= endPosition)
        );
    }
    
    // Validate entity placement
    validateEntityPlacement(type, lane, position) {
        if (!this.editor.currentMap) return false;
        
        // Check if entity is within map bounds
        if (position < 0 || position > this.editor.currentMap.length) {
            return false;
        }
        
        // Check if lane is valid
        if (lane < 0 || lane >= this.editor.laneCount) {
            return false;
        }
        
        // Check if entity type is valid for the lane
        if (type === 'bonus' && lane !== 0) {
            return false;
        }
        
        if (type !== 'bonus' && lane === 0) {
            return false;
        }
        
        return true;
    }
    
    // Get entity count by type
    getEntityCountByType(type) {
        if (!this.editor.currentMap) return 0;
        
        return this.editor.currentMap.objects.filter(entity => entity.type === type).length;
    }
    
    // Get entity count by object type
    getEntityCountByObjectType(objectType) {
        if (!this.editor.currentMap) return 0;
        
        return this.editor.currentMap.objects.filter(entity => entity.objectType === objectType).length;
    }
    
    // Get entity count by lane
    getEntityCountByLane(lane) {
        if (!this.editor.currentMap) return 0;
        
        return this.editor.currentMap.objects.filter(entity => entity.lane === lane).length;
    }
    
    // Get entity density in a position range
    getEntityDensityInRange(startPosition, endPosition) {
        if (!this.editor.currentMap) return 0;
        
        const entitiesInRange = this.getEntitiesInPositionRange(startPosition, endPosition);
        const rangeLength = endPosition - startPosition;
        
        return entitiesInRange.length / rangeLength;
    }
    
    // Check if a position is occupied
    isPositionOccupied(lane, position, radius = 20) {
        if (!this.editor.currentMap) return false;
        
        for (const entity of this.editor.currentMap.objects) {
            if (entity.lane === lane) {
                const distance = Math.abs(entity.position - position);
                if (distance < radius) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Find nearest entity to a position
    findNearestEntity(lane, position) {
        if (!this.editor.currentMap) return null;
        
        let nearestEntity = null;
        let nearestDistance = Infinity;
        
        for (const entity of this.editor.currentMap.objects) {
            if (entity.lane === lane) {
                const distance = Math.abs(entity.position - position);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestEntity = entity;
                }
            }
        }
        
        return nearestEntity;
    }
    
    // Find entities within a radius
    findEntitiesWithinRadius(lane, position, radius) {
        if (!this.editor.currentMap) return [];
        
        return this.editor.currentMap.objects.filter(entity => {
            if (entity.lane === lane) {
                const distance = Math.abs(entity.position - position);
                return distance <= radius;
            }
            return false;
        });
    }
}