/**
 * Map Editor Event Handler
 * Handles all user input events for the map editor
 */
export class MapEditorEventHandler {
    constructor(editor) {
        this.editor = editor;
    }
    
    // Initialize event listeners
    initEventListeners() {
        // Canvas click event
        this.editor.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        
        // Canvas double click event
        this.editor.canvas.addEventListener('dblclick', this.handleCanvasDblClick.bind(this));
        
        // Canvas mouse down event
        this.editor.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        
        // Canvas mouse move event
        this.editor.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Canvas mouse up event
        this.editor.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Canvas wheel event for scrolling
        this.editor.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    // Handle canvas click
    handleCanvasClick(event) {
        const rect = this.editor.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (this.editor.mode === 'list') {
            this.handleMapListClick(x, y);
        } else if (this.editor.mode === 'edit') {
            this.handleMapEditorClick(x, y);
        }
    }
    
    // Handle map list click
    handleMapListClick(x, y) {
        // Check if a map was clicked
        const headerHeight = 60;
        const mapItemHeight = 40;
        const mapItemPadding = 5;
        
        // Calculate which map was clicked based on scroll position
        const clickedIndex = Math.floor((y - headerHeight) / (mapItemHeight + mapItemPadding)) + this.editor.renderer.mapListScrollOffset;
        
        if (clickedIndex >= 0 && clickedIndex < this.editor.maps.length) {
            if (x >= 20 && x <= this.editor.canvas.width - 40 && 
                y >= headerHeight && y <= this.editor.canvas.height - 60) {
                this.editor.currentMap = this.editor.maps[clickedIndex];
                this.editor.mode = 'edit';
                this.editor.viewportOffset = 0;
                this.editor.render();
                return;
            }
        }
    }
    
    // Handle map editor click
    handleMapEditorClick(x, y) {
        if (!this.editor.currentMap) return;
        
        // Check if an entity was clicked
        const clickedEntity = this.findEntityAtPosition(x, y);
        
        if (clickedEntity) {
            // Select the entity
            this.editor.selectedEntity = clickedEntity;
            this.editor.ui.updateDeleteButtonVisibility();
            this.editor.ui.updateEntityList();
            this.editor.render();
        } else {
            // Place a new entity at the clicked position
            const lane = Math.floor(y / this.editor.laneHeight);
            const position = Math.round(x + this.editor.viewportOffset);
            
            // Validate lane based on entity type
            if (this.editor.ui.selectedEntityType === 'bonus' && lane !== 0) {
                alert('Bonuses can only be placed in the bonus lane (lane 0)');
                return;
            } else if (this.editor.ui.selectedEntityType !== 'bonus' && lane === 0) {
                alert('Only bonuses can be placed in the bonus lane (lane 0)');
                return;
            }
            
            // Check if position is within extended map bounds
            if (position < 0 || position > this.editor.currentMap.extendedLength) {
                alert(`Position must be between 0 and ${this.editor.currentMap.extendedLength}`);
                return;
            }
            
            console.log(`Adding entity with variant: ${this.editor.ui.selectedVariant}`);
            
            // Add the entity
            this.editor.addEntity(
                this.editor.ui.selectedEntityType,
                this.editor.ui.selectedObjectType,
                this.editor.ui.selectedVariant,
                lane,
                position
            );
        }
    }
    
    // Handle canvas double click
    handleCanvasDblClick(event) {
        if (this.editor.mode !== 'edit' || !this.editor.currentMap) return;
        
        const rect = this.editor.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if an entity was double-clicked
        const clickedEntity = this.findEntityAtPosition(x, y);
        
        if (clickedEntity) {
            // Show properties dialog for the entity
            this.editor.ui.showEntityPropertiesDialog(clickedEntity);
        }
    }
    
    // Handle mouse down
    handleMouseDown(event) {
        if (this.editor.mode !== 'edit' || !this.editor.currentMap) return;
        
        const rect = this.editor.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if an entity was clicked
        const clickedEntity = this.findEntityAtPosition(x, y);
        
        if (clickedEntity) {
            // Start dragging the entity
            this.editor.draggedEntity = clickedEntity;
            this.editor.selectedEntity = clickedEntity;
            this.editor.ui.updateDeleteButtonVisibility();
            this.editor.ui.updateEntityList();
            this.editor.render();
        }
    }
    
    // Handle mouse move
    handleMouseMove(event) {
        if (this.editor.mode !== 'edit' || !this.editor.currentMap || !this.editor.draggedEntity) return;
        
        const rect = this.editor.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Update entity position
        const lane = Math.floor(y / this.editor.laneHeight);
        const position = Math.round(x + this.editor.viewportOffset);
        
        // Validate lane based on entity type
        if (this.editor.draggedEntity.type === 'bonus' && lane !== 0) {
            // Don't allow dragging bonus entities out of the bonus lane
            this.editor.draggedEntity.lane = 0;
        } else if (this.editor.draggedEntity.type !== 'bonus' && lane === 0) {
            // Don't allow dragging non-bonus entities into the bonus lane
            this.editor.draggedEntity.lane = 1;
        } else {
            // Update lane
            this.editor.draggedEntity.lane = lane;
        }
        
        // Update position
        this.editor.draggedEntity.position = position;
        
        // Update UI
        this.editor.ui.updateEntityList();
        this.editor.render();
    }
    
    // Handle mouse up
    handleMouseUp() {
        // Stop dragging
        this.editor.draggedEntity = null;
    }
    
    // Handle key down
    handleKeyDown(event) {
        if (this.editor.mode !== 'edit' || !this.editor.currentMap) return;
        
        switch (event.key) {
            case 'ArrowLeft':
                this.editor.scrollLeft();
                break;
            case 'ArrowRight':
                this.editor.scrollRight();
                break;
            case 'Delete':
                this.editor.deleteSelectedEntity();
                break;
            case 'Home':
                // Scroll to start of map
                this.editor.viewportOffset = 0;
                this.editor.render();
                break;
            case 'End':
                // Scroll to end of extended map
                if (this.editor.currentMap) {
                    this.editor.viewportOffset = Math.max(0, this.editor.currentMap.extendedLength - this.editor.gameWidth);
                    this.editor.render();
                }
                break;
            case 'f':
                // Scroll to finish line
                if (this.editor.currentMap) {
                    this.editor.viewportOffset = Math.max(0, this.editor.currentMap.length - (this.editor.gameWidth / 2));
                    this.editor.render();
                }
                break;
        }
    }
    
    // Handle wheel event for scrolling
    handleWheel(event) {
        event.preventDefault();
        
        if (this.editor.mode === 'list') {
            // Scroll map list
            const scrollAmount = event.deltaY > 0 ? 1 : -1;
            this.editor.renderer.scrollMapList(scrollAmount);
        } else if (this.editor.mode === 'edit') {
            // Horizontal scrolling in edit mode
            if (event.deltaY > 0) {
                this.editor.scrollRight();
            } else {
                this.editor.scrollLeft();
            }
        }
    }
    
    // Find entity at position
    findEntityAtPosition(x, y) {
        if (!this.editor.currentMap) return null;
        
        const lane = Math.floor(y / this.editor.laneHeight);
        const position = x + this.editor.viewportOffset;
        
        // Check each entity
        for (const entity of this.editor.currentMap.objects) {
            if (entity.lane === lane) {
                const entityX = entity.position - this.editor.viewportOffset;
                const entityY = entity.lane * this.editor.laneHeight + this.editor.laneHeight / 2;
                
                // Calculate distance for circular entities
                const distance = Math.sqrt(Math.pow(x - entityX, 2) + Math.pow(y - entityY, 2));
                
                // Different hit detection based on entity type
                if (entity.type === 'enemy') {
                    // Circular hit detection for enemies
                    let radius = 15;
                    if (entity.objectType === 'Giant') {
                        radius = 20;
                    } else if (entity.variant === 'Crawler') {
                        radius = 10;
                    }
                    
                    if (distance <= radius) {
                        return entity;
                    }
                } else if (entity.type === 'obstacle') {
                    // Rectangular hit detection for obstacles
                    let width = 30;
                    let height = 30;
                    
                    if (entity.objectType === 'Small') {
                        width = 20;
                        height = 20;
                    } else if (entity.objectType === 'Large') {
                        width = 40;
                        height = 40;
                    }
                    
                    if (x >= entityX - width/2 && x <= entityX + width/2 &&
                        y >= entityY - height/2 && y <= entityY + height/2) {
                        return entity;
                    }
                } else if (entity.type === 'bonus') {
                    // Use circular hit detection for bonuses too
                    if (distance <= 15) {
                        return entity;
                    }
                }
            }
        }
        
        return null;
    }
}