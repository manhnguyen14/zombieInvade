/**
 * Map Editor for Zombie Lane Defense
 * Allows creating, editing and saving custom maps
 */
import { ServiceLocator } from '../core/service-locator.js';
import { LaneComponent } from '../entities/components/lane.js';
import { TransformComponent } from '../entities/components/transform.js';
import { RenderComponent } from '../entities/components/render.js';
import { EntityFactory } from '../entities/entity-factory.js';
import { MapEditorUI } from './ui/map-editor-ui.js';
import { MapEditorRenderer } from './rendering/map-editor-renderer.js';
import { MapEditorEventHandler } from './events/map-editor-event-handler.js';
import { MapStorage } from './storage/map-storage.js';
import { EntityManager } from './entities/entity-manager.js';

export class MapEditor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Initialize storage
        this.storage = new MapStorage();
        
        // Load maps from storage
        this.maps = this.storage.loadMaps();
        
        this.currentMap = null;
        this.selectedEntity = null;
        this.draggedEntity = null;
        this.mode = 'list'; // 'list', 'create', 'edit'
        this.laneCount = 9;
        this.laneHeight = 60;
        this.viewportOffset = 0; // Horizontal scrolling offset
        this.scrollSpeed = 50;
        this.showEntityList = true; // Toggle entity list visibility
        
        // Game screen dimensions (unobstructed)
        this.gameWidth = 800;
        this.gameHeight = 600;
        
        // Entity counter for assigning IDs
        this.entityIdCounter = 1;
        
        // Initialize sub-modules
        this.ui = new MapEditorUI(this);
        this.renderer = new MapEditorRenderer(this);
        this.eventHandler = new MapEditorEventHandler(this);
        this.entityManager = new EntityManager(this);
        
        // Initialize the editor
        this.init();
    }
    
    // Initialize the editor
    init() {
        // Create UI elements
        this.ui.createExternalUI();
        
        // Initialize event listeners
        this.eventHandler.initEventListeners();
        
        // Load any saved maps
        this.loadSavedMaps();
        
        // Reset map list scroll position
        if (this.renderer) {
            this.renderer.mapListScrollOffset = 0;
        }
        
        // Initial render
        this.render();
    }
    
    // Load any previously saved maps
    loadSavedMaps() {
        const savedMaps = this.storage.loadMaps();
        if (savedMaps && savedMaps.length > 0) {
            this.maps = savedMaps;
        }
    }
    
    // Create a new map
    createMap(name, length, extendedLength) {
        const newMap = {
            name,
            length,
            extendedLength: extendedLength || length, // Default to regular length if not specified
            objects: [],
            spawnZones: []
        };

        this.maps.push(newMap);
        this.currentMap = newMap;
        this.mode = 'edit';
        this.viewportOffset = 0;
        this.ui.updateUIVisibility(); // Update UI visibility
        this.render();
    }
    
    // Add entity to current map
    addEntity(type, objectType, variant, lane, position, embeddedBonus = null) {
        if (!this.currentMap) return;

        console.log(`Input to add entity: ${type} (${objectType}, ${variant}) at lane ${lane}, position ${position}`);
        if (embeddedBonus) {
            console.log(`With embedded bonus: ${embeddedBonus.type} (${embeddedBonus.variant})`);
        }

        // Validate lane based on entity type
        if (type === 'bonus' && lane !== 0) {
            console.log('Correcting lane for bonus entity to 0');
            lane = 0;
        } else if (type !== 'bonus' && lane === 0) {
            console.log('Correcting lane for non-bonus entity to 1');
            lane = 1;
        }

        // Check if position is within extended map bounds
        if (position < 0 || position > this.currentMap.extendedLength) {
            alert(`Position must be between 0 and ${this.currentMap.extendedLength}`);
            return;
        }

        // For bonus entities, ensure we're using the correct variant
        if (type === 'bonus' && objectType === 'gun') {
            // Default to ak47 for gun bonuses if not specified
            variant = variant || 'ak47';
            console.log(`Using variant for gun bonus: ${variant}`);
        }

        const entity = {
            id: this.entityIdCounter++,
            type,
            objectType,
            variant,
            lane,
            position,
            embeddedBonus
        };

        console.log(`[clickAction] Adding ${type} (${objectType}, ${variant}) at lane ${lane}, position ${position}`);
        this.currentMap.objects.push(entity);
        this.selectedEntity = entity;
        this.ui.updateEntityList();
        this.render();
    }
    
    // Delete selected entity
    deleteSelectedEntity() {
        if (!this.selectedEntity || !this.currentMap) return;

        const index = this.currentMap.objects.indexOf(this.selectedEntity);
        if (index >= 0) {
            this.currentMap.objects.splice(index, 1);
            this.selectedEntity = null;
            this.ui.updateDeleteButtonVisibility();
            this.ui.updateEntityList();
            this.render();
        }
    }
    
    // Center viewport on an entity
    centerViewportOnEntity(entity) {
        if (!entity) return;
        
        const centerX = this.gameWidth / 2;
        this.viewportOffset = Math.max(0, entity.position - centerX);
        
        // Ensure we don't scroll past the end of the extended map
        if (this.currentMap) {
            const maxOffset = Math.max(0, this.currentMap.extendedLength - this.gameWidth);
            this.viewportOffset = Math.min(this.viewportOffset, maxOffset);
        }
        
        this.render();
    }
    
    // Scroll viewport left
    scrollLeft() {
        this.viewportOffset = Math.max(0, this.viewportOffset - this.scrollSpeed);
        this.render();
    }

    // Scroll viewport right
    scrollRight() {
        if (this.currentMap) {
            const maxOffset = Math.max(0, this.currentMap.extendedLength - this.gameWidth);
            this.viewportOffset = Math.min(maxOffset, this.viewportOffset + this.scrollSpeed);
            this.render();
        }
    }
    
    // Show dialog to create a new map
    showCreateMapDialog() {
        const name = prompt('Enter map name:');
        if (!name) return;

        const length = parseInt(prompt('Enter map length (in pixels) - This is where the finish line will be placed:'));
        if (isNaN(length) || length <= 0) return;

        const extendedLength = parseInt(prompt('Enter extended map length (in pixels) - This is the total area where entities can be placed:'));
        if (isNaN(extendedLength) || extendedLength < length) {
            alert('Extended length must be greater than or equal to the regular length');
            return;
        }

        this.createMap(name, length, extendedLength);
    }
    
    // Play the current map
    playCurrentMap() {
        if (!this.currentMap) {
            alert('Please create or select a map first');
            return;
        }
        
        this.storage.saveMapToLocalStorage(this.currentMap, 'currentPlayMap');
        window.open('../ui/gameplay.html', '_blank');
    }

    // Debug the current map
    debugCurrentMap() {
        if (!this.currentMap) {
            alert('Please create or select a map first');
            return;
        }
        
        this.storage.saveMapToLocalStorage(this.currentMap, 'debugMapData');
        window.open('../../tests/manual/ecs-step-test.html', '_blank');
    }
    
    // Render the map editor
    render() {
        this.renderer.render();
        this.ui.updateUIVisibility(); // Update UI visibility when rendering
    }
}
