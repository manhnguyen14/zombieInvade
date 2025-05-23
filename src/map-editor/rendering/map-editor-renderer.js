/**
 * Map Editor Renderer
 * Handles all rendering for the map editor
 */
export class MapEditorRenderer {
    constructor(editor) {
        this.editor = editor;
        this.ctx = editor.ctx;
        
        // Map list scrolling
        this.mapListScrollOffset = 0;
        this.maxMapsVisible = 10; // Maximum number of maps visible at once
    }
    
    // Render the map editor
    render() {
        this.ctx.clearRect(0, 0, this.editor.canvas.width, this.editor.canvas.height);

        if (this.editor.mode === 'list') {
            this.renderMapList();
        } else if (this.editor.mode === 'edit') {
            this.renderMapEditor();
        }
    }
    
    // Render the map list
    renderMapList() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.editor.canvas.width, this.editor.canvas.height);

        // Title
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillText('Zombie Lane Defense - Map Editor', 20, 30);

        // Calculate available height for map list (leave space at bottom for buttons)
        const buttonAreaHeight = 60; // Space reserved for buttons
        const headerHeight = 60; // Space for title and instructions
        const mapItemHeight = 40; // Height of each map item
        const mapItemPadding = 5; // Padding between map items
        
        // Calculate how many maps can be displayed
        this.maxMapsVisible = Math.floor((this.editor.canvas.height - buttonAreaHeight - headerHeight) / (mapItemHeight + mapItemPadding));
        
        // Draw scrollbar if needed
        if (this.editor.maps.length > this.maxMapsVisible) {
            this.renderScrollbar();
        }
        
        // Instructions for scrolling
        if (this.editor.maps.length > this.maxMapsVisible) {
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = '#bdc3c7';
            this.ctx.fillText('Use mouse wheel to scroll through maps', 20, 50);
        }

        // Render visible maps
        const startIndex = this.mapListScrollOffset;
        const endIndex = Math.min(startIndex + this.maxMapsVisible, this.editor.maps.length);
        
        this.ctx.font = '18px Arial';
        
        for (let i = startIndex; i < endIndex; i++) {
            const displayIndex = i - startIndex;
            const y = displayIndex * (mapItemHeight + mapItemPadding) + headerHeight;

            this.ctx.fillStyle = '#3498db';
            this.ctx.fillRect(20, y, this.editor.canvas.width - 40, 30);

            this.ctx.fillStyle = '#ecf0f1';
            this.ctx.fillText(this.editor.maps[i].name, 30, y + 22);
        }
    }
    
    // Render scrollbar for map list
    renderScrollbar() {
        const buttonAreaHeight = 60;
        const headerHeight = 60;
        const scrollbarWidth = 10;
        const scrollbarHeight = this.editor.canvas.height - buttonAreaHeight - headerHeight;
        const scrollbarX = this.editor.canvas.width - 20;
        const scrollbarY = headerHeight;
        
        // Draw scrollbar track
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight);
        
        // Calculate thumb size and position
        const thumbRatio = this.maxMapsVisible / this.editor.maps.length;
        const thumbHeight = Math.max(30, scrollbarHeight * thumbRatio);
        const thumbY = scrollbarY + (scrollbarHeight - thumbHeight) * (this.mapListScrollOffset / Math.max(1, this.editor.maps.length - this.maxMapsVisible));
        
        // Draw scrollbar thumb
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
    }
    
    // Scroll the map list
    scrollMapList(delta) {
        if (this.editor.maps.length <= this.maxMapsVisible) return;
        
        // Calculate new scroll offset
        this.mapListScrollOffset = Math.max(0, Math.min(
            this.editor.maps.length - this.maxMapsVisible,
            this.mapListScrollOffset + delta
        ));
        
        this.render();
    }
    
    // Render the map editor
    renderMapEditor() {
        // Draw background
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.editor.gameWidth, this.editor.gameHeight);

        // Draw lanes
        for (let i = 0; i < this.editor.laneCount; i++) {
            this.ctx.fillStyle = i === 0
                ? '#1f1f1f'  // Bonus lane (darker)
                : '#0d0d0d'; // Combat lanes
            this.ctx.fillRect(0, i * this.editor.laneHeight, this.editor.gameWidth, this.editor.laneHeight);

            // Draw lane number
            this.ctx.fillStyle = '#ecf0f1';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Lane ${i}${i === 0 ? ' (Bonus)' : ''}`, 5, i * this.editor.laneHeight + 15);
        }

        // Draw vertical position markers
        if (this.editor.currentMap) {
            const interval = 100; // Draw markers every 100 pixels
            const startPos = Math.floor(this.editor.viewportOffset / interval) * interval;
            
            for (let pos = startPos; pos < startPos + this.editor.gameWidth + interval; pos += interval) {
                if (pos < 0 || pos > this.editor.currentMap.extendedLength) continue;
                
                const x = pos - this.editor.viewportOffset;
                if (x < 0 || x > this.editor.gameWidth) continue;
                
                this.ctx.fillStyle = '#3498db';
                this.ctx.fillRect(x, 0, 1, this.editor.laneCount * this.editor.laneHeight);
                
                this.ctx.fillStyle = '#ecf0f1';
                this.ctx.font = '10px Arial';
                this.ctx.fillText(pos.toString(), x + 2, 10);
            }
        }

        // Draw entities
        if (this.editor.currentMap) {
            for (const obj of this.editor.currentMap.objects) {
                // Only draw entities that are within the viewport
                const adjustedPosition = obj.position - this.editor.viewportOffset;
                if (adjustedPosition >= -50 && adjustedPosition <= this.editor.gameWidth + 50) {
                    this.drawEntity(obj, adjustedPosition);
                }
            }
        }

        // Draw finish line
        this.renderFinishLine();

        // Draw map info
        if (this.editor.currentMap) {
            this.ctx.fillStyle = '#ecf0f1';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`Map: ${this.editor.currentMap.name}`, 10, 20);
            this.ctx.fillText(`Viewport: ${this.editor.viewportOffset} - ${this.editor.viewportOffset + this.editor.gameWidth}`, 10, 40);
            this.ctx.fillText(`Finish Line: ${this.editor.currentMap.length}px`, 10, 60);
            this.ctx.fillText(`Extended Length: ${this.editor.currentMap.extendedLength}px`, 10, 80);
        }
    }
    
    // Draw an entity on the canvas
    drawEntity(entity, position) {
        const x = position;
        const y = entity.lane * this.editor.laneHeight + this.editor.laneHeight / 2;

        // Draw different shapes based on entity type
        this.ctx.beginPath();

        if (entity.type === 'enemy') {
            // Draw enemy as a circle with different colors based on type
            if (entity.objectType === 'Normal') {
                this.ctx.fillStyle = '#e74c3c'; // Red
            } else if (entity.objectType === 'Armored') {
                this.ctx.fillStyle = '#7f8c8d'; // Gray
            } else if (entity.objectType === 'Giant') {
                this.ctx.fillStyle = '#8e44ad'; // Purple
            }
            
            // Draw different sized circles based on variant
            let radius = 15;
            if (entity.objectType === 'Giant') {
                radius = 20;
            } else if (entity.variant === 'Crawler') {
                radius = 10;
            } else if (entity.variant === 'Runner') {
                radius = 12;
            }
            
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        } else if (entity.type === 'obstacle') {
            // Draw obstacle as a rectangle with different sizes based on type
            this.ctx.fillStyle = '#f39c12'; // Orange
            
            let width = 30;
            let height = 30;
            
            if (entity.objectType === 'Small') {
                width = 20;
                height = 20;
            } else if (entity.objectType === 'Large') {
                width = 40;
                height = 40;
            }
            
            this.ctx.rect(x - width/2, y - height/2, width, height);
        } else if (entity.type === 'bonus') {
            // Draw bonus as a triangle or special shape
            if (entity.objectType === 'Soldier') {
                this.ctx.fillStyle = '#2ecc71'; // Green
                // Draw a triangle
                this.ctx.moveTo(x, y - 15);
                this.ctx.lineTo(x + 15, y + 15);
                this.ctx.lineTo(x - 15, y + 15);
            } else if (entity.objectType === 'Gun') {
                this.ctx.fillStyle = '#3498db'; // Blue
                // Draw a diamond
                this.ctx.moveTo(x, y - 15);
                this.ctx.lineTo(x + 15, y);
                this.ctx.lineTo(x, y + 15);
                this.ctx.lineTo(x - 15, y);
            } else if (entity.objectType === 'Grenade') {
                this.ctx.fillStyle = '#e67e22'; // Orange
                // Draw a pentagon
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                    const px = x + 15 * Math.cos(angle);
                    const py = y + 15 * Math.sin(angle);
                    if (i === 0) {
                        this.ctx.moveTo(px, py);
                    } else {
                        this.ctx.lineTo(px, py);
                    }
                }
            }
        }

        this.ctx.fill();

        // Draw entity info
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '10px Arial';
        this.ctx.fillText(`${entity.id}`, x - 15, y - 5);

        // Highlight selected entity
        if (entity === this.editor.selectedEntity) {
            this.ctx.strokeStyle = '#3498db';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    // Modify the renderFinishLine method to clearly distinguish between finish line and extended boundary
    renderFinishLine() {
        if (!this.editor.currentMap) return;
        
        const finishLinePosition = this.editor.currentMap.length - this.editor.viewportOffset;
        
        // Only draw if visible on screen
        if (finishLinePosition >= 0 && finishLinePosition <= this.editor.gameWidth) {
            // Draw a vertical line
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(finishLinePosition, 0);
            this.ctx.lineTo(finishLinePosition, this.editor.laneCount * this.editor.laneHeight);
            this.ctx.stroke();
            
            // Draw finish text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText('FINISH LINE', finishLinePosition - 40, 20);
        }
        
        // Draw extended map boundary
        const extendedMapEnd = this.editor.currentMap.extendedLength - this.editor.viewportOffset;
        
        // Only draw if visible on screen
        if (extendedMapEnd >= 0 && extendedMapEnd <= this.editor.gameWidth) {
            // Draw a vertical line
            this.ctx.strokeStyle = '#3498db';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(extendedMapEnd, 0);
            this.ctx.lineTo(extendedMapEnd, this.editor.laneCount * this.editor.laneHeight);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Draw text
            this.ctx.fillStyle = '#3498db';
            this.ctx.font = '14px Arial';
            this.ctx.fillText('EXTENDED MAP END', extendedMapEnd - 70, 40);
        }
    }
}
